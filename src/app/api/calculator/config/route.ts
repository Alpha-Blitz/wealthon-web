import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getFinancialConfig } from '@/lib/admin/settings'
import { getEffectiveRate } from '@/lib/admin/rates'

export const revalidate = 3600 // 1 hour

export async function GET() {
  const supabase = createAdminClient()
  const config = await getFinancialConfig(supabase)

  // Same single source of truth as distributions + cron.
  const now = new Date()
  const { rate, source } = await getEffectiveRate(supabase, now.getMonth() + 1, now.getFullYear())
  const monthlyRatePct = rate * 100

  return NextResponse.json({
    monthlyRate:    Number(monthlyRatePct.toFixed(4)),
    profitShare:    config.defaultProfitShare,
    minInvestment:  config.minInvestment,
    maxInvestment:  config.maxInvestment,
    maxYears:       config.calculatorMaxYears,
    lockInMonths:   config.lockInMonths,
    rateLabel:      `${monthlyRatePct.toFixed(2)}% per month`,
    rateSource:     source,
  })
}
