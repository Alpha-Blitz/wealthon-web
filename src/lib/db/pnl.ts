import type { SupabaseClient } from '@supabase/supabase-js'
import type { PnLMonthly, PnLReport } from '@/types/database'
import { ok, err, type Result } from './index'

export async function getMonthlyPnL(
  supabase: SupabaseClient,
  partnerId: string,
  year: number
): Promise<Result<PnLMonthly[]>> {
  const { data, error } = await supabase
    .from('pnl_monthly')
    .select('*')
    .eq('partner_id', partnerId)
    .eq('year', year)
    .order('month', { ascending: true })

  if (error) return err(error.message)
  return ok((data ?? []) as PnLMonthly[])
}

export async function getLatestPnLReport(
  supabase: SupabaseClient,
  partnerId: string
): Promise<Result<PnLReport | null>> {
  const { data, error } = await supabase
    .from('pnl_reports')
    .select('*')
    .eq('partner_id', partnerId)
    .order('year', { ascending: false })
    .order('quarter', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) return err(error.message)
  return ok(data as PnLReport | null)
}

export async function getAllPnLReports(
  supabase: SupabaseClient,
  partnerId: string
): Promise<Result<PnLReport[]>> {
  const { data, error } = await supabase
    .from('pnl_reports')
    .select('*')
    .eq('partner_id', partnerId)
    .order('year', { ascending: false })
    .order('quarter', { ascending: false })

  if (error) return err(error.message)
  return ok((data ?? []) as PnLReport[])
}
