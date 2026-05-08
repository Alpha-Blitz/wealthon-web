import { createClient } from '@/lib/supabase/server'
import { getPartnerByUserId } from '@/lib/db/partners'
import { getAllPnLReports, getMonthlyPnL } from '@/lib/db/pnl'
import { getAllocations } from '@/lib/db/allocations'
import { LineChart } from '@/components/charts/LineChart'
import { BarChart } from '@/components/charts/BarChart'
import { DonutChart } from '@/components/charts/DonutChart'
import { ChartStats } from '@/components/dashboard/ChartStats'
import { formatINR } from '@/lib/utils'
import { CONTENT } from '@/config/content'
import {
  mockPartner, mockLatestPnLReport, mockMonthlyPnL,
  mockAllocations, mockStrategies,
} from '@/lib/mock/data'

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default async function PnLPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let pnlReport   = mockLatestPnLReport
  let monthlyData = mockMonthlyPnL
  let allocations = mockAllocations

  if (user) {
    const p = await getPartnerByUserId(supabase, user.id)
    if (p.data) {
      const [r, m, a] = await Promise.all([
        getAllPnLReports(supabase, p.data.id),
        getMonthlyPnL(supabase, p.data.id, new Date().getFullYear()),
        getAllocations(supabase, p.data.id),
      ])
      if (r.data?.[0]) pnlReport = r.data[0]
      if (m.data?.length) monthlyData = m.data
      if (a.data?.length) allocations = a.data
    }
  }

  const barData = monthlyData.map(m => ({
    month: MONTH_NAMES[(m.month ?? 1) - 1],
    profit: m.profit,
  }))

  const C = CONTENT.pnl

  return (
    <div className="p-6 flex flex-col gap-6 max-w-[1400px]">

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: C.totalPnl,      value: `+${formatINR(pnlReport?.gross_profit ?? 0)}`,    color: '#22C55E', sub: `+${pnlReport?.win_rate ?? 0}% vs last quarter` },
          { label: C.realizedPnl,   value: formatINR(pnlReport?.realized_pnl ?? 0),           color: '#F5A623', sub: `${Math.round(((pnlReport?.realized_pnl ?? 0) / Math.max(pnlReport?.gross_profit ?? 1, 1)) * 100)}% of total` },
          { label: C.unrealizedPnl, value: formatINR(pnlReport?.unrealized_pnl ?? 0),         color: '#F5A623', sub: `${Math.round(((pnlReport?.unrealized_pnl ?? 0) / Math.max(pnlReport?.gross_profit ?? 1, 1)) * 100)}% of total` },
          { label: C.winRate,       value: `${pnlReport?.win_rate ?? 0}%`,                    color: '#F5A623', sub: '+3% vs last quarter' },
        ].map(({ label, value, color, sub }) => (
          <div
            key={label}
            className="rounded-[8px] p-5 relative overflow-hidden"
            style={{ background: '#111111', border: '0.5px solid rgba(245,166,35,0.15)' }}
          >
            <div
              className="absolute inset-x-0 top-0 h-[50px] pointer-events-none"
              style={{ background: 'linear-gradient(180deg, rgba(245,166,35,0.06) 0%, transparent 100%)' }}
            />
            <p className="text-[11px] font-sans uppercase tracking-[0.1em] text-[#8A8070] mb-3">{label}</p>
            <p className="font-serif text-[28px] font-semibold" style={{ color }}>{value}</p>
            <p className="text-[12px] font-sans font-light text-[#8A8070] mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Line chart + Donut */}
      <div className="flex flex-col xl:flex-row gap-6">
        <div
          className="flex-1 rounded-[8px] p-6"
          style={{ background: '#111111', border: '0.5px solid rgba(245,166,35,0.15)' }}
        >
          <LineChart data={monthlyData} />
        </div>
        <div
          className="xl:w-[300px] flex-shrink-0 rounded-[8px] p-6"
          style={{ background: '#111111', border: '0.5px solid rgba(245,166,35,0.15)' }}
        >
          <DonutChart allocations={allocations} />
        </div>
      </div>

      {/* Bar chart + strategy list */}
      <div className="flex flex-col xl:flex-row gap-6">
        <div
          className="flex-1 rounded-[8px] p-6"
          style={{ background: '#111111', border: '0.5px solid rgba(245,166,35,0.15)' }}
        >
          <h3 className="font-serif text-[18px] text-[#F0EDE6] mb-6">{C.monthlyBreakdown}</h3>
          <BarChart data={barData} />
          {pnlReport && (
            <ChartStats
              bestMonth={pnlReport.best_month ?? '—'}
              bestMonthAmount={pnlReport.best_month_amount ?? 0}
              worstMonth={pnlReport.worst_month ?? '—'}
              worstMonthAmount={pnlReport.worst_month_amount ?? 0}
              avgMonthlyPnL={pnlReport.avg_monthly_pnl ?? 0}
              positiveMonths={pnlReport.positive_months ?? 0}
              totalMonths={pnlReport.total_months ?? 12}
            />
          )}
        </div>

        {/* Strategy performance */}
        <div
          className="xl:w-[300px] flex-shrink-0 rounded-[8px] p-6"
          style={{ background: '#111111', border: '0.5px solid rgba(245,166,35,0.15)' }}
        >
          <h3 className="font-serif text-[18px] text-[#F0EDE6] mb-6">{C.strategyPerformance}</h3>
          <div className="flex flex-col gap-4">
            {mockStrategies.map(s => (
              <div key={s.name} className="flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-sans text-[#F0EDE6]">{s.name}</p>
                  <p className="text-[11px] font-sans text-[#4A4438]">{s.market}</p>
                </div>
                <div className="text-right">
                  <p className="text-[13px] font-sans" style={{ color: '#22C55E' }}>+{s.monthly_return}%</p>
                  <p className="text-[11px] font-sans text-[#4A4438]">{s.win_rate}% win rate</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
