import type { SupabaseClient } from '@supabase/supabase-js'
import type { QuarterlyRate } from '@/types/database'
import { TABLE } from '@/config/api'
import { QUARTERLY_RATE_DEFAULT, getCurrentQuarter } from '@/config/constants'
import { ok, err, type Result } from './index'
import { logAction } from './audit'

const FALLBACK_RATE = (quarter: number, year: number): QuarterlyRate => ({
  id: 'default',
  quarter: quarter as 1 | 2 | 3 | 4,
  year,
  monthly_rate: QUARTERLY_RATE_DEFAULT,
  notes: 'Default rate (no rate set)',
  set_by: null,
  created_at: new Date().toISOString(),
})

export async function getCurrentRate(
  supabase: SupabaseClient,
): Promise<Result<QuarterlyRate>> {
  const now = new Date()
  const quarter = getCurrentQuarter()
  const year = now.getFullYear()
  return getRateForQuarter(supabase, quarter, year)
}

export async function getRateForQuarter(
  supabase: SupabaseClient,
  quarter: number,
  year: number,
): Promise<Result<QuarterlyRate>> {
  const { data, error } = await supabase
    .from(TABLE.QUARTERLY_RATES)
    .select('*')
    .eq('quarter', quarter)
    .eq('year', year)
    .maybeSingle()
  if (error) return err(error.message)
  if (!data) return ok(FALLBACK_RATE(quarter, year))
  return ok(data as QuarterlyRate)
}

export async function getAllRates(
  supabase: SupabaseClient,
): Promise<Result<QuarterlyRate[]>> {
  const { data, error } = await supabase
    .from(TABLE.QUARTERLY_RATES)
    .select('*')
    .order('year', { ascending: false })
    .order('quarter', { ascending: false })
  if (error) return err(error.message)
  return ok((data ?? []) as QuarterlyRate[])
}

export async function setRate(
  supabase: SupabaseClient,
  quarter: number,
  year: number,
  monthly_rate: number,
  notes: string | null = null,
): Promise<Result<QuarterlyRate>> {
  const { data: { user } } = await supabase.auth.getUser()
  const { data: before } = await supabase
    .from(TABLE.QUARTERLY_RATES)
    .select('*')
    .eq('quarter', quarter)
    .eq('year', year)
    .maybeSingle()

  const { data, error } = await supabase
    .from(TABLE.QUARTERLY_RATES)
    .upsert(
      { quarter, year, monthly_rate, notes, set_by: user?.id ?? null },
      { onConflict: 'quarter,year' },
    )
    .select()
    .single()
  if (error || !data) return err(error?.message ?? 'Failed to set rate')

  await logAction(supabase, before ? 'rate.update' : 'rate.create', 'quarterly_rate', data.id, {
    before,
    after: data,
  })
  return ok(data as QuarterlyRate)
}

export function isRateSetForCurrentQuarter(rate: QuarterlyRate): boolean {
  return rate.id !== 'default'
}

/**
 * Single source of truth for the rate applied to a given month/year.
 *
 *   1. Try quarterly_rates for the quarter that contains this month.
 *   2. Fall back to app_settings.default_monthly_rate (stored as %).
 *
 * Returns a decimal rate (e.g. 0.025 for 2.5%/month) plus the source
 * so the UI can surface whether the partner is on the quarter-specific
 * rate or the firm default.
 */
export async function getEffectiveRate(
  supabase: SupabaseClient,
  month: number,   // 1-12
  year: number,
): Promise<{ rate: number; source: 'quarterly' | 'default' }> {
  const quarter = Math.ceil(month / 3)
  const quarterRes = await getRateForQuarter(supabase, quarter, year)
  if (quarterRes.data && isRateSetForCurrentQuarter(quarterRes.data)) {
    return { rate: quarterRes.data.monthly_rate, source: 'quarterly' }
  }

  // Fallback: app_settings.default_monthly_rate is stored as percent.
  const { data } = await supabase
    .from(TABLE.APP_SETTINGS)
    .select('value')
    .eq('key', 'default_monthly_rate')
    .maybeSingle()
  const raw = (data as { value: string } | null)?.value
  const pct = raw ? Number(raw) : QUARTERLY_RATE_DEFAULT * 100
  const rate = isNaN(pct) ? QUARTERLY_RATE_DEFAULT : pct / 100
  return { rate, source: 'default' }
}
