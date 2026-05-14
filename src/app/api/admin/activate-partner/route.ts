import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { TABLE } from '@/config/api'
import { MOCK_COMPANY_ID, INVOICE_TYPES } from '@/config/constants'
import { calculateLockInExpiry } from '@/lib/admin/calculations'
import { generateAndSaveInvoice } from '@/lib/admin/invoices'
import { sendTransactionNotification } from '@/lib/admin/notifications'
import { getFinancialConfig } from '@/lib/admin/settings'
import { logAction } from '@/lib/admin/audit'
import { whatsappLink } from '@/lib/notifications/templates'
import { formatINR } from '@/lib/utils'
import type { Partner, Transaction, LockInPeriodValue } from '@/types/database'

interface Payload {
  partnerId:           string
  leadId?:             string | null
  actualCapitalPaise:  number
  contributionDate:    string  // YYYY-MM-DD
}

export async function POST(request: Request) {
  const ssr = await createClient()
  const { data: { user } } = await ssr.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: roleRow } = await ssr.from('admin_roles').select('user_id').eq('user_id', user.id).maybeSingle()
  if (!roleRow) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  let payload: Payload
  try { payload = await request.json() } catch { return NextResponse.json({ error: 'Invalid payload' }, { status: 400 }) }

  if (!payload.partnerId) return NextResponse.json({ error: 'partnerId required' }, { status: 400 })
  if (!payload.actualCapitalPaise || payload.actualCapitalPaise <= 0) return NextResponse.json({ error: 'Capital must be positive' }, { status: 400 })
  if (!payload.contributionDate) return NextResponse.json({ error: 'Date required' }, { status: 400 })

  const admin = createAdminClient()
  const config = await getFinancialConfig(admin)

  // 1. Fetch partner
  const { data: partnerRow } = await admin
    .from(TABLE.PARTNERS).select('*').eq('id', payload.partnerId).eq('company_id', MOCK_COMPANY_ID).single()
  if (!partnerRow) return NextResponse.json({ error: 'Partner not found' }, { status: 404 })
  const partner = partnerRow as Partner

  // 2. Calculate lock-in expiry
  const contributionDate = new Date(payload.contributionDate)
  const lockInPeriod = (partner.lock_in_period ?? `${config.lockInMonths}_months`) as LockInPeriodValue
  const lockInExpiry = calculateLockInExpiry(contributionDate, lockInPeriod)
  const lockInExpiryISO = lockInExpiry ? lockInExpiry.toISOString().split('T')[0] : null

  // 3. Update partner record
  const { data: updatedRow, error: updErr } = await admin
    .from(TABLE.PARTNERS)
    .update({
      status:             'active',
      contribution_date:  payload.contributionDate,
      invested_amount:    payload.actualCapitalPaise,
      lock_in_expiry:     lockInExpiryISO,
      updated_at:         new Date().toISOString(),
    })
    .eq('id', payload.partnerId)
    .select()
    .single()
  if (updErr || !updatedRow) return NextResponse.json({ error: updErr?.message ?? 'Failed to update partner' }, { status: 500 })
  const updatedPartner = updatedRow as Partner

  // 4. Complete the pending CAPITAL_IN transaction (or create one if missing)
  const { data: pendingTx } = await admin
    .from(TABLE.TRANSACTIONS)
    .select('id,amount')
    .eq('partner_id', partner.id)
    .eq('type', 'capital_in')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  let transactionId: string | null = null
  if (pendingTx) {
    transactionId = (pendingTx as { id: string }).id
    await admin.from(TABLE.TRANSACTIONS)
      .update({
        status:          'completed',
        date:            payload.contributionDate,
        amount:          payload.actualCapitalPaise,
        running_balance: payload.actualCapitalPaise,
        notes:           'Initial capital contribution',
      })
      .eq('id', transactionId)
  } else {
    const { data: txRow } = await admin
      .from(TABLE.TRANSACTIONS)
      .insert({
        company_id: MOCK_COMPANY_ID,
        partner_id: partner.id,
        date:       payload.contributionDate,
        type:       'capital_in',
        amount:     payload.actualCapitalPaise,
        status:     'completed',
        notes:      'Initial capital contribution',
        running_balance: payload.actualCapitalPaise,
        created_by: user.id,
      })
      .select()
      .single()
    transactionId = (txRow as Transaction | null)?.id ?? null
  }

  // 5. Generate capital receipt invoice
  let invoiceNumber: string | null = null
  let invoiceUrl:    string | null = null
  if (transactionId) {
    const invoice = await generateAndSaveInvoice(admin, transactionId, INVOICE_TYPES.CAPITAL_RECEIPT)
    if (invoice.data) {
      invoiceNumber = invoice.data.invoiceNumber
      invoiceUrl    = invoice.data.url
    }
  }

  // 6. Send welcome email + return WhatsApp URL
  let whatsappUrl: string | null = null
  let emailSent = false
  if (transactionId) {
    const notif = await sendTransactionNotification(admin, transactionId)
    whatsappUrl = notif.data?.whatsappUrl ?? null
    emailSent   = notif.data?.emailSent ?? false
  }

  // Custom welcome WhatsApp body (overrides generic capital-received template)
  if (updatedPartner.phone) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://www.wealthonventures.com'
    const firstPayout = lockInExpiry
      ? new Date(lockInExpiry).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
      : 'TBD'
    const welcome = `Welcome to Wealthon! Your capital of ${formatINR(payload.actualCapitalPaise)} is confirmed. Your first payout is expected on ${firstPayout}. Access your dashboard: ${baseUrl}/dashboard`
    whatsappUrl = whatsappLink(updatedPartner.phone, welcome)
  }

  // 7. Move lead to active_partner (DB: 'converted')
  if (payload.leadId) {
    await admin.from(TABLE.LEADS)
      .update({ stage: 'converted', updated_at: new Date().toISOString() })
      .eq('id', payload.leadId)
  }

  await logAction(admin, 'partner.activate', 'partner', partner.id, {
    after: { actualCapital: payload.actualCapitalPaise, contributionDate: payload.contributionDate, lockInExpiry: lockInExpiryISO },
  })

  return NextResponse.json({
    success:        true,
    partner:        updatedPartner,
    transactionId,
    invoiceNumber,
    invoiceUrl,
    emailSent,
    whatsappUrl,
    lockInExpiry:   lockInExpiryISO,
  })
}
