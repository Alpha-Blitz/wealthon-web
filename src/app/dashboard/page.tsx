import { Briefcase, TrendingUp, Gift, Calendar, Percent } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getPartnerByUserId } from '@/lib/db/partners'
import { getLatestPnLReport, getMonthlyPnL } from '@/lib/db/pnl'
import { getTransactions } from '@/lib/db/transactions'
import { getCurrentRate } from '@/lib/admin/rates'
import { sumByType, effectiveReturnPct } from '@/lib/admin/calculations'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { BarChart } from '@/components/charts/BarChart'
import { RecentActivity } from '@/components/dashboard/RecentActivity'
import { ChartStats } from '@/components/dashboard/ChartStats'
import { ProjectionWidget } from '@/components/dashboard/ProjectionWidget'
import { formatINR } from '@/lib/utils'
import { CONTENT } from '@/config/content'
import { mockPartner, mockLatestPnLReport, mockMonthlyPnL, mockTransactions } from '@/lib/mock/data'
import type { Partner, Transaction, PnLReport, QuarterlyRate } from '@/types/database'

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function daysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / 86400000))
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`
}

function nextQuarterEnd(): string {
  const now = new Date()
  const endMonth = [3,6,9,12].find(m => m > now.getMonth() + 1) ?? 3
  const endYear  = endMonth === 3 && now.getMonth() > 8 ? now.getFullYear() + 1 : now.getFullYear()
  const lastDay  = endMonth === 3 ? 31 : endMonth === 6 ? 30 : endMonth === 9 ? 30 : 31
  return new Date(endYear, endMonth - 1, lastDay).toISOString().split('T')[0]
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const devBypass = process.env.DEV_BYPASS_AUTH === 'true'

  // In dev bypass mode, show mock data
  if (devBypass || !user) {
    const pnlReport   = mockLatestPnLReport
    const partner     = mockPartner
    const monthlyData = mockMonthlyPnL
    const transactions = mockTransactions
    const nextPayout  = nextQuarterEnd()
    const barData     = monthlyData.map(m => ({ month: MONTH_NAMES[(m.month ?? 1) - 1], profit: m.profit }))
    const C = CONTENT.dashboard
    const rateRes = await getCurrentRate(supabase)
    const currentRate = rateRes.data

    return (
      <DashboardContent
        partner={partner} pnlReport={pnlReport} barData={barData}
        transactions={transactions} nextPayout={nextPayout} C={C}
        currentRate={currentRate}
      />
    )
  }

  // Real user — fetch all data, no mock fallbacks
  const { data: partner } = await getPartnerByUserId(supabase, user.id)

  if (!partner) {
    // Middleware + layout should prevent this, but guard just in case
    return null
  }

  const [pnlRes, monthlyRes, txRes, rateRes] = await Promise.all([
    getLatestPnLReport(supabase, partner.id),
    getMonthlyPnL(supabase, partner.id, new Date().getFullYear()),
    getTransactions(supabase, partner.id, 8),
    getCurrentRate(supabase),
  ])

  const pnlReport   = pnlRes.data ?? null
  const monthlyData = monthlyRes.data ?? []
  const transactions = txRes.data ?? []
  const currentRate  = rateRes.data
  const nextPayout  = nextQuarterEnd()
  const barData     = monthlyData.map(m => ({ month: MONTH_NAMES[(m.month ?? 1) - 1], profit: m.profit }))
  const C = CONTENT.dashboard

  return (
    <DashboardContent
      partner={partner} pnlReport={pnlReport} barData={barData}
      transactions={transactions} nextPayout={nextPayout} C={C}
      currentRate={currentRate}
    />
  )
}

type BarPoint = { month: string; profit: number }

function DashboardContent({
  partner, pnlReport, barData, transactions, nextPayout, C, currentRate,
}: {
  partner: Partner
  pnlReport: PnLReport | null
  barData: BarPoint[]
  transactions: Transaction[]
  nextPayout: string
  C: typeof CONTENT.dashboard
  currentRate: QuarterlyRate | null
}) {
  const totalDistributed = sumByType(transactions, ['distribution'])
  const totalReinvested  = sumByType(transactions, ['reinvest', 'pnl_update'])
  const initialCapital   = Math.max(1, partner.invested_amount - totalReinvested)
  const returnPct        = effectiveReturnPct(totalDistributed, totalReinvested, initialCapital)

  return (
    <div className="p-6 flex flex-col gap-6 max-w-[1400px]">

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <MetricCard
          icon={Briefcase}
          label={C.metrics.totalInvested}
          value={formatINR(partner.invested_amount)}
          sub={C.metrics.totalInvestedSub}
        />
        <MetricCard
          icon={Percent}
          label="CURRENT RATE"
          value={currentRate ? `${(currentRate.monthly_rate * 100).toFixed(2)}% / mo` : '—'}
          sub={currentRate ? `Q${currentRate.quarter} ${currentRate.year} rate` : 'No rate set yet'}
        />
        <MetricCard
          icon={TrendingUp}
          label={C.metrics.currentPnl}
          value={pnlReport ? `+${formatINR(pnlReport.gross_profit)}` : '—'}
          sub={pnlReport ? `+${pnlReport.win_rate ?? 0}% this quarter` : 'P&L data will appear after your first quarter report.'}
          valueColor={pnlReport ? '#22C55E' : undefined}
        />
        <MetricCard
          icon={Gift}
          label={C.metrics.distribution}
          value={pnlReport ? formatINR(pnlReport.distribution_amount) : '—'}
          sub={pnlReport?.distribution_date
            ? `Distributed on ${formatDate(pnlReport.distribution_date)}`
            : 'Pending'}
        />
        <MetricCard
          icon={Calendar}
          label={C.metrics.nextPayout}
          value={<span className="font-dm-serif">{formatDate(nextPayout)}</span>}
          sub={`${C.metrics.daysPrefix} ${daysUntil(nextPayout)} ${C.metrics.daysSuffix}`}
        />
      </div>

      {/* Projection widget — collapsible */}
      <ProjectionWidget
        capitalPaise={partner.invested_amount}
        monthlyRate={currentRate ? currentRate.monthly_rate : undefined}
        profitShare={partner.profit_share_ratio}
      />

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

        <div className="w-full md:flex-1">
          <RecentActivity transactions={transactions ?? []} />
        </div>
      </div>

      {/* Transaction summary strip */}
      <div
        className="rounded-[8px] p-5 grid grid-cols-1 sm:grid-cols-3 gap-5"
        style={{ background: '#111111', border: '0.5px solid rgba(245,166,35,0.15)' }}
      >
        <div>
          <p className="text-[11px] font-sans uppercase tracking-[0.08em] text-[#8A8070] mb-1.5">Total Invested</p>
          <p className="font-dm-serif text-[22px] text-[#F0EDE6] leading-none">{formatINR(partner.invested_amount)}</p>
        </div>
        <div style={{ borderLeft: '1px solid rgba(255,255,255,0.06)', paddingLeft: 20 }}>
          <p className="text-[11px] font-sans uppercase tracking-[0.08em] text-[#8A8070] mb-1.5">Total Received</p>
          <p className="font-dm-serif text-[22px] text-gold leading-none">{formatINR(totalDistributed)}</p>
          {totalReinvested > 0 && (
            <p className="text-[11px] font-sans text-[#7F7566] mt-1">+ {formatINR(totalReinvested)} reinvested</p>
          )}
        </div>
        <div style={{ borderLeft: '1px solid rgba(255,255,255,0.06)', paddingLeft: 20 }}>
          <p className="text-[11px] font-sans uppercase tracking-[0.08em] text-[#8A8070] mb-1.5">Effective Return</p>
          <p className="font-dm-serif text-[22px] text-[#22C55E] leading-none">{returnPct.toFixed(1)}%</p>
          <p className="text-[11px] font-sans text-[#7F7566] mt-1">on initial capital</p>
        </div>
      </div>
    </div>
  )
}
