import type { Partner, Transaction } from '@/types/database'
import { formatINR } from '@/lib/utils'

const HEADER = `
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#080808;padding:32px 24px;">
    <tr>
      <td>
        <h1 style="margin:0;font-family:Georgia,serif;font-size:22px;font-weight:600;color:#F5A623;letter-spacing:0.02em;">WEALTHON CAPITAL VENTURES</h1>
        <p style="margin:6px 0 0;font-family:Arial,sans-serif;font-size:12px;color:#9A9080;">Proprietary Trading · Capital Partnerships</p>
      </td>
    </tr>
  </table>
`

const FOOTER = `
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0F0F0F;padding:24px;margin-top:32px;">
    <tr>
      <td style="font-family:Arial,sans-serif;font-size:11px;color:#7F7566;line-height:1.6;text-align:center;">
        Wealthon Capital Ventures · <a href="https://wealthonventures.com" style="color:#F5A623;text-decoration:none;">wealthonventures.com</a><br/>
        Capital partnerships are profit-sharing arrangements. Past performance does not guarantee future returns.<br/>
        <br/>
        <a href="mailto:hello@wealthonventures.com?subject=Unsubscribe" style="color:#7F7566;text-decoration:underline;">Unsubscribe</a>
      </td>
    </tr>
  </table>
`

function wrap(inner: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;background:#F5F5F0;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F5F0;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border:1px solid rgba(245,166,35,0.2);">
        <tr><td>${HEADER}</td></tr>
        <tr><td style="padding:32px 28px;">${inner}</td></tr>
        <tr><td>${FOOTER}</td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`
}

function detailRow(label: string, value: string, accent = false): string {
  return `<tr>
    <td style="padding:10px 0;font-family:Arial,sans-serif;font-size:12px;color:#8A8070;border-bottom:1px solid #F0F0F0;">${label}</td>
    <td style="padding:10px 0;font-family:Arial,sans-serif;font-size:14px;color:${accent ? '#F5A623' : '#202020'};font-weight:${accent ? '600' : '400'};text-align:right;border-bottom:1px solid #F0F0F0;">${value}</td>
  </tr>`
}

function button(label: string, href: string): string {
  return `<table cellpadding="0" cellspacing="0" style="margin:24px 0;"><tr><td style="background:#F5A623;border-radius:4px;">
    <a href="${href}" style="display:inline-block;padding:12px 28px;color:#080808;font-family:Arial,sans-serif;font-size:14px;font-weight:600;text-decoration:none;letter-spacing:0.04em;">${label}</a>
  </td></tr></table>`
}

const DASHBOARD_URL = 'https://wealthonventures.com/dashboard'

// ── Capital Receipt email ─────────────────────────────────────────────────

export function capitalReceiptEmail(
  partner: Partner,
  transaction: Transaction,
  invoiceUrl: string | null,
): { subject: string; html: string } {
  const subject = `Capital Receipt — ${transaction.invoice_number ?? 'WCV'} — Wealthon Capital Ventures`
  const inner = `
    <h2 style="margin:0 0 8px;font-family:Georgia,serif;font-size:24px;color:#202020;">Your partnership is now active.</h2>
    <p style="margin:0 0 24px;font-family:Arial,sans-serif;font-size:14px;color:#5A5A5A;line-height:1.7;">
      Dear ${partner.full_name}, we've received your capital contribution. The summary below confirms the terms of your partnership.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
      ${detailRow('Contribution Amount', formatINR(transaction.amount), true)}
      ${detailRow('Tier', partner.tier)}
      ${detailRow('Lock-in', partner.lock_in_period.replace('_', ' '))}
      ${detailRow('Payout Preference', partner.payout_preference === 'payout' ? 'Quarterly Payout' : 'Reinvest (Compound)')}
      ${detailRow('Profit Share', `${partner.profit_share_ratio}% partner / ${100 - partner.profit_share_ratio}% firm`)}
      ${detailRow('Reference', transaction.invoice_number ?? '—')}
    </table>
    ${invoiceUrl ? button('Download Receipt', invoiceUrl) : ''}
    ${button('View Dashboard', DASHBOARD_URL)}
    <p style="margin:24px 0 0;font-family:Arial,sans-serif;font-size:12px;color:#8A8070;line-height:1.7;">
      Your capital is governed by the signed Capital Partnership Agreement and Risk Disclosure Statement. Questions? Reply to this email.
    </p>
  `
  return { subject, html: wrap(inner) }
}

// ── Distribution email ────────────────────────────────────────────────────

export function distributionEmail(
  partner: Partner,
  transaction: Transaction,
  quarter: number,
  year: number,
  invoiceUrl: string | null,
): { subject: string; html: string } {
  const subject = `Q${quarter} ${year} Distribution — ${formatINR(transaction.amount)} — Wealthon Capital Ventures`
  const last4 = partner.bank_account_number?.slice(-4) ?? '----'
  const inner = `
    <h2 style="margin:0 0 8px;font-family:Georgia,serif;font-size:24px;color:#202020;">Your Q${quarter} ${year} distribution has been processed.</h2>
    <p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:14px;color:#5A5A5A;line-height:1.7;">
      Dear ${partner.full_name}, your quarterly profit distribution has been processed to your account on file.
    </p>
    <p style="margin:0 0 24px;font-family:Georgia,serif;font-size:36px;font-weight:600;color:#F5A623;">
      ${formatINR(transaction.amount)}
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
      ${detailRow('Quarter', `Q${quarter} ${year}`)}
      ${detailRow('Paid To', `Account ending ${last4}`)}
      ${detailRow('Reference', transaction.invoice_number ?? '—')}
      ${detailRow('Date', new Date(transaction.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }))}
    </table>
    ${invoiceUrl ? button('Download Invoice', invoiceUrl) : ''}
    ${button('View Dashboard', DASHBOARD_URL)}
    <p style="margin:24px 0 0;font-family:Arial,sans-serif;font-size:12px;color:#8A8070;line-height:1.7;">
      Distributions are market-linked and reflect realised performance for the quarter.
    </p>
  `
  return { subject, html: wrap(inner) }
}

// ── Reinvestment email ────────────────────────────────────────────────────

export function reinvestEmail(
  partner: Partner,
  transaction: Transaction,
  previousCapital: number,
  newCapital: number,
  quarter: number,
  year: number,
  invoiceUrl: string | null,
): { subject: string; html: string } {
  const subject = `Q${quarter} ${year} Reinvestment — Wealthon Capital Ventures`
  const inner = `
    <h2 style="margin:0 0 8px;font-family:Georgia,serif;font-size:24px;color:#202020;">Your profit has been reinvested.</h2>
    <p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:14px;color:#5A5A5A;line-height:1.7;">
      Dear ${partner.full_name}, your Q${quarter} ${year} profit has been added to your capital base for compounding growth.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:16px;">
      ${detailRow('Previous Capital', formatINR(previousCapital))}
      ${detailRow('Profit Reinvested', formatINR(transaction.amount), true)}
      ${detailRow('New Capital Base', formatINR(newCapital), true)}
      ${detailRow('Reference', transaction.invoice_number ?? '—')}
    </table>
    <p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:13px;color:#5A5A5A;line-height:1.7;">
      Your next quarterly distribution will be calculated on the new, larger capital base.
    </p>
    ${invoiceUrl ? button('Download Statement', invoiceUrl) : ''}
    ${button('View Dashboard', DASHBOARD_URL)}
  `
  return { subject, html: wrap(inner) }
}
