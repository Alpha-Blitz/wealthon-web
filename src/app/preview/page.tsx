import Link from 'next/link'
import { Briefcase, TrendingUp, Gift, Calendar, Shield } from 'lucide-react'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { BarChart } from '@/components/charts/BarChart'
import { RecentActivity } from '@/components/dashboard/RecentActivity'
import { ChartStats } from '@/components/dashboard/ChartStats'
import { formatINR } from '@/lib/utils'
import { CONTENT } from '@/config/content'
import { ROUTES } from '@/config/routes'
import { mockPartner, mockLatestPnLReport, mockMonthlyPnL, mockTransactions } from '@/lib/mock/data'

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function daysUntil(dateStr: string): number {
  return Math.max(0, Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000))
}
function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`
}

const partner      = mockPartner
const pnlReport    = mockLatestPnLReport
const monthlyData  = mockMonthlyPnL
const transactions = mockTransactions

const nextPayoutDate = '2025-06-30'
const barData = monthlyData.map(m => ({ month: MONTH_NAMES[(m.month ?? 1) - 1], profit: m.profit }))
const C = CONTENT.dashboard

export default function PreviewPage() {
  return (
    <div className="p-6 flex flex-col gap-6 max-w-[1400px]">

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard
          icon={Briefcase}
          label={C.metrics.totalInvested}
          value={formatINR(partner.invested_amount)}
          sub={C.metrics.totalInvestedSub}
        />
        <MetricCard
          icon={TrendingUp}
          label={C.metrics.currentPnl}
          value={`+${formatINR(pnlReport.gross_profit)}`}
          sub={`+${pnlReport.win_rate}% this quarter`}
          valueColor="#22C55E"
        />
        <MetricCard
          icon={Gift}
          label={C.metrics.distribution}
          value={formatINR(pnlReport.distribution_amount)}
          sub={`Distributed on ${formatDate(pnlReport.distribution_date!)}`}
        />
        <MetricCard
          icon={Calendar}
          label={C.metrics.nextPayout}
          value={<span className="font-dm-serif">{formatDate(nextPayoutDate)}</span>}
          sub={`${C.metrics.daysPrefix} ${daysUntil(nextPayoutDate)} ${C.metrics.daysSuffix}`}
        />
      </div>

      {/* Chart + activity row */}
      <div className="flex flex-col md:flex-row gap-4">
        <div
          className="w-full md:w-[55%] flex-shrink-0 rounded-[8px] p-6"
          style={{ background: '#111111', border: '0.5px solid rgba(245,166,35,0.15)' }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-serif text-[18px] text-[#F0EDE6]">{C.chart.title}</h3>
            <span
              className="text-[12px] font-sans px-3 py-1 rounded-[4px]"
              style={{ background: 'rgba(245,166,35,0.08)', color: '#F5A623' }}
            >
              {C.chart.yearLabel}
            </span>
          </div>
          <BarChart data={barData} />
          <ChartStats
            bestMonth={pnlReport.best_month ?? '—'}
            bestMonthAmount={pnlReport.best_month_amount ?? 0}
            worstMonth={pnlReport.worst_month ?? '—'}
            worstMonthAmount={pnlReport.worst_month_amount ?? 0}
            avgMonthlyPnL={pnlReport.avg_monthly_pnl ?? 0}
            positiveMonths={pnlReport.positive_months ?? 0}
            totalMonths={pnlReport.total_months ?? 12}
          />
        </div>
        <div className="w-full md:flex-1">
          <RecentActivity transactions={transactions} />
        </div>
      </div>

      {/* Trust banner */}
      <div
        className="rounded-[8px] p-5 flex items-start md:items-center gap-4 flex-col md:flex-row"
        style={{ background: '#111111', border: '0.5px solid rgba(245,166,35,0.15)' }}
      >
        <Shield size={20} className="text-gold flex-shrink-0" />
        <div className="flex-1">
          <p className="text-[13px] font-sans text-[#F0EDE6]">{C.trust.agreement}</p>
          <p className="text-[12px] font-sans font-light text-[#9E9484] mt-1">{C.trust.disclaimer}</p>
        </div>
        <Link
          href={ROUTES.SECURITIES}
          className="text-[13px] font-sans text-gold hover:text-gold-secondary transition-colors flex-shrink-0 whitespace-nowrap"
        >
          {C.trust.viewAgreement}
        </Link>
      </div>
    </div>
  )
}
