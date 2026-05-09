import type { SupabaseClient } from '@supabase/supabase-js'
import type { Strategy } from '@/types/database'
import { MOCK_COMPANY_ID } from '@/config/constants'
import { TABLE } from '@/config/api'
import { ok, err, type Result } from './index'
import { logAction } from './audit'

export interface StrategyInput {
  name:           string
  market:         string | null
  description:    string | null
  risk_level:     Strategy['risk_level']
  status:         string | null
  allocation_pct: number | null
  win_rate:       number | null
  monthly_return: number | null
  notes:          string | null
}

export async function getStrategies(supabase: SupabaseClient): Promise<Result<Strategy[]>> {
  const { data, error } = await supabase
    .from(TABLE.STRATEGIES)
    .select('*')
    .eq('company_id', MOCK_COMPANY_ID)
    .order('created_at', { ascending: false })
  if (error) return err(error.message)
  return ok(data as Strategy[])
}

export async function createStrategy(supabase: SupabaseClient, input: StrategyInput): Promise<Result<Strategy>> {
  const { data, error } = await supabase
    .from(TABLE.STRATEGIES)
    .insert({ ...input, company_id: MOCK_COMPANY_ID })
    .select()
    .single()
  if (error || !data) return err(error?.message ?? 'Failed')
  await logAction(supabase, 'strategy.create', 'strategy', data.id, { after: data })
  return ok(data as Strategy)
}

export async function updateStrategy(
  supabase: SupabaseClient, id: string, input: Partial<StrategyInput>
): Promise<Result<Strategy>> {
  const { data: before } = await supabase.from(TABLE.STRATEGIES).select('*').eq('id', id).single()
  const { data, error } = await supabase
    .from(TABLE.STRATEGIES)
    .update(input)
    .eq('id', id)
    .eq('company_id', MOCK_COMPANY_ID)
    .select()
    .single()
  if (error || !data) return err(error?.message ?? 'Failed')
  await logAction(supabase, 'strategy.update', 'strategy', id, { before, after: data })
  return ok(data as Strategy)
}

export async function deleteStrategy(supabase: SupabaseClient, id: string): Promise<Result<void>> {
  const { data: before } = await supabase.from(TABLE.STRATEGIES).select('*').eq('id', id).single()
  const { error } = await supabase
    .from(TABLE.STRATEGIES)
    .delete()
    .eq('id', id)
    .eq('company_id', MOCK_COMPANY_ID)
  if (error) return err(error.message)
  await logAction(supabase, 'strategy.delete', 'strategy', id, { before })
  return ok(undefined)
}
