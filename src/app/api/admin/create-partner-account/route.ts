import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkIsAdmin, createPartnerAccountWithUsername } from '@/lib/admin/users'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const isAdmin = await checkIsAdmin(session.user.id)
  if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { username, password, partnerId } = await request.json()
  if (!username || !password || !partnerId) {
    return NextResponse.json({ error: 'username, password, and partnerId are required' }, { status: 400 })
  }

  const adminSupabase = createAdminClient()
  const res = await createPartnerAccountWithUsername(adminSupabase, username, password, partnerId)
  if (res.error) return NextResponse.json({ error: res.error }, { status: 500 })

  return NextResponse.json({ ok: true, username: res.data!.username })
}
