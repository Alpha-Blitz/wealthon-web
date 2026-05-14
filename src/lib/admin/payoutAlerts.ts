import type { SupabaseClient } from '@supabase/supabase-js'
import type { Partner } from '@/types/database'
import { getEligibleForPayout, calculateMonthlyPayout } from './capital'
import { getEffectiveRate } from './rates'
import { sendEmail } from '@/lib/email/resend'
import { whatsappLink } from '@/lib/notifications/templates'
import { formatINR } from '@/lib/utils'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export interface PayoutLine {
  partner:    Partner
  amountPaise: number
}

export async function buildPayoutLines(
  supabase: SupabaseClient,
): Promise<{
  lines: PayoutLine[]
  totalPaise: number
  monthLabel: string
}> {
  const now = new Date()
  const { rate } = await getEffectiveRate(supabase, now.getMonth() + 1, now.getFullYear())
  const eligible = await getEligibleForPayout(supabase)
  const lines = eligible.map(p => ({
    partner: p,
    amountPaise: calculateMonthlyPayout(p.invested_amount ?? 0, rate, p.profit_share_ratio),
  })).filter(l => l.amountPaise > 0)
  const totalPaise = lines.reduce((s, l) => s + l.amountPaise, 0)
  const monthLabel = `${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`
  return { lines, totalPaise, monthLabel }
}

// ── Summary alert (15th) — no bank details ────────────────────────────────

export interface SummaryAlertResult {
  emailSent: boolean
  whatsappUrl: string | null
  partnerCount: number
  totalPaise: number
}

export function buildSummaryEmail(lines: PayoutLine[], totalPaise: number, monthLabel: string): { subject: string; html: string } {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://www.wealthonventures.com'
  const distUrl = `${base}/admin/distributions`
  const subject = `${monthLabel} Payout Summary — ${lines.length} partners · ${formatINR(totalPaise)} — Action needed`
  const rows = lines.map(l => `
    <tr>
      <td style="padding:8px 0;color:#202020;font-size:13px;border-bottom:1px solid #F0F0F0;">${esc(l.partner.full_name)}</td>
      <td style="padding:8px 0;text-align:right;color:#5A5A5A;font-size:12px;border-bottom:1px solid #F0F0F0;">${formatINR(l.partner.invested_amount ?? 0)}</td>
      <td style="padding:8px 0;text-align:right;color:#F5A623;font-size:13px;font-weight:600;border-bottom:1px solid #F0F0F0;">${formatINR(l.amountPaise)}</td>
    </tr>
  `).join('')
  const html = `<!DOCTYPE html><html><body style="margin:0;background:#F5F5F0;font-family:Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;"><tr><td align="center">
      <table width="640" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border:1px solid rgba(245,166,35,0.2);">
        <tr><td style="background:#080808;padding:28px 24px;">
          <h1 style="margin:0;font-family:Georgia,serif;font-size:20px;color:#F5A623;">${esc(monthLabel)} Payout Summary</h1>
          <p style="margin:6px 0 0;color:#9A9080;font-size:11px;">Wealthon Capital Ventures · For Suhan</p>
        </td></tr>
        <tr><td style="padding:24px;">
          <p style="margin:0 0 16px;color:#5A5A5A;font-size:14px;">
            Hi Suhan — these are the partners eligible for ${esc(monthLabel)} payouts.
            <strong>This summary contains no bank details</strong>; full details with bank info will be sent on the 20th.
          </p>
          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
            <thead><tr>
              <th align="left" style="padding:6px 0;font-size:11px;color:#F5A623;letter-spacing:0.08em;text-transform:uppercase;border-bottom:2px solid #F5A623;">Partner</th>
              <th align="right" style="padding:6px 0;font-size:11px;color:#F5A623;letter-spacing:0.08em;text-transform:uppercase;border-bottom:2px solid #F5A623;">Capital</th>
              <th align="right" style="padding:6px 0;font-size:11px;color:#F5A623;letter-spacing:0.08em;text-transform:uppercase;border-bottom:2px solid #F5A623;">Payout</th>
            </tr></thead>
            <tbody>${rows}</tbody>
            <tfoot><tr>
              <td colspan="2" style="padding:14px 0;color:#202020;font-size:13px;font-weight:600;">Total</td>
              <td style="padding:14px 0;text-align:right;color:#F5A623;font-size:18px;font-weight:600;">${formatINR(totalPaise)}</td>
            </tr></tfoot>
          </table>
          <p style="margin:24px 0 0;color:#7F7566;font-size:12px;">
            Full details with bank information will be sent on the 20th.
          </p>
          <table cellpadding="0" cellspacing="0" style="margin:16px 0 0;"><tr><td style="background:#F5A623;border-radius:4px;">
            <a href="${distUrl}" style="display:inline-block;padding:11px 22px;color:#080808;font-weight:600;text-decoration:none;font-size:13px;">Run Payouts →</a>
          </td></tr></table>
        </td></tr>
      </table>
    </td></tr></table>
  </body></html>`
  return { subject, html }
}

