import type { SupabaseClient } from '@supabase/supabase-js'
import type { Transaction } from '@/types/database'
import { ok, err, type Result } from './index'

export async function getTransactions(
  supabase: SupabaseClient,
  partnerId: string,
  limit?: number
): Promise<Result<Transaction[]>> {
  let query = supabase
    .from('transactions')
    .select('*')
    .eq('partner_id', partnerId)
    .order('date', { ascending: false })

  if (limit) query = query.limit(limit)

  const { data, error } = await query

  if (error) return err(error.message)
  return ok((data ?? []) as Transaction[])
}
