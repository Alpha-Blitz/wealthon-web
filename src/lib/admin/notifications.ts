import type { SupabaseClient } from '@supabase/supabase-js'
import type { Notification, Partner, Transaction } from '@/types/database'
import { MOCK_COMPANY_ID } from '@/config/constants'
import { TABLE } from '@/config/api'
import { ok, err, type Result } from './index'
import { logAction } from './audit'
import { getFirstPayoutDate } from './calculations'
import { formatINR } from '@/lib/utils'
import { sendEmail } from '@/lib/email/resend'
import {
  capitalReceiptEmail,
  distributionEmail,
  reinvestEmail,
} from '@/lib/email/templates'
import {
  capitalReceivedMessage,
  distributionPaidMessage,
  reinvestConfirmedMessage,
  whatsappLink,
} from '@/lib/notifications/templates'

export interface NotificationInput {
  partner_id: string | null
  title:      string
  body:       string
  type:       'update' | 'distribution' | 'alert' | 'announcement'
}

export async function getNotifications(
  supabase: SupabaseClient,
  limit = 50
): Promise<Result<Notification[]>> {
  const { data, error } = await supabase
    .from(TABLE.NOTIFICATIONS)
    .select('*')
    .eq('company_id', MOCK_COMPANY_ID)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) return err(error.message)
  return ok(data as Notification[])
}

export async function sendNotification(
  supabase: SupabaseClient,
  input: NotificationInput
): Promise<Result<Notification>> {
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from(TABLE.NOTIFICATIONS)
    .insert({
      company_id: MOCK_COMPANY_ID,
      partner_id: input.partner_id,
      title:      input.title,
      body:       input.body,
      type:       input.type,
      is_sent:    true,
      sent_at:    new Date().toISOString(),
      created_by: user?.id ?? null,
    })
    .select()
    .single()

  if (error || !data) return err(error?.message ?? 'Failed to send notification')

  await logAction(supabase, 'notification.send', 'notification', data.id, {
    after: { type: input.type, partner_id: input.partner_id, title: input.title },
  })

  return ok(data as Notification)
}

// ── Transaction-aware notification orchestration ──────────────────────────

export interface TransactionNotificationOptions {
  quarter?:         number
  year?:            number
  previousCapital?: number
  newCapital?:      number
  sendEmailNow?:    boolean   // default true
}

export interface TransactionNotificationResult {
  whatsappUrl: string | null
  message:     string
  emailSent:   boolean
  emailError:  string | null
}

/**
 * Builds + sends notification for a single transaction. Email goes via Resend
 * (logs only if RESEND_API_KEY is unset). WhatsApp returns a wa.me URL the
 * admin must click — automated WhatsApp Business API is a future phase.
 * TODO: Replace WhatsApp URL flow with WhatsApp Business API.
 */
