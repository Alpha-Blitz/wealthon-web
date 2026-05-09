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
    const clean = username.toLowerCase().trim()
    const { data } = await supabase
      .from('partners')
      .select('id')
      .eq('username', clean)
      .eq('company_id', MOCK_COMPANY_ID)
      .maybeSingle()

    if (!data) {
      // Partner not found — return null so client shows generic error (no enumeration)
      return NextResponse.json({ email: null })
    }

    // Construct the same synthetic email used when the account was created
    return NextResponse.json({ email: `${clean}@wealthon-partner.internal` })
  } catch {
    return NextResponse.json({ email: null })
  }
}
