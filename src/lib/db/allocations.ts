import type { SupabaseClient } from '@supabase/supabase-js'
import type { Allocation } from '@/types/database'
import { ok, err, type Result } from './index'

export async function getAllocations(
  supabase: SupabaseClient,
  partnerId: string
): Promise<Result<Allocation[]>> {
  const { data, error } = await supabase
    .from('allocations')
    .select('*')
    .eq('partner_id', partnerId)
    .order('percentage', { ascending: false })

  if (error) return err(error.message)
  return ok((data ?? []) as Allocation[])
}
