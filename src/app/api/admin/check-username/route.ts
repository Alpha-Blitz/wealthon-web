import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkIsAdmin, checkUsernameAvailable } from '@/lib/admin/users'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ available: false })

  const isAdmin = await checkIsAdmin(session.user.id)
  if (!isAdmin) return NextResponse.json({ available: false })

  const { searchParams } = new URL(request.url)
  const username = searchParams.get('username')?.toLowerCase().trim() ?? ''
  if (!username) return NextResponse.json({ available: false })

  const adminSupabase = createAdminClient()
  const available = await checkUsernameAvailable(adminSupabase, username)
  return NextResponse.json({ available })
}
