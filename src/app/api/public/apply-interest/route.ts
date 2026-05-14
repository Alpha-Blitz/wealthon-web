import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { TABLE } from '@/config/api'
import { MOCK_COMPANY_ID } from '@/config/constants'
import { sendEmail } from '@/lib/email/resend'
import { whatsappLink } from '@/lib/notifications/templates'

interface ApplyInterestPayload {
  name:     string
  whatsapp: string
  email:    string
  range:    string
  source?:  string
}

const ALLOWED_RANGES = ['₹1L – ₹10L', '₹10L – ₹50L', '₹50L+', 'Just exploring']
const ALLOWED_SOURCES = ['Referral', 'LinkedIn', 'Instagram', 'Website', 'WhatsApp', 'Other']

export async function POST(request: Request) {
  let payload: Partial<ApplyInterestPayload>
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 })
  }

  const name     = String(payload.name ?? '').trim()
  const whatsapp = String(payload.whatsapp ?? '').trim()
  const email    = String(payload.email ?? '').trim()
  const range    = String(payload.range ?? '').trim()
  const source   = String(payload.source ?? '').trim() || null

  if (!name || !whatsapp || !email || !range) {
    return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
  }
  if (!email.includes('@')) {
    return NextResponse.json({ success: false, error: 'Invalid email' }, { status: 400 })
  }
  if (!ALLOWED_RANGES.includes(range)) {
    return NextResponse.json({ success: false, error: 'Invalid range' }, { status: 400 })
  }
  if (source && !ALLOWED_SOURCES.includes(source)) {
    return NextResponse.json({ success: false, error: 'Invalid source' }, { status: 400 })
  }

  const supabase = createAdminClient()

  // 24-hour dedup by phone or email
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const { data: dupes } = await supabase
    .from(TABLE.LEADS)
    .select('id, created_at')
    .eq('company_id', MOCK_COMPANY_ID)
    .or(`phone.eq.${whatsapp},email.eq.${email}`)
    .gte('created_at', cutoff)
    .limit(1)

  if (dupes && dupes.length > 0) {
    // Silent dedup
    return NextResponse.json({ success: true })
  }

  // Insert lead
  const { error: insertErr } = await supabase
    .from(TABLE.LEADS)
    .insert({
      company_id: MOCK_COMPANY_ID,
      name,
      email,
      phone: whatsapp,
      stage: 'new',
      source: mapSource(source),
      notes: `Investment range: ${range}${source ? ` · Source: ${source}` : ''}`,
    })

  if (insertErr) {
    return NextResponse.json({ success: false, error: 'Failed to record interest' }, { status: 500 })
  }

  // Fire-and-forget alerts to Prathik
  void sendProspectAlerts({ name, whatsapp, email, range, source }).catch(() => {})

  return NextResponse.json({ success: true })
}

function mapSource(s: string | null): 'referral' | 'organic' | 'social' | 'event' | 'other' {
  if (!s) return 'other'
  if (s === 'Referral')  return 'referral'
  if (s === 'LinkedIn' || s === 'Instagram' || s === 'WhatsApp') return 'social'
  if (s === 'Website')   return 'organic'
  return 'other'
}

interface AlertPayload {
  name: string; whatsapp: string; email: string; range: string; source: string | null
}

async function sendProspectAlerts(p: AlertPayload) {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://www.wealthonventures.com'
  const pipelineUrl = `${base}/admin/pipeline`

  const message = [
    'New interest form submission — Wealthon',
    '',
    `Name: ${p.name}`,
    `WhatsApp: ${p.whatsapp}`,
    `Email: ${p.email}`,
    `Range: ${p.range}`,
    `Source: ${p.source ?? 'Unknown'}`,
    '',
    `View in pipeline: ${pipelineUrl}`,
  ].join('\n')

  // WhatsApp link (for our internal record / logs only — actual delivery
  // is via wa.me when Prathik opens his dashboard or via email below)
  const prathikWa = process.env.PRATHIK_WHATSAPP
  if (prathikWa) {
    // Log the wa.me link — Prathik can click it. (No automated WhatsApp API yet.)
    console.warn('[apply-interest] WhatsApp:', whatsappLink(prathikWa, message))
  }

  const prathikEmail = process.env.PRATHIK_EMAIL
  if (prathikEmail) {
    await sendEmail({
      to: prathikEmail,
      subject: `New Lead: ${p.name} — ${p.range}`,
      html: buildLeadEmailHtml(p, pipelineUrl),
    })
  }
}

function buildLeadEmailHtml(p: AlertPayload, pipelineUrl: string): string {
  return `<!DOCTYPE html><html><body style="margin:0;background:#F5F5F0;font-family:Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
      <tr><td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border:1px solid rgba(245,166,35,0.2);">
          <tr><td style="background:#080808;padding:28px 24px;">
            <h1 style="margin:0;font-family:Georgia,serif;font-size:20px;color:#F5A623;">WEALTHON CAPITAL VENTURES</h1>
            <p style="margin:6px 0 0;color:#9A9080;font-size:11px;">New interest form submission</p>
          </td></tr>
          <tr><td style="padding:28px 24px;">
            <h2 style="margin:0 0 16px;font-family:Georgia,serif;font-size:22px;color:#202020;">${escapeHtml(p.name)}</h2>
            <table width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;color:#5A5A5A;">
              ${row('WhatsApp', p.whatsapp)}
              ${row('Email', p.email)}
              ${row('Range', p.range)}
              ${row('Source', p.source ?? 'Unknown')}
            </table>
            <table cellpadding="0" cellspacing="0" style="margin:24px 0 8px;"><tr><td style="background:#F5A623;border-radius:4px;">
              <a href="${pipelineUrl}" style="display:inline-block;padding:11px 22px;color:#080808;font-weight:600;text-decoration:none;font-size:13px;">View in Pipeline →</a>
            </td></tr></table>
            <p style="margin:16px 0 0;font-size:11px;color:#9A9080;">Prathik — please reach out within 24h.</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body></html>`
}

function row(label: string, value: string): string {
  return `<tr><td style="padding:8px 0;border-bottom:1px solid #F0F0F0;color:#8A8070;">${escapeHtml(label)}</td><td style="padding:8px 0;border-bottom:1px solid #F0F0F0;text-align:right;color:#202020;">${escapeHtml(value)}</td></tr>`
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))
}