export async function sendTransactionNotification(
  supabase: SupabaseClient,
  transactionId: string,
  options: TransactionNotificationOptions = {},
): Promise<Result<TransactionNotificationResult>> {
  const { data: tx, error: txErr } = await supabase
    .from(TABLE.TRANSACTIONS)
    .select('*, partners(*)')
    .eq('id', transactionId)
    .single()
  if (txErr || !tx) return err(txErr?.message ?? 'Transaction not found')

  const transaction = tx as Transaction & { partners: Partner }
  const partner = transaction.partners

  const sendEmailNow = options.sendEmailNow ?? true

  const year    = options.year    ?? new Date(transaction.date).getFullYear()
  const quarter = options.quarter ?? Math.ceil((new Date(transaction.date).getMonth() + 1) / 3)
  const bankLast4 = partner.bank_account_number?.slice(-4) ?? '----'

  let message: string
  let subject: string
  let html:    string

  switch (transaction.type) {
    case 'capital_in':
    case 'investment': {
      const firstPayout = getFirstPayoutDate(new Date(transaction.date))
        .toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      message = capitalReceivedMessage(partner.full_name, transaction.amount, firstPayout)
      const built = capitalReceiptEmail(partner, transaction, transaction.invoice_url)
      subject = built.subject
      html    = built.html
      break
    }
    case 'distribution': {
      message = distributionPaidMessage(partner.full_name, transaction.amount, quarter, year, bankLast4)
      const built = distributionEmail(partner, transaction, quarter, year, transaction.invoice_url)
      subject = built.subject
      html    = built.html
      break
    }
    case 'reinvest':
    case 'pnl_update': {
      const prev = options.previousCapital ?? Math.max(0, partner.invested_amount - transaction.amount)
      const next = options.newCapital ?? partner.invested_amount
      message = reinvestConfirmedMessage(partner.full_name, transaction.amount, next)
      const built = reinvestEmail(partner, transaction, prev, next, quarter, year, transaction.invoice_url)
      subject = built.subject
      html    = built.html
      break
    }
    default:
      return err(`Notifications are not configured for transaction type "${transaction.type}".`)
  }

  // Email send
  let emailSent = false
  let emailError: string | null = null
  if (sendEmailNow && partner.email) {
    const result = await sendEmail({ to: partner.email, subject, html })
    if (result.error) {
      emailError = result.error
    } else {
      emailSent = true
    }
  }

  // Update transaction sent state on email success
  if (emailSent) {
    const existing = transaction.invoice_sent_via ?? []
    const via = existing.includes('email') ? existing : [...existing, 'email']
    await supabase
      .from(TABLE.TRANSACTIONS)
      .update({ invoice_sent_at: new Date().toISOString(), invoice_sent_via: via })
      .eq('id', transactionId)
  }

  const whatsappUrl = partner.phone ? whatsappLink(partner.phone, message) : null

  await logAction(supabase, 'notification.transaction.send', 'transaction', transactionId, {
    after: { emailSent, type: transaction.type },
  })

  return ok({ whatsappUrl, message, emailSent, emailError })
}

/**
 * Called after admin clicks the WhatsApp link in the UI — mark transaction
 * as also delivered via WhatsApp.
 */
export async function markWhatsappSent(
  supabase: SupabaseClient,
  transactionId: string,
): Promise<Result<void>> {
  const { data: existing } = await supabase
    .from(TABLE.TRANSACTIONS)
    .select('invoice_sent_via')
    .eq('id', transactionId)
    .single()
  const current: string[] = (existing as { invoice_sent_via: string[] | null } | null)?.invoice_sent_via ?? []
  const via = current.includes('whatsapp') ? current : [...current, 'whatsapp']
  const { error } = await supabase
    .from(TABLE.TRANSACTIONS)
    .update({ invoice_sent_via: via, invoice_sent_at: new Date().toISOString() })
    .eq('id', transactionId)
  if (error) return err(error.message)
  await logAction(supabase, 'notification.whatsapp.click', 'transaction', transactionId, {
    after: { via: 'whatsapp' },
  })
  return ok(undefined)
}

// ── Registration alert ─────────────────────────────────────────────────────

/**
 * Sent to Prathik when a prospect completes the private /apply/[token]
 * onboarding form. Includes full KYC + banking. Capital is still PENDING
 * (intended amount, not received).
 */
