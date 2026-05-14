import type { SupabaseClient } from '@supabase/supabase-js'
import { TABLE } from '@/config/api'
import { DEFAULT_MONTHLY_RATE, LOCK_IN_MONTHS } from '@/config/constants'
import { ok, err, type Result } from './index'
import { logAction } from './audit'

export interface FinancialConfig {
  defaultMonthlyRate: number   // decimal, e.g. 0.025
  defaultProfitShare: number   // percent, e.g. 75
  lockInMonths:       number
  minInvestment:      number   // paise
  maxInvestment:      number   // paise
  calculatorMaxYears: number
  applyFormExpiryDays:number
}

export async function getSetting(
  supabase: SupabaseClient,
  key: string,
): Promise<string | null> {
  const { data } = await supabase
    .from(TABLE.APP_SETTINGS)
    .select('value')
    .eq('key', key)
    .maybeSingle()
  return (data as { value: string } | null)?.value ?? null
}

export async function getSettingNumber(
  supabase: SupabaseClient,
  key: string,
  fallback: number,
): Promise<number> {
  const raw = await getSetting(supabase, key)
  if (raw === null) return fallback
  const n = Number(raw)
  return isNaN(n) ? fallback : n
}

export async function getAllSettings(
  supabase: SupabaseClient,
): Promise<Record<string, string>> {
  const { data } = await supabase
    .from(TABLE.APP_SETTINGS)
    .select('key,value')
  const map: Record<string, string> = {}
  for (const row of (data ?? []) as { key: string; value: string }[]) {
    map[row.key] = row.value
  }
  return map
}

export async function updateSetting(
  supabase: SupabaseClient,
  key: string,
  value: string,
): Promise<Result<void>> {
  const { data: { user } } = await supabase.auth.getUser()
  const { data: before } = await supabase
    .from(TABLE.APP_SETTINGS)
    .select('value')
    .eq('key', key)
    .maybeSingle()
  const { error } = await supabase
    .from(TABLE.APP_SETTINGS)
    .upsert({ key, value, updated_by: user?.id ?? null, updated_at: new Date().toISOString() })
  if (error) return err(error.message)
  await logAction(supabase, 'setting.update', 'app_setting', null, {
    before: before ?? undefined,
    after:  { key, value },
  })
  return ok(undefined)
}

export async function getFinancialConfig(
  supabase: SupabaseClient,
): Promise<FinancialConfig> {
  const settings = await getAllSettings(supabase)
  const num = (key: string, fb: number): number => {
    const raw = settings[key]
    if (raw === undefined) return fb
    const n = Number(raw)
    return isNaN(n) ? fb : n
  }
  return {
    defaultMonthlyRate: num('default_monthly_rate', DEFAULT_MONTHLY_RATE * 100) / 100,
    defaultProfitShare: num('default_profit_share', 75),
    lockInMonths:       num('lock_in_months', LOCK_IN_MONTHS),
    minInvestment:      num('min_investment', 100000),
    maxInvestment:      num('max_investment', 50000000),
    calculatorMaxYears: num('calculator_max_years', 5),
    applyFormExpiryDays:num('apply_form_expiry_days', 7),
  }
}
