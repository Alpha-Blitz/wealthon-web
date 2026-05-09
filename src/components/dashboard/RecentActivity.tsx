import Link from 'next/link'
import { TrendingUp, Gift, Minus, BarChart2, ArrowUpRight } from 'lucide-react'
import { StatusPill } from '@/components/shared/StatusPill'
import { formatINR } from '@/lib/utils'
import { CONTENT } from '@/config/content'
import { ROUTES } from '@/config/routes'
import type { Transaction } from '@/types/database'

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`
}

const TYPE_ICON: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  investment:   { icon: TrendingUp,   color: '#22C55E', bg: 'rgba(34,197,94,0.12)' },
  distribution: { icon: Gift,         color: '#F5A623', bg: 'rgba(245,166,35,0.12)' },
  fee:          { icon: Minus,        color: '#EF4444', bg: 'rgba(239,68,68,0.12)' },
  pnl_update:   { icon: BarChart2,    color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
  withdrawal:   { icon: ArrowUpRight, color: '#EF4444', bg: 'rgba(239,68,68,0.12)' },
}

export function RecentActivity({ transactions }: { transactions: Transaction[] }) {
  return (
    <div
      className="rounded-[8px] p-6 flex flex-col h-full"
      style={{ background: '#111111', border: '0.5px solid rgba(245,166,35,0.15)' }}
    >
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-serif text-[18px] text-[#F0EDE6]">
          {CONTENT.dashboard.activity.title}
        </h3>
        <Link
          href={ROUTES.TRANSACTIONS}
          className="text-[12px] font-sans text-gold hover:text-gold-secondary transition-colors"
        >
          {CONTENT.dashboard.activity.viewAll}
        </Link>
      </div>

      {transactions.length === 0 && (
        <p className="text-[13px] font-sans text-[#4A4438] text-center py-8">
          No transactions yet. Your activity will appear here.
        </p>
      )}
      <div className="flex flex-col">
        {transactions.slice(0, 8).map((tx, i) => {
          const meta = TYPE_ICON[tx.type] ?? TYPE_ICON.fee
          const IconComp = meta.icon
          return (
            <div
              key={tx.id}
              className="flex items-center gap-3 py-2.5"
              style={{ borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : undefined }}
            >
              {/* Date — fixed 72px */}
              <span
                className="text-[11px] font-sans text-[#68625A] whitespace-nowrap flex-shrink-0"
                style={{ width: 72 }}
              >
                {formatDate(tx.date)}
              </span>

              {/* Icon circle — 24px */}
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: meta.bg }}
              >
                <IconComp size={12} style={{ color: meta.color }} />
              </div>

              {/* Type pill — no shrink */}
              <div className="flex-shrink-0">
                <StatusPill status={tx.type} className="whitespace-nowrap" />
              </div>

              {/* Amount — right-aligned, no shrink */}
              <span
                className="text-[12px] font-sans font-medium tabular-nums text-right flex-shrink-0 ml-auto"
                style={{
                  minWidth: 80,
                  color: tx.amount >= 0 ? '#22C55E' : '#EF4444',
                }}
              >
                {tx.amount >= 0 ? '+' : ''}{formatINR(tx.amount)}
              </span>

              {/* Status pill — no shrink */}
              <div className="flex-shrink-0">
                <StatusPill status={tx.status} className="whitespace-nowrap" />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
