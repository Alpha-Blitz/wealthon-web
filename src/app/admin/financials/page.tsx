import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { getCompanyMetrics, getMonthlyAggregate, getDistributionHistory, getTransactionDistributionSummary } from '@/lib/admin/financials'
import { AdminSkeleton } from '@/components/admin/AdminSkeleton'
import { FinancialsClient } from './FinancialsClient'

async function FinancialsContent() {
  const supabase = await createClient()
  const year = new Date().getFullYear()

  const [metricsRes, monthlyRes, distRes, txSummaryRes] = await Promise.all([
    getCompanyMetrics(supabase),
    getMonthlyAggregate(supabase, year),
    getDistributionHistory(supabase),
    getTransactionDistributionSummary(supabase),
  ])

  return (
    <FinancialsClient
      metrics={metricsRes.data ?? { totalAUM: 0, totalProfit: 0, totalDistributed: 0, firmRetained: 0, activePartners: 0, aumByTier: [] }}
      monthlyData={monthlyRes.data ?? []}
      distHistory={distRes.data ?? []}
      txSummary={txSummaryRes.data ?? []}
    />
  )
}

export default function FinancialsPage() {
  return (
    <div className="p-6 max-w-[1400px]">
      <Suspense fallback={<AdminSkeleton cols={4} rows={8} />}>
        <FinancialsContent />
      </Suspense>
    </div>
  )
}
