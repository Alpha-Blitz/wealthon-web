import type { SupabaseClient } from '@supabase/supabase-js'
import { MOCK_COMPANY_ID, PARTNER_PROFIT_SHARE, FIRM_PROFIT_SHARE } from '@/config/constants'
import { TABLE } from '@/config/api'
import { ok, err, type Result } from './index'

export interface CompanyMetrics {
  totalAUM:          number
  totalProfit:       number
  totalDistributed:  number
  firmRetained:      number
  activePartners:    number
  aumByTier:         { tier: string; amount: number }[]
}

export interface MonthlyAggregate {
  month: number
  year:  number
  profit: number
}

export interface DistributionSummary {
  id:                  string
  quarter:             number
  year:                number
  totalDistribution:   number
  partnersPaid:        number
  status:              string
}

export async function getCompanyMetrics(supabase: SupabaseClient): Promise<Result<CompanyMetrics>> {
  const [partnersRes, pnlRes] = await Promise.all([
    supabase
      .from(TABLE.PARTNERS)
      .select('tier, invested_amount, status')
      .eq('company_id', MOCK_COMPANY_ID),
    supabase
      .from(TABLE.PNL_REPORTS)
      .select('gross_profit, distribution_amount, distribution_status')
      .eq('company_id', MOCK_COMPANY_ID),
  ])

  if (partnersRes.error) return err(partnersRes.error.message)

  const partners = (partnersRes.data ?? []) as { tier: string; invested_amount: number; status: string }[]
  const reports  = (pnlRes.data ?? []) as { gross_profit: number; distribution_amount: number; distribution_status: string }[]

  const totalAUM         = partners.reduce((s, p) => s + (p.invested_amount ?? 0), 0)
  const activePartners   = partners.filter(p => p.status === 'active').length
  const totalProfit      = reports.reduce((s, r) => s + (r.gross_profit ?? 0), 0)
  const totalDistributed = reports
    .filter(r => r.distribution_status === 'paid')
    .reduce((s, r) => s + (r.distribution_amount ?? 0), 0)
  const firmRetained     = Math.round(totalDistributed * FIRM_PROFIT_SHARE / PARTNER_PROFIT_SHARE)

  const tierMap: Record<string, number> = {}
  for (const p of partners) {
    tierMap[p.tier] = (tierMap[p.tier] ?? 0) + (p.invested_amount ?? 0)
  }
  const aumByTier = Object.entries(tierMap).map(([tier, amount]) => ({ tier, amount }))

  return ok({ totalAUM, totalProfit, totalDistributed, firmRetained, activePartners, aumByTier })
}

export async function getMonthlyAggregate(
  supabase: SupabaseClient,
  year: number
): Promise<Result<MonthlyAggregate[]>> {
  const { data, error } = await supabase
    .from(TABLE.PNL_MONTHLY)
    .select('month, year, profit')
    .eq('company_id', MOCK_COMPANY_ID)
    .eq('year', year)
    .order('month', { ascending: true })
  if (error) return err(error.message)

  const byMonth: Record<number, number> = {}
  for (const row of (data ?? []) as { month: number; year: number; profit: number }[]) {
    byMonth[row.month] = (byMonth[row.month] ?? 0) + (row.profit ?? 0)
  }
  const result: MonthlyAggregate[] = Object.entries(byMonth).map(([m, profit]) => ({
    month:  Number(m),
    year,
    profit,
  }))
  result.sort((a, b) => a.month - b.month)
  return ok(result)
}

export async function getDistributionHistory(supabase: SupabaseClient): Promise<Result<DistributionSummary[]>> {
  const { data, error } = await supabase
    .from(TABLE.PNL_REPORTS)
    .select('id, quarter, year, distribution_amount, distribution_status')
    .eq('company_id', MOCK_COMPANY_ID)
    .order('year', { ascending: false })
    .order('quarter', { ascending: false })
  if (error) return err(error.message)

  const grouped: Record<string, DistributionSummary> = {}
  for (const r of (data ?? []) as { id: string; quarter: number; year: number; distribution_amount: number; distribution_status: string }[]) {
    const key = `${r.year}-Q${r.quarter}`
    if (!grouped[key]) {
      grouped[key] = { id: key, quarter: r.quarter, year: r.year, totalDistribution: 0, partnersPaid: 0, status: r.distribution_status }
    }
    grouped[key].totalDistribution += r.distribution_amount ?? 0
    if (r.distribution_status === 'paid') grouped[key].partnersPaid++
  }
  return ok(Object.values(grouped).sort((a, b) => b.year - a.year || b.quarter - a.quarter))
}
