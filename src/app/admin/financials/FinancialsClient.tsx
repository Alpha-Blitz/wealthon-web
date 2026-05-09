'use client'

import dynamic from 'next/dynamic'
import { TrendingUp, ArrowDownCircle, Building2 } from 'lucide-react'
import { AdminMetricCard } from '@/components/admin/AdminMetricCard'
import { DataTable, type Column } from '@/components/admin/DataTable'
import { StatusPill } from '@/components/shared/StatusPill'
import { ChartSkeleton } from '@/components/admin/ChartSkeleton'
import { formatINR, formatINRCompact } from '@/lib/utils'
import { CONTENT } from '@/config/content'
import { MONTH_NAMES } from '@/config/constants'
import type { CompanyMetrics, MonthlyAggregate, DistributionSummary } from '@/lib/admin/financials'

const PnLLineChart = dynamic(
  () => import('@/components/admin/charts/PnLLineChart').then(m => ({ default: m.PnLLineChart })),
  { ssr: false, loading: () => <ChartSkeleton height={220} /> }
)

const AumDonut = dynamic(
  () => import('@/components/admin/charts/AumDonut').then(m => ({ default: m.AumDonut })),
  { ssr: false, loading: () => <ChartSkeleton height={160} /> }
)

const C = CONTENT.admin.financials

const distColumns: Column<DistributionSummary>[] = [
  { key: 'quarter', label: C.columns.quarter, render: d => <span className="text-[#F0EDE6] font-sans text-[13px]">Q{d.quarter}</span> },
  { key: 'year',    label: C.columns.year,    render: d => <span className="text-[#9A9080] font-sans text-[13px]">{d.year}</span> },
  { key: 'totalDistribution', label: C.columns.total, sortable: true,
    render: d => <span className="tabular-nums text-[13px] font-sans text-[#F0EDE6]">{formatINR(d.totalDistribution)}</span> },
  { key: 'partnersPaid', label: C.columns.paid,
    render: d => <span className="text-[13px] font-sans text-[#9A9080]">{d.partnersPaid}</span> },
  { key: 'status', label: C.columns.status,
    render: d => <StatusPill status={d.status} /> },
]

interface Props {
  metrics:     CompanyMetrics
  monthlyData: MonthlyAggregate[]
  distHistory: DistributionSummary[]
}

export function FinancialsClient({ metrics, monthlyData, distHistory }: Props) {
  const chartData = monthlyData.map(d => ({
    month: MONTH_NAMES[(d.month - 1) % 12],
    profit: d.profit,
  }))

  return (
    <div className="flex flex-col gap-6">
      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminMetricCard icon={TrendingUp}      label={C.aum}         value={formatINRCompact(metrics.totalAUM)}          />
        <AdminMetricCard icon={TrendingUp}      label={C.profit}      value={formatINRCompact(metrics.totalProfit)}        />
        <AdminMetricCard icon={ArrowDownCircle} label={C.distributed} value={formatINRCompact(metrics.totalDistributed)}  />
        <AdminMetricCard icon={Building2}       label={C.retained}    value={formatINRCompact(metrics.firmRetained)}       />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Monthly P&L line chart */}
        <div className="lg:col-span-2 rounded-[8px] p-5"
          style={{ background: '#111111', border: '0.5px solid rgba(245,166,35,0.15)' }}>
          <h3 className="font-serif text-[18px] text-[#F0EDE6] mb-4">{C.aumGrowth}<span className="text-gold">.</span></h3>
          {chartData.length === 0 ? (
            <div className="h-[220px] flex items-center justify-center text-[13px] font-sans text-[#9A9080]">
              No data for this year yet.
            </div>
          ) : (
            <PnLLineChart data={chartData} />
          )}
        </div>

        {/* AUM by Tier donut */}
        <div className="rounded-[8px] p-5"
          style={{ background: '#111111', border: '0.5px solid rgba(245,166,35,0.15)' }}>
          <h3 className="font-serif text-[18px] text-[#F0EDE6] mb-4">{C.aumByTier}<span className="text-gold">.</span></h3>
          <AumDonut data={metrics.aumByTier} totalAUM={metrics.totalAUM} />
        </div>
      </div>

      {/* Distribution history */}
      <div className="rounded-[8px] p-5"
        style={{ background: '#111111', border: '0.5px solid rgba(245,166,35,0.15)' }}>
        <h3 className="font-serif text-[18px] text-[#F0EDE6] mb-4">{C.distHistory}<span className="text-gold">.</span></h3>
        <DataTable columns={distColumns} data={distHistory} pageSize={10} />
      </div>
    </div>
  )
}
