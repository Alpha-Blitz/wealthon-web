import type { SupabaseClient } from '@supabase/supabase-js'
import type { Partner, Transaction } from '@/types/database'
import { TABLE } from '@/config/api'
import { MOCK_COMPANY_ID } from '@/config/constants'

export interface CompanyCapital {
  totalAUM:                  number  // paise — sum of active partners' invested_amount
  activePartners:            number
  eligibleForPayout:         number  // active AND lock_in_expiry < today
  pendingPartners:           number  // status='paused' OR pending CAPITAL_IN
  totalDistributed:          number  // paise — sum of all 'distribution' transactions
  totalReinvested:           number  // paise — sum of all 'reinvest' transactions
  currentMonthExpectedPayout:number  // paise — sum of eligible partners' monthly payouts
  byTier: {
    L1: { count: number; capital: number }
    L2: { count: number; capital: number }
    L3: { count: number; capital: number }
  }
  monthlyGrowth: number               // paise — AUM change vs last month
}

export async function getCompanyCapital(
  supabase: SupabaseClient,
): Promise<CompanyCapital> {
  const [{ data: partnersData }, { data: txData }] = await Promise.all([
    supabase
      .from(TABLE.PARTNERS)
      .select('id,invested_amount,status,tier,payout_preference,profit_share_ratio,lock_in_expiry,contribution_date,created_at')
      .eq('company_id', MOCK_COMPANY_ID),
    supabase
      .from(TABLE.TRANSACTIONS)
      .select('type,amount,status,date')
      .eq('company_id', MOCK_COMPANY_ID),
  ])

  const partners = (partnersData ?? []) as Partner[]
  const txs      = (txData ?? []) as Transaction[]

  const active  = partners.filter(p => p.status === 'active')
  const pending = partners.filter(p => p.status === 'paused')

  const totalAUM = active.reduce((s, p) => s + (p.invested_amount ?? 0), 0)
  const totalDistributed = txs
    .filter(t => t.type === 'distribution')
    .reduce((s, t) => s + Math.abs(t.amount), 0)
  const totalReinvested = txs
    .filter(t => t.type === 'reinvest' || t.type === 'pnl_update')
    .reduce((s, t) => s + Math.abs(t.amount), 0)

  const byTier = {
    L1: { count: 0, capital: 0 },
    L2: { count: 0, capital: 0 },
    L3: { count: 0, capital: 0 },
  }
  for (const p of active) {
    const t = (p.tier === 'L3' || p.tier === 'L2' ? p.tier : 'L1') as 'L1' | 'L2' | 'L3'
    byTier[t].count   += 1
    byTier[t].capital += p.invested_amount ?? 0
  }

  // Expected payout this month — eligible partners only
  const today = new Date()
  const eligible = active.filter(p => {
    if (!p.lock_in_expiry) return false
    return new Date(p.lock_in_expiry).getTime() < today.getTime()
  })
  const settingRate = await getDefaultMonthlyRate(supabase)
  const currentMonthExpectedPayout = eligible.reduce((s, p) => {
    return s + calculateMonthlyPayout(p.invested_amount ?? 0, settingRate, p.profit_share_ratio ?? 75)
  }, 0)

  // Monthly growth — AUM change vs the start of last month
  const startOfThisMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString()
  const aumThisMonth = active
    .filter(p => p.contribution_date && p.contribution_date < startOfThisMonth)
    .reduce((s, p) => s + (p.invested_amount ?? 0), 0)
  const monthlyGrowth = totalAUM - aumThisMonth

  return {
    totalAUM,
    activePartners:    active.length,
    eligibleForPayout: eligible.length,
    pendingPartners:   pending.length,
    totalDistributed,
    totalReinvested,
    currentMonthExpectedPayout,
    byTier,
    monthlyGrowth,
  }
}

export async function getEligibleForPayout(
  supabase: SupabaseClient,
): Promise<Partner[]> {
  const today = new Date().toISOString().split('T')[0]
  const { data } = await supabase
    .from(TABLE.PARTNERS)
    .select('*')
    .eq('company_id', MOCK_COMPANY_ID)
    .eq('status', 'active')
    .not('lock_in_expiry', 'is', null)
    .lt('lock_in_expiry', today)
    .order('full_name')
  return (data ?? []) as Partner[]
}

/**
 * Monthly payout: capital × monthlyRate × (profitShare/100)
 * - capitalPaise: paise
 * - monthlyRate:  decimal (e.g. 0.025 for 2.5%)
 * - profitShareRatio: percent (e.g. 75 for 75%)
 */
export function calculateMonthlyPayout(
  capitalPaise: number,
  monthlyRate: number,
  profitShareRatio: number,
): number {
  return Math.round(capitalPaise * monthlyRate * (profitShareRatio / 100))
}

async function getDefaultMonthlyRate(supabase: SupabaseClient): Promise<number> {
  const { data } = await supabase
    .from(TABLE.APP_SETTINGS)
    .select('value').eq('key', 'default_monthly_rate').maybeSingle()
  const raw = (data as { value: string } | null)?.value
  if (!raw) return 0.025
  const n = Number(raw)
  return isNaN(n) ? 0.025 : n / 100
}
