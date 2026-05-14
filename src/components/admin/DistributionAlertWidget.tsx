import Link from 'next/link'
import { Send } from 'lucide-react'
import { ROUTES } from '@/config/routes'
import { formatINR } from '@/lib/utils'

interface Props {
  daysUntilQuarterEnd: number
  partnerCount:        number
  estTotal:            number
}

export function DistributionAlertWidget({ daysUntilQuarterEnd, partnerCount, estTotal }: Props) {
  if (daysUntilQuarterEnd > 30 || daysUntilQuarterEnd < 0) return null
  const urgent = daysUntilQuarterEnd <= 7

  return (
    <div
      className="rounded-[8px] p-5 flex items-center gap-5 flex-wrap"
      style={{
        background: 'linear-gradient(120deg, rgba(245,166,35,0.08), rgba(245,166,35,0.02))',
        border: `0.5px solid ${urgent ? 'rgba(245,166,35,0.6)' : 'rgba(245,166,35,0.3)'}`,
      }}
    >
      <div className="flex-1 min-w-[240px]">
        <p className="text-[11px] font-sans uppercase tracking-[0.1em] text-gold mb-2">
          Distribution Due
        </p>
        <p className="font-serif text-[20px] text-[#F0EDE6] leading-tight">
          Quarter ends in {daysUntilQuarterEnd} day{daysUntilQuarterEnd === 1 ? '' : 's'}
        </p>
        <p className="text-[13px] font-sans text-[#9A9080] mt-1">
          {partnerCount} partner{partnerCount === 1 ? '' : 's'} · Est. total {formatINR(estTotal)}
        </p>
      </div>
      <Link
        href={ROUTES.ADMIN.DISTRIBUTIONS}
        className="inline-flex items-center gap-2 text-[14px] font-sans px-5 py-2.5 rounded-[4px]"
        style={{ background: '#F5A623', color: '#080808' }}
      >
        <Send size={14} />
        Run Distribution →
      </Link>
    </div>
  )
}
