import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { TABLE } from '@/config/api'
import { MOCK_COMPANY_ID, getTierForAmount, PAN_REGEX, PIN_REGEX, IFSC_REGEX } from '@/config/constants'
import { lookupToken, markTokenUsed } from '@/lib/admin/applyTokens'
import { getFinancialConfig } from '@/lib/admin/settings'
import { sendRegistrationAlert } from '@/lib/admin/notifications'
import type { Partner } from '@/types/database'

interface Payload {
  token: string
  form: {
    full_name:           string
    date_of_birth:       string
    pan_number:          string
    whatsapp:            string
    email:               string
    residential_address: string
    city:                string
    state:               string
    pin_code:            string
    capitalPaise:        number
    payout_preference:   'payout' | 'reinvest'
    account_holder_name: string
    bank_account_number: string
    bank_ifsc:           string
    bank_name:           string
    marketRiskAck:       boolean
    agreementAck:        boolean
  }
}

export async function POST(request: Request) {
  let payload: Payload
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 })
  }

  if (!payload.token || !payload.form) {
    return NextResponse.json({ success: false, error: 'Missing token or form' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const lookup = await lookupToken(supabase, payload.token)
  if (lookup.status !== 'valid') {
    return NextResponse.json({ success: false, error: `Token ${lookup.status}` }, { status: 403 })
  }

  const f = payload.form
  // Server-side validation
  if (!f.full_name?.trim()) return NextResponse.json({ success: false, error: 'Missing name' }, { status: 400 })
  if (!PAN_REGEX.test(f.pan_number?.toUpperCase() ?? '')) return NextResponse.json({ success: false, error: 'Invalid PAN' }, { status: 400 })
  if (!PIN_REGEX.test(f.pin_code ?? '')) return NextResponse.json({ success: false, error: 'Invalid PIN' }, { status: 400 })
  if (!IFSC_REGEX.test(f.bank_ifsc?.toUpperCase() ?? '')) return NextResponse.json({ success: false, error: 'Invalid IFSC' }, { status: 400 })
  if (!f.marketRiskAck || !f.agreementAck) return NextResponse.json({ success: false, error: 'Acknowledgements required' }, { status: 400 })

  const config = await getFinancialConfig(supabase)

  // Validate capital range against settings (defensive)
  if (f.capitalPaise < config.minInvestment || f.capitalPaise > config.maxInvestment) {
    return NextResponse.json({ success: false, error: 'Capital out of range' }, { status: 400 })
  }

  const tier = getTierForAmount(f.capitalPaise)
  const now = new Date()
  const nowIso = now.toISOString()

  // 1. Create partner record (status pending, no user_id yet)
  const initials = f.full_name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase()
  const { data: partnerRow, error: pErr } = await supabase
    .from(TABLE.PARTNERS)
    .insert({
      company_id: MOCK_COMPANY_ID,
      full_name:  f.full_name.trim(),
      initials,
      email:      f.email,
      phone:      f.whatsapp,
      tier:       tier === 'L3' ? 'L3' : tier === 'L2' ? 'L2' : 'L1',
      invested_amount: 0, // confirmed during activation
      entry_date: now.toISOString().split('T')[0],
      status:     'paused', // partner is "pending" — represented via paused until activation
      date_of_birth:       f.date_of_birth,
      pan_number:          f.pan_number.toUpperCase(),
      residential_address: f.residential_address,
      city:                f.city,
      state:               f.state,
      pin_code:            f.pin_code,
      bank_account_number: f.bank_account_number,
      bank_ifsc:           f.bank_ifsc.toUpperCase(),
      bank_name:           f.bank_name,
      account_holder_name: f.account_holder_name || f.full_name.trim(),
      profit_share_ratio:  config.defaultProfitShare,
      lock_in_period:      `${config.lockInMonths}_months`,
      payout_preference:   f.payout_preference,
      contribution_date:   null,
      risk_disclosure_acknowledged_at: nowIso,
      terms_acknowledged_at:           nowIso,
    })
    .select()
    .single()
  if (pErr || !partnerRow) {
    return NextResponse.json({ success: false, error: pErr?.message ?? 'Could not create partner' }, { status: 500 })
  }
  const partner = partnerRow as Partner

  // 2. Create pending CAPITAL_IN transaction
  await supabase
    .from(TABLE.TRANSACTIONS)
    .insert({
      company_id: MOCK_COMPANY_ID,
      partner_id: partner.id,
      date:       now.toISOString().split('T')[0],
      type:       'capital_in',
      amount:     f.capitalPaise,
      status:     'pending',
      notes:      'Intended capital — pending confirmation',
    })

  // 3. Update linked lead stage (if any) — DB constraint uses 'proposal' for application_submitted
  if (lookup.token.lead_id) {
    await supabase
      .from(TABLE.LEADS)
      .update({ stage: 'proposal', updated_at: nowIso })
      .eq('id', lookup.token.lead_id)
  }

  // 4. Mark token used
  await markTokenUsed(supabase, lookup.token.id, partner.id)

  // 5. Calculate monthly payout estimate
  const monthlyPayout = Math.round(
    f.capitalPaise * config.defaultMonthlyRate * (config.defaultProfitShare / 100),
  )

  // 6. Fire registration alert (fire-and-forget; do not block response)
  void sendRegistrationAlert(supabase, partner, f.capitalPaise, monthlyPayout).catch(() => {})

  // 7. First payout estimate
  const firstPayout = new Date(now)
  firstPayout.setMonth(firstPayout.getMonth() + config.lockInMonths + 1)
  firstPayout.setDate(0)

  return NextResponse.json({
    success: true,
    monthlyPayout,
    firstPayoutDate: firstPayout.toISOString(),
  })
}