export async function sendRegistrationAlert(
  supabase: SupabaseClient,
  partner: Partner,
  intendedCapital: number,
  monthlyPayoutEstimate: number,
): Promise<void> {
  const base       = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://www.wealthonventures.com'
  const partnerUrl = `${base}/admin/partners/${partner.id}`
  const last4      = partner.bank_account_number?.slice(-4) ?? '----'

  // Look up firm rate at message-build time so the snapshot is current
  const { data: setting } = await supabase
    .from(TABLE.APP_SETTINGS)
    .select('value').eq('key', 'default_monthly_rate').maybeSingle()
  const ratePct = setting?.value ? Number(setting.value).toFixed(2) : '2.50'

  // First payout estimate: today + lock-in (months) + 1 (end of next month)
  const lockMatch = (partner.lock_in_period ?? '3_months').match(/^(\d+)/)
  const lockMonths = lockMatch ? Number(lockMatch[1]) : 3
  const firstPayout = new Date()
  firstPayout.setMonth(firstPayout.getMonth() + lockMonths + 1)
  firstPayout.setDate(0)
  const firstPayoutLabel = firstPayout.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

  // ── WhatsApp message body ──
  const waMessage = [
    'New partner application — Wealthon CRM',
    '',
    `Name: ${partner.full_name}`,
    `WhatsApp: ${partner.phone ?? '—'}`,
    `Email: ${partner.email}`,
    `Capital: ${formatINR(intendedCapital)}`,
    `Tier: ${partner.tier}`,
    `Payout: ${partner.payout_preference === 'payout' ? 'Monthly' : 'Reinvest'}`,
    `PAN: ${partner.pan_number ?? '—'}`,
    `Bank: ${partner.bank_name ?? '—'} a/c ending ${last4}`,
    `IFSC: ${partner.bank_ifsc ?? '—'}`,
    '',
    `Est. monthly payout: ${formatINR(monthlyPayoutEstimate)}`,
    `(at ${ratePct}%/month, ${partner.profit_share_ratio}% to partner)`,
    '',
    `First payout: ${firstPayoutLabel}`,
    '',
    'Status: PENDING — capital not received yet.',
    '',
    `Admin: ${partnerUrl}`,
  ].join('\n')

  const prathikWa = process.env.PRATHIK_WHATSAPP
  if (prathikWa) {
    // The wa.me URL is logged for our records; UI also surfaces it via the
    // notifications panel. No automated WhatsApp API yet.
    console.warn('[registration] WhatsApp:', whatsappLink(prathikWa, waMessage))
  }

  // ── Email ──
  const subject = `New Application: ${partner.full_name} — ${formatINR(intendedCapital)} — Wealthon`
  const html = buildRegistrationEmailHtml({
    partner, intendedCapital, monthlyPayoutEstimate,
    ratePct, lockMonths, firstPayoutLabel,
    partnerUrl,
  })

  const recipients = new Set<string>()
  if (process.env.PRATHIK_EMAIL) recipients.add(process.env.PRATHIK_EMAIL)
  if (process.env.ADMIN_EMAIL)   recipients.add(process.env.ADMIN_EMAIL)
  for (const to of recipients) {
    await sendEmail({ to, subject, html })
  }

  await logAction(supabase, 'partner.registration_alert', 'partner', partner.id, {
    after: { intendedCapital, monthlyPayoutEstimate, ratePct },
  })
}

interface RegEmailParams {
  partner: Partner
  intendedCapital: number
  monthlyPayoutEstimate: number
  ratePct: string
  lockMonths: number
  firstPayoutLabel: string
  partnerUrl: string
}

