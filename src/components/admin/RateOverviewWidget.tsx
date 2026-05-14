'use client'

import { useState } from 'react'
import { TrendingUp, AlertCircle } from 'lucide-react'
import type { QuarterlyRate } from '@/types/database'
import { RateModal } from './RateModal'
import { isRateSetForCurrentQuarter } from '@/lib/admin/rates'

interface Props {
  rate: QuarterlyRate
}

export function RateOverviewWidget({ rate: initial }: Props) {
  const [rate, setRate] = useState(initial)
  const [open, setOpen] = useState(false)
  const isSet = isRateSetForCurrentQuarter(rate)

  const borderColor = isSet ? 'rgba(245,166,35,0.15)' : 'rgba(239,68,68,0.4)'

  return (
    <div
      className="rounded-[8px] p-5 flex flex-col"
      style={{ background: '#111111', border: `0.5px solid ${borderColor}` }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendingUp size={14} className="text-gold" />
          <span className="text-[11px] font-sans uppercase tracking-[0.1em] text-[#8A8070]">
            Current Quarter Rate
          </span>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="text-[11px] font-sans text-gold hover:text-gold-secondary transition-colors bg-transparent border-none cursor-pointer"
        >
          Change rate →
        </button>
      </div>

      <p className="font-dm-serif text-[36px] leading-none text-gold mb-2">
        {(rate.monthly_rate * 100).toFixed(2)}% / month
      </p>
      <p className="text-[12px] font-sans text-[#9A9080]">
        Q{rate.quarter} {rate.year} · {(rate.monthly_rate * 12 * 100).toFixed(1)}% annual equivalent
      </p>

      {!isSet && (
        <div
          className="mt-4 p-3 rounded-[4px] flex items-start gap-2"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)' }}
        >
          <AlertCircle size={14} className="text-[#EF4444] flex-shrink-0 mt-0.5" />
          <p className="text-[12px] font-sans text-[#F0EDE6] leading-tight">
            No rate set for this quarter. Set before running distributions.
          </p>
        </div>
      )}

      <RateModal
        isOpen={open}
        onClose={() => setOpen(false)}
        initial={isSet ? rate : null}
        onSaved={(saved) => setRate(saved)}
      />
    </div>
  )
}