export function buildSummaryWhatsApp(lines: PayoutLine[], totalPaise: number, monthLabel: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://www.wealthonventures.com'
  const top = `Hi Suhan, ${monthLabel} payout summary:\n\nPartners to pay: ${lines.length}\nTotal: ${formatINR(totalPaise)}\n\n`
  const body = lines.map(l => `${l.partner.full_name}: ${formatINR(l.amountPaise)}`).join('\n')
  const tail = `\n\nFull bank details coming on the 20th.\nRun payouts: ${base}/admin/distributions`
  return top + body + tail
}

export async function sendSummaryAlert(
  supabase: SupabaseClient,
  options: { dryRun?: boolean } = {},
): Promise<SummaryAlertResult> {
  const { lines, totalPaise, monthLabel } = await buildPayoutLines(supabase)
  if (lines.length === 0) {
    return { emailSent: false, whatsappUrl: null, partnerCount: 0, totalPaise: 0 }
  }
  const { subject, html } = buildSummaryEmail(lines, totalPaise, monthLabel)
  let emailSent = false
  const suhanWa = process.env.SUHAN_WHATSAPP
  const suhanEmail = process.env.SUHAN_EMAIL

  if (!options.dryRun && suhanEmail) {
    const res = await sendEmail({ to: suhanEmail, subject, html })
    emailSent = !res.error
  }

  const whatsappUrl = suhanWa
    ? whatsappLink(suhanWa, buildSummaryWhatsApp(lines, totalPaise, monthLabel))
    : null

  return { emailSent, whatsappUrl, partnerCount: lines.length, totalPaise }
}

// ── Details alert (20th) — with bank details ─────────────────────────────

