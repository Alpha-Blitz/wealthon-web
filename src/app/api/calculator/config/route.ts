import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getFinancialConfig } from '@/lib/admin/settings'

export const revalidate = 3600 // 1 hour

export async function GET() {
  const supabase = createAdminClient()
  const config = await getFinancialConfig(supabase)
  const monthlyRatePct = config.defaultMonthlyRate * 100

  return NextResponse.json({
    monthlyRate:    Number(monthlyRatePct.toFixed(4)),
    profitShare:    config.defaultProfitShare,
    minInvestment:  config.minInvestment,
    maxInvestment:  config.maxInvestment,
    maxYears:       config.calculatorMaxYears,
    lockInMonths:   config.lockInMonths,
    rateLabel:      `${monthlyRatePct.toFixed(2)}% per month`,
  })
}
