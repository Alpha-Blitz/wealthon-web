import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { MOCK_COMPANY_ID } from '@/config/constants'

export async function POST(request: Request) {
  try {
    const { name, phone, range, message } = await request.json()

    if (!name || !phone) {
      return NextResponse.json({ success: false, error: 'name and phone are required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Spam guard: skip if same phone submitted in last 24 hours
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { data: existing } = await supabase
      .from('leads')
      .select('id')
      .eq('company_id', MOCK_COMPANY_ID)
      .eq('phone', String(phone).trim())
      .gte('created_at', since)
      .limit(1)
      .maybeSingle()

    if (!existing) {
      const notes = [
        range ? `Range: ${range}` : null,
        message ? `Message: ${message}` : null,
      ].filter(Boolean).join('. ')

      await supabase.from('leads').insert({
        company_id: MOCK_COMPANY_ID,
        name:       String(name).trim(),
        phone:      String(phone).trim(),
        source:     'other',
        stage:      'new',
        notes:      notes || null,
      })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
