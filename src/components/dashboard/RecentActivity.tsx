import Link from 'next/link'
import { StatusPill } from '@/components/shared/StatusPill'
import { formatINR } from '@/lib/utils'
import { CONTENT } from '@/config/content'
import { ROUTES } from '@/config/routes'
import type { Transaction } from '@/types/database'

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`
}

export function RecentActivity({ transactions }: { transactions: Transaction[] }) {
  return (
    <div
      className="rounded-[8px] p-6 flex flex-col"
      style={{ background: '#111111', border: '0.5px solid rgba(245,166,35,0.15)' }}
    >
      <div className="flex items-center justify-between mb-6">
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

      <div className="flex flex-col">
        {transactions.slice(0, 8).map((tx, i) => (
          <div
            key={tx.id}
            className="flex items-center gap-3 py-3"
            style={{ borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : undefined }}
          >
            {/* Date */}
            <span className="text-[12px] font-sans text-[#4A4438] w-[90px] flex-shrink-0">
              {formatDate(tx.date)}
            </span>

            {/* Type pill */}
            <div className="flex-1 min-w-0">
              <StatusPill status={tx.type} />
            </div>

            {/* Amount */}
            <span
              className="text-[13px] font-sans font-medium flex-shrink-0"
              style={{ color: tx.amount >= 0 ? '#22C55E' : '#EF4444' }}
            >
              {tx.amount >= 0 ? '+' : ''}{formatINR(tx.amount)}
            </span>

            {/* Status pill */}
            <div className="flex-shrink-0">
              <StatusPill status={tx.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
