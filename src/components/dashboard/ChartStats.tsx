import { formatINR } from '@/lib/utils'
import { CONTENT } from '@/config/content'

interface ChartStatsProps {
  bestMonth: string
  bestMonthAmount: number
  worstMonth: string
  worstMonthAmount: number
  avgMonthlyPnL: number
  positiveMonths: number
  totalMonths: number
}

export function ChartStats({
  bestMonth, bestMonthAmount, worstMonth, worstMonthAmount,
  avgMonthlyPnL, positiveMonths, totalMonths,
}: ChartStatsProps) {
  const C = CONTENT.dashboard.chart
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      {[
        { label: C.bestMonth,     value: bestMonth,               sub: formatINR(bestMonthAmount),     color: '#22C55E' },
        { label: C.worstMonth,    value: worstMonth,               sub: formatINR(worstMonthAmount),    color: '#EF4444' },
        { label: C.avgMonthly,    value: formatINR(avgMonthlyPnL), sub: 'per month',                    color: '#F5A623' },
        { label: C.positiveMonths,value: `${positiveMonths}/${totalMonths}`, sub: 'months positive',   color: '#F5A623' },
      ].map(({ label, value, sub, color }) => (
        <div key={label}>
          <p className="text-[10px] font-sans uppercase tracking-[0.1em] text-[#68625A] mb-1">{label}</p>
          <p className="text-[15px] font-sans font-medium" style={{ color }}>{value}</p>
          <p className="text-[11px] font-sans text-[#68625A]">{sub}</p>
        </div>
      ))}
    </div>
  )
}
