import type { SupabaseClient } from '@supabase/supabase-js'
import type { Allocation } from '@/types/database'
import { MOCK_COMPANY_ID } from '@/config/constants'
import { TABLE } from '@/config/api'
import { ok, err, type Result } from './index'
import { logAction } from './audit'

export interface AllocationInput {
  partner_id:  string
  asset_class: string
  percentage:  number
  amount:      number
}

export async function getAllocations(
  supabase: SupabaseClient,
  partnerId: string
): Promise<Result<Allocation[]>> {
  const { data, error } = await supabase
    .from(TABLE.ALLOCATIONS)
    .select('*')
    .eq('partner_id', partnerId)
    .eq('company_id', MOCK_COMPANY_ID)
    .order('asset_class', { ascending: true })
  if (error) return err(error.message)
  return ok(data as Allocation[])
}

export async function saveAllocations(
  supabase: SupabaseClient,
  partnerId: string,
  rows: Omit<AllocationInput, 'partner_id'>[]
): Promise<Result<Allocation[]>> {
  await supabase
    .from(TABLE.ALLOCATIONS)
    .delete()
    .eq('partner_id', partnerId)
    .eq('company_id', MOCK_COMPANY_ID)

  if (rows.length === 0) {
    await logAction(supabase, 'allocation.clear', 'allocation', null, { after: { partner_id: partnerId } })
    return ok([])
  }

  const inserts = rows.map(r => ({ ...r, partner_id: partnerId, company_id: MOCK_COMPANY_ID }))
  const { data, error } = await supabase
    .from(TABLE.ALLOCATIONS)
    .insert(inserts)
    .select()
  if (error || !data) return err(error?.message ?? 'Failed')
  await logAction(supabase, 'allocation.save', 'allocation', null, { after: { partner_id: partnerId, count: rows.length } })
  return ok(data as Allocation[])
}
