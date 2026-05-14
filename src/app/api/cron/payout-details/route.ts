import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendDetailsAlert } from '@/lib/admin/payoutAlerts'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const expected = process.env.CRON_SECRET
  const provided = request.headers.get('authorization')?.replace('Bearer ', '')
    ?? request.headers.get('x-cron-secret')
    ?? new URL(request.url).searchParams.get('secret')

  if (!expected || provided !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const result = await sendDetailsAlert(supabase)
  return NextResponse.json({ success: true, ...result })
}
