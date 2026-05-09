import type { SupabaseClient } from '@supabase/supabase-js'
import type { PnLReport, PnLMonthly } from '@/types/database'
import { MOCK_COMPANY_ID } from '@/config/constants'
import { TABLE } from '@/config/api'
import { ok, err, type Result } from './index'
import { logAction } from './audit'

export async function getPnLReports(
  supabase: SupabaseClient,
  partnerId: string
): Promise<Result<PnLReport[]>> {
  const { data, error } = await supabase
    .from(TABLE.PNL_REPORTS)
    .select('*')
    .eq('partner_id', partnerId)
    .eq('company_id', MOCK_COMPANY_ID)
    .order('year', { ascending: false })
    .order('quarter', { ascending: false })
  if (error) return err(error.message)
  return ok(data as PnLReport[])
}

export async function addPnLReport(
  supabase: SupabaseClient,
  input: Omit<PnLReport, 'id' | 'created_at' | 'company_id'>
): Promise<Result<PnLReport>> {
  const { data, error } = await supabase
    .from(TABLE.PNL_REPORTS)
    .insert({ ...input, company_id: MOCK_COMPANY_ID })
    .select()
    .single()
  if (error || !data) return err(error?.message ?? 'Failed')
  await logAction(supabase, 'pnl_report.create', 'pnl_report', data.id, { after: data })
  return ok(data as PnLReport)
}

export async function updatePnLReport(
  supabase: SupabaseClient,
  id: string,
  input: Partial<PnLReport>
): Promise<Result<PnLReport>> {
  const { data: before } = await supabase.from(TABLE.PNL_REPORTS).select('*').eq('id', id).single()
  const { data, error } = await supabase
    .from(TABLE.PNL_REPORTS)
    .update(input)
    .eq('id', id)
    .eq('company_id', MOCK_COMPANY_ID)
    .select()
    .single()
  if (error || !data) return err(error?.message ?? 'Failed')
  await logAction(supabase, 'pnl_report.update', 'pnl_report', id, { before, after: data })
  return ok(data as PnLReport)
}

export async function getMonthlyPnL(
  supabase: SupabaseClient,
  partnerId: string,
  year: number
): Promise<Result<PnLMonthly[]>> {
  const { data, error } = await supabase
    .from(TABLE.PNL_MONTHLY)
    .select('*')
    .eq('partner_id', partnerId)
    .eq('company_id', MOCK_COMPANY_ID)
    .eq('year', year)
    .order('month', { ascending: true })
  if (error) return err(error.message)
  return ok(data as PnLMonthly[])
}

export async function upsertMonthlyPnL(
  supabase: SupabaseClient,
  input: Omit<PnLMonthly, 'id' | 'created_at' | 'company_id'>
): Promise<Result<PnLMonthly>> {
  const { data: before } = await supabase
    .from(TABLE.PNL_MONTHLY)
    .select('*')
    .eq('partner_id', input.partner_id)
    .eq('month', input.month)
    .eq('year', input.year)
    .single()

  const { data, error } = await supabase
    .from(TABLE.PNL_MONTHLY)
    .upsert({ ...input, company_id: MOCK_COMPANY_ID }, { onConflict: 'partner_id,month,year' })
    .select()
    .single()
  if (error || !data) return err(error?.message ?? 'Failed')
  await logAction(supabase, 'pnl_monthly.upsert', 'pnl_monthly', data.id, { before, after: data })
  return ok(data as PnLMonthly)
}

export async function getPnLEntryHistory(
  supabase: SupabaseClient,
  limit = 100
): Promise<Result<PnLMonthly[]>> {
  const { data, error } = await supabase
    .from(TABLE.PNL_MONTHLY)
    .select('*')
    .eq('company_id', MOCK_COMPANY_ID)
    .order('year', { ascending: false })
    .order('month', { ascending: false })
    .limit(limit)
  if (error) return err(error.message)
  return ok(data as PnLMonthly[])
}
