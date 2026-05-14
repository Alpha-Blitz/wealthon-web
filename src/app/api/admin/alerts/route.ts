import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  sendSummaryAlert,
  sendDetailsAlert,
  buildPayoutLines,
  buildSummaryEmail,
  buildSummaryWhatsApp,
  buildDetailsEmail,
  buildDetailsWhatsApp,
} from '@/lib/admin/payoutAlerts'
import { whatsappLink } from '@/lib/notifications/templates'

async function requireAdmin(): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Unauthorized' }
  const { data } = await supabase.from('admin_roles').select('user_id').eq('user_id', user.id).maybeSingle()
  if (!data) return { ok: false, error: 'Forbidden' }
  return { ok: true }
}

export async function POST(request: Request) {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: 401 })

  let payload: { type?: string; action?: string }
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }
  const type   = payload.type
  const action = payload.action ?? 'send'
  if (type !== 'summary' && type !== 'details') {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  }

  const admin = createAdminClient()

  if (action === 'preview') {
    const { lines, totalPaise, monthLabel } = await buildPayoutLines(admin)
    const built = type === 'summary'
      ? buildSummaryEmail(lines, totalPaise, monthLabel)
      : buildDetailsEmail(lines, totalPaise, monthLabel)
    const waBody = type === 'summary'
      ? buildSummaryWhatsApp(lines, totalPaise, monthLabel)
      : buildDetailsWhatsApp(lines, totalPaise, monthLabel)
    const suhanWa = process.env.SUHAN_WHATSAPP
    return NextResponse.json({
      type, monthLabel, partnerCount: lines.length, totalPaise,
      subject: built.subject,
      html:    built.html,
      whatsappBody: waBody,
      whatsappUrl:  suhanWa ? whatsappLink(suhanWa, waBody) : null,
    })
  }

  const result = type === 'summary'
    ? await sendSummaryAlert(admin)
    : await sendDetailsAlert(admin)
  return NextResponse.json({ type, ...result })
}
