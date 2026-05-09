import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { getCompanyMetrics, getMonthlyAggregate, getDistributionHistory } from '@/lib/admin/financials'
import { AdminSkeleton } from '@/components/admin/AdminSkeleton'
import { FinancialsClient } from './FinancialsClient'

async function FinancialsContent() {
  const supabase = await createClient()
  const year = new Date().getFullYear()

  const [metricsRes, monthlyRes, distRes] = await Promise.all([
    getCompanyMetrics(supabase),
    getMonthlyAggregate(supabase, year),
    getDistributionHistory(supabase),
  ])

  return (
    <FinancialsClient
      metrics={metricsRes.data ?? { totalAUM: 0, totalProfit: 0, totalDistributed: 0, firmRetained: 0, activePartners: 0, aumByTier: [] }}
      monthlyData={monthlyRes.data ?? []}
      distHistory={distRes.data ?? []}
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
