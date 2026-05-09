import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { MOCK_COMPANY_ID } from '@/config/constants'

export async function POST(request: Request) {
  try {
    const { username } = await request.json()
    if (!username || typeof username !== 'string') {
      return NextResponse.json({ email: null })
    }

    const supabase = createAdminClient()
    const { data } = await supabase
      .from('partners')
      .select('email')
      .eq('username', username.toLowerCase().trim())
      .eq('company_id', MOCK_COMPANY_ID)
      .maybeSingle()

    // Return null if not found — client must show same generic error either way
    return NextResponse.json({ email: data?.email ?? null })
  } catch {
    return NextResponse.json({ email: null })
  }
}
