import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkIsAdmin } from '@/lib/admin/users'

export async function GET() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ isAdmin: false })
  const isAdmin = await checkIsAdmin(session.user.id)
  return NextResponse.json({ isAdmin })
}
