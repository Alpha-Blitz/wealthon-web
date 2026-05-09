import { createClient } from '@/lib/supabase/server'
import { getPartnerByUserId } from '@/lib/db/partners'
import { getAllPnLReports, getMonthlyPnL } from '@/lib/db/pnl'
import { BarChart } from '@/components/charts/BarChart'
import { ChartStats } from '@/components/dashboard/ChartStats'
import { formatINR } from '@/lib/utils'
import { CONTENT } from '@/config/content'
import { mockLatestPnLReport, mockMonthlyPnL } from '@/lib/mock/data'
import type { PnLReport } from '@/types/database'

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default async function PnLPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const devBypass = process.env.DEV_BYPASS_AUTH === 'true'
  const C = CONTENT.pnl

  if (devBypass || !user) {
    const barData = mockMonthlyPnL.map(m => ({ month: MONTH_NAMES[(m.month ?? 1) - 1], profit: m.profit }))
    return <PnLPageContent pnlReport={mockLatestPnLReport} barData={barData} C={C} />
  }

  const { data: partner } = await getPartnerByUserId(supabase, user.id)
  if (!partner) return null

  const [rRes, mRes] = await Promise.all([
    getAllPnLReports(supabase, partner.id),
    getMonthlyPnL(supabase, partner.id, new Date().getFullYear()),
  ])

  const pnlReport   = rRes.data?.[0] ?? null
  const monthlyData = mRes.data ?? []
  const barData     = monthlyData.map(m => ({ month: MONTH_NAMES[(m.month ?? 1) - 1], profit: m.profit }))

  return <PnLPageContent pnlReport={pnlReport} barData={barData} C={C} />
}

function PnLPageContent({
  pnlReport, barData, C,
}: {
  pnlReport: PnLReport | null
  barData: { month: string; profit: number }[]
  C: typeof CONTENT.pnl
}) {
  return (
    <div className="p-6 flex flex-col gap-6 max-w-[900px]">

      {/* Metric cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: C.totalPnl,      value: pnlReport ? `+${formatINR(pnlReport.gross_profit)}` : '—',  color: '#22C55E', sub: pnlReport ? `+${pnlReport.win_rate ?? 0}% vs last quarter` : 'No P&L data yet.' },
          { label: C.realizedPnl,   value: pnlReport ? formatINR(pnlReport.realized_pnl) : '—',         color: '#F5A623', sub: pnlReport ? `${Math.round(((pnlReport.realized_pnl) / Math.max(pnlReport.gross_profit, 1)) * 100)}% of total` : '—' },
          { label: C.unrealizedPnl, value: pnlReport ? formatINR(pnlReport.unrealized_pnl) : '—',       color: '#F5A623', sub: pnlReport ? `${Math.round(((pnlReport.unrealized_pnl) / Math.max(pnlReport.gross_profit, 1)) * 100)}% of total` : '—' },
          { label: C.winRate,       value: pnlReport ? `${pnlReport.win_rate ?? 0}%` : '—',              color: '#F5A623', sub: '+3% vs last quarter' },
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
            <p className="text-[11px] font-sans uppercase tracking-[0.1em] text-[#9E9484] mb-3">{label}</p>
            <p className="font-dm-serif text-[28px] font-semibold" style={{ color }}>{value}</p>
            <p className="text-[12px] font-sans font-light text-[#9E9484] mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Monthly bar chart */}
      <div
        className="rounded-[8px] p-6"
        style={{ background: '#111111', border: '0.5px solid rgba(245,166,35,0.15)' }}
      >
        <h3 className="font-serif text-[18px] text-[#F0EDE6] mb-6">{C.monthlyBreakdown}</h3>

        {barData.length > 0 ? (
          <>
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
          </>
        ) : (
          <div className="flex items-center justify-center h-[240px]">
            <p className="text-[13px] font-sans text-[#4A4438] text-center">
              P&L data will appear here after your first quarter report is added.
            </p>
          </div>
        )}
      </div>

    </div>
  )
}