export function buildDetailsEmail(lines: PayoutLine[], totalPaise: number, monthLabel: string): { subject: string; html: string } {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://www.wealthonventures.com'
  const distUrl = `${base}/admin/distributions`
  const subject = `CONFIDENTIAL: ${monthLabel} Payout Details — Bank Transfer Required`
  const rows = lines.map(l => `
    <tr>
      <td style="padding:8px;color:#202020;font-size:13px;border-bottom:1px solid #F0F0F0;">${esc(l.partner.full_name)}</td>
      <td style="padding:8px;text-align:right;color:#F5A623;font-size:13px;font-weight:600;border-bottom:1px solid #F0F0F0;">${formatINR(l.amountPaise)}</td>
      <td style="padding:8px;color:#5A5A5A;font-size:12px;border-bottom:1px solid #F0F0F0;">${esc(l.partner.bank_name ?? '—')}</td>
      <td style="padding:8px;color:#202020;font-size:13px;font-family:monospace;border-bottom:1px solid #F0F0F0;">${esc(l.partner.bank_account_number ?? '—')}</td>
      <td style="padding:8px;color:#202020;font-size:13px;font-family:monospace;border-bottom:1px solid #F0F0F0;">${esc(l.partner.bank_ifsc ?? '—')}</td>
    </tr>
  `).join('')
  const html = `<!DOCTYPE html><html><body style="margin:0;background:#F5F5F0;font-family:Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;"><tr><td align="center">
      <table width="780" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border:2px solid #EF4444;">
        <tr><td style="background:#080808;padding:28px 24px;">
          <h1 style="margin:0;font-family:Georgia,serif;font-size:20px;color:#F5A623;">CONFIDENTIAL · ${esc(monthLabel)} Payout Details</h1>
          <p style="margin:6px 0 0;color:#9A9080;font-size:11px;">Contains bank account information — do not forward</p>
        </td></tr>
        <tr><td style="padding:24px;">
          <p style="margin:0 0 16px;color:#5A5A5A;font-size:14px;">
            Hi Suhan — full payout details with bank info for ${esc(monthLabel)}. Please process these transfers before month end.
          </p>
          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
            <thead><tr>
              <th align="left"  style="padding:6px 8px;font-size:11px;color:#F5A623;letter-spacing:0.08em;text-transform:uppercase;border-bottom:2px solid #F5A623;">Name</th>
              <th align="right" style="padding:6px 8px;font-size:11px;color:#F5A623;letter-spacing:0.08em;text-transform:uppercase;border-bottom:2px solid #F5A623;">Amount</th>
              <th align="left"  style="padding:6px 8px;font-size:11px;color:#F5A623;letter-spacing:0.08em;text-transform:uppercase;border-bottom:2px solid #F5A623;">Bank</th>
              <th align="left"  style="padding:6px 8px;font-size:11px;color:#F5A623;letter-spacing:0.08em;text-transform:uppercase;border-bottom:2px solid #F5A623;">A/C No.</th>
              <th align="left"  style="padding:6px 8px;font-size:11px;color:#F5A623;letter-spacing:0.08em;text-transform:uppercase;border-bottom:2px solid #F5A623;">IFSC</th>
            </tr></thead>
            <tbody>${rows}</tbody>
            <tfoot><tr>
              <td colspan="1" style="padding:16px 8px;color:#202020;font-size:13px;font-weight:600;">Total ${lines.length} partners</td>
              <td colspan="4" style="padding:16px 8px;text-align:right;color:#F5A623;font-size:18px;font-weight:600;">${formatINR(totalPaise)}</td>
            </tr></tfoot>
          </table>
          <p style="margin:24px 0 0;color:#202020;font-size:13px;">
            Please process these by month end. Mark each one complete in the admin panel:
          </p>
          <table cellpadding="0" cellspacing="0" style="margin:12px 0 0;"><tr><td style="background:#F5A623;border-radius:4px;">
            <a href="${distUrl}" style="display:inline-block;padding:11px 22px;color:#080808;font-weight:600;text-decoration:none;font-size:13px;">Mark Complete →</a>
          </td></tr></table>
        </td></tr>
      </table>
    </td></tr></table>
  </body></html>`
  return { subject, html }
}

export function buildDetailsWhatsApp(lines: PayoutLine[], totalPaise: number, monthLabel: string): string {
  return `Hi Suhan, full payout details for ${monthLabel} sent to your email.\n\nTotal: ${formatINR(totalPaise)} to ${lines.length} partners.\n\nPlease check email for bank details and process before month end.`
}

export async function sendDetailsAlert(
  supabase: SupabaseClient,
  options: { dryRun?: boolean } = {},
): Promise<SummaryAlertResult> {
  const { lines, totalPaise, monthLabel } = await buildPayoutLines(supabase)
  if (lines.length === 0) {
    return { emailSent: false, whatsappUrl: null, partnerCount: 0, totalPaise: 0 }
  }
  const { subject, html } = buildDetailsEmail(lines, totalPaise, monthLabel)
  let emailSent = false
  const suhanWa    = process.env.SUHAN_WHATSAPP
  const suhanEmail = process.env.SUHAN_EMAIL
  const adminEmail = process.env.ADMIN_EMAIL

  if (!options.dryRun && suhanEmail) {
    const res = await sendEmail({ to: suhanEmail, subject, html })
    emailSent = !res.error
    if (adminEmail && adminEmail !== suhanEmail) {
      // CC admin
      await sendEmail({ to: adminEmail, subject: `[CC] ${subject}`, html })
    }
  }

  const whatsappUrl = suhanWa
    ? whatsappLink(suhanWa, buildDetailsWhatsApp(lines, totalPaise, monthLabel))
    : null

  return { emailSent, whatsappUrl, partnerCount: lines.length, totalPaise }
}

function esc(s: string): string {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))
}