function buildRegistrationEmailHtml(p: RegEmailParams): string {
  const last4 = p.partner.bank_account_number?.slice(-4) ?? '----'
  const partnerWa = p.partner.phone ? `https://wa.me/${p.partner.phone.replace(/[^0-9]/g, '')}` : null

  const left: [string, string][] = [
    ['Full Name',     p.partner.full_name],
    ['WhatsApp',      p.partner.phone ?? '—'],
    ['Email',         p.partner.email],
    ['PAN',           p.partner.pan_number ?? '—'],
    ['Date of Birth', p.partner.date_of_birth ?? '—'],
    ['City/State',    [p.partner.city, p.partner.state].filter(Boolean).join(', ') || '—'],
  ]
  const right: [string, string][] = [
    ['Intended Capital',  formatINR(p.intendedCapital)],
    ['Tier',              p.partner.tier],
    ['Monthly Payout Est.', formatINR(p.monthlyPayoutEstimate)],
    ['Payout Preference', p.partner.payout_preference === 'payout' ? 'Monthly' : 'Reinvest'],
    ['Lock-in',           `${p.lockMonths} months`],
    ['Profit Split',      `${p.partner.profit_share_ratio}% / ${100 - p.partner.profit_share_ratio}%`],
  ]

  const renderRows = (rows: [string, string][]) => rows.map(([k, v]) =>
    `<tr><td style="padding:6px 0;color:#8A8070;font-size:12px;">${k}</td><td style="padding:6px 0;text-align:right;color:#202020;font-size:13px;">${escapeHtml(v)}</td></tr>`,
  ).join('')

  return `<!DOCTYPE html><html><body style="margin:0;background:#F5F5F0;font-family:Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;"><tr><td align="center">
      <table width="640" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border:1px solid rgba(245,166,35,0.2);">
        <tr><td style="background:#080808;padding:28px 24px;">
          <h1 style="margin:0;font-family:Georgia,serif;font-size:20px;color:#F5A623;">WEALTHON CAPITAL VENTURES</h1>
          <p style="margin:6px 0 0;color:#9A9080;font-size:11px;">New Partner Application</p>
        </td></tr>
        <tr><td style="padding:28px 24px;">
          <h2 style="margin:0 0 6px;font-family:Georgia,serif;font-size:24px;color:#202020;">${escapeHtml(p.partner.full_name)}</h2>
          <p style="margin:0 0 20px;color:#8A8070;font-size:12px;">Application submitted just now</p>

          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:20px;">
            <tr>
              <td valign="top" width="50%" style="padding-right:16px;">
                <p style="margin:0 0 8px;color:#F5A623;font-size:10px;letter-spacing:0.1em;text-transform:uppercase;">Personal</p>
                <table width="100%">${renderRows(left)}</table>
              </td>
              <td valign="top" width="50%" style="padding-left:16px;border-left:1px solid #F0F0F0;">
                <p style="margin:0 0 8px;color:#F5A623;font-size:10px;letter-spacing:0.1em;text-transform:uppercase;">Financial</p>
                <table width="100%">${renderRows(right)}</table>
              </td>
            </tr>
          </table>

          <table width="100%" cellpadding="12" cellspacing="0" style="background:#FAF7F0;border:1px solid rgba(245,166,35,0.15);border-radius:6px;margin-bottom:20px;">
            <tr><td>
              <p style="margin:0 0 6px;color:#F5A623;font-size:10px;letter-spacing:0.1em;text-transform:uppercase;">Banking</p>
              <p style="margin:0;color:#202020;font-size:13px;">${escapeHtml(p.partner.bank_name ?? '—')} · A/C ending ${last4} · IFSC ${escapeHtml(p.partner.bank_ifsc ?? '—')}</p>
            </td></tr>
          </table>

          <div style="padding:12px 16px;background:rgba(245,166,35,0.08);border:1px solid rgba(245,166,35,0.3);border-radius:4px;margin-bottom:20px;">
            <p style="margin:0;color:#F5A623;font-size:12px;font-weight:600;">PENDING — Awaiting capital confirmation</p>
            <p style="margin:4px 0 0;color:#5A5A5A;font-size:12px;">First payout estimated: ${escapeHtml(p.firstPayoutLabel)}</p>
          </div>

          <table cellpadding="0" cellspacing="0"><tr>
            <td style="background:#F5A623;border-radius:4px;padding-right:8px;">
              <a href="${p.partnerUrl}" style="display:inline-block;padding:11px 22px;color:#080808;font-weight:600;text-decoration:none;font-size:13px;">View in Admin →</a>
            </td>
            ${partnerWa ? `<td style="background:transparent;border:1px solid #F5A623;border-radius:4px;margin-left:8px;">
              <a href="${partnerWa}" style="display:inline-block;padding:10px 22px;color:#F5A623;text-decoration:none;font-size:13px;">WhatsApp ${escapeHtml(p.partner.full_name.split(' ')[0])} →</a>
            </td>` : ''}
          </tr></table>
        </td></tr>
        <tr><td style="background:#0F0F0F;padding:16px;text-align:center;color:#7F7566;font-size:11px;">
          Wealthon Capital Ventures · CRM Notification
        </td></tr>
      </table>
    </td></tr></table>
  </body></html>`
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))
}
