import type { SupabaseClient } from '@supabase/supabase-js'
import type { Partner } from '@/types/database'
import { ok, err, type Result } from './index'

export async function getPartnerByUserId(
  supabase: SupabaseClient,
  userId: string
): Promise<Result<Partner>> {
  const { data, error } = await supabase
    .from('partners')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error || !data) return err(error?.message ?? 'Partner not found')
  return ok(data as Partner)
}
