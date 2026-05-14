import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createApplyToken } from '@/lib/admin/applyTokens'
import { getFinancialConfig } from '@/lib/admin/settings'
import { whatsappLink } from '@/lib/notifications/templates'
import { TABLE } from '@/config/api'

interface Payload {
  leadId?:        string
  prospectName:   string
  prospectWhatsapp: string
  prospectEmail:  string
  expiryDays?:    number
}

export async function POST(request: Request) {
  // Admin check
  const ssr = await createClient()
  const { data: { user } } = await ssr.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: roleRow } = await ssr
    .from('admin_roles').select('user_id').eq('user_id', user.id).maybeSingle()
  if (!roleRow) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  let payload: Payload
  try { payload = await request.json() } catch { return NextResponse.json({ error: 'Invalid payload' }, { status: 400 }) }

  if (!payload.prospectName?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 })
  if (!payload.prospectWhatsapp?.trim()) return NextResponse.json({ error: 'WhatsApp required' }, { status: 400 })
  if (!payload.prospectEmail?.trim()) return NextResponse.json({ error: 'Email required' }, { status: 400 })

  const admin = createAdminClient()
  const config = await getFinancialConfig(admin)
  const expiryDays = payload.expiryDays ?? config.applyFormExpiryDays

  const tokenRes = await createApplyToken(admin, {
    prospectName:     payload.prospectName,
    prospectWhatsapp: payload.prospectWhatsapp,
    prospectEmail:    payload.prospectEmail,
    leadId:           payload.leadId ?? null,
    expiryDays,
  })
  if (tokenRes.error || !tokenRes.data) {
    return NextResponse.json({ error: tokenRes.error ?? 'Failed to create token' }, { status: 500 })
  }

  // Bump lead.updated_at to surface the action on the kanban (stage stays 'proposal')
  if (payload.leadId) {
    await admin.from(TABLE.LEADS)
      .update({ updated_at: new Date().toISOString() })
      .eq('id', payload.leadId)
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://www.wealthonventures.com'
  const url = `${baseUrl}/apply/${tokenRes.data.token}`

  const message = [
    `Hi ${payload.prospectName.split(' ')[0]}, please complete your Wealthon Capital Ventures partner onboarding using this secure link:`,
    '',
    url,
    '',
    `This link is personal to you and expires in ${expiryDays} day${expiryDays === 1 ? '' : 's'}.`,
    '',
    '— Prathik, Wealthon Capital Ventures',
  ].join('\n')

  const whatsappUrl = whatsappLink(payload.prospectWhatsapp, message)

  return NextResponse.json({
    token:    tokenRes.data.token,
    tokenId:  tokenRes.data.id,
    expiresAt:tokenRes.data.expires_at,
    url,
    message,
    whatsappUrl,
  })
}
