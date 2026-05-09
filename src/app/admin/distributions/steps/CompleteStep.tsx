'use client'

import { CheckCircle2 } from 'lucide-react'
import { formatINRCompact } from '@/lib/utils'

interface Props {
  quarter:     number
  year:        number
  totalPayout: number
  onReset:     () => void
}

export function CompleteStep({ quarter, year, totalPayout, onReset }: Props) {
  return (
    <div className="rounded-[8px] p-8 flex flex-col items-center gap-4 text-center"
      style={{ background: '#111111', border: '0.5px solid rgba(245,166,35,0.15)' }}>
      <CheckCircle2 size={48} className="text-[#22C55E]" />
      <h3 className="font-serif text-[22px] text-[#F0EDE6]">Distribution complete<span className="text-gold">.</span></h3>
      <p className="text-[14px] font-sans text-[#9A9080] max-w-[400px]">
        Q{quarter} {year} distribution of {formatINRCompact(totalPayout)} has been confirmed and logged.
      </p>
      <button onClick={onReset}
        className="mt-2 text-[14px] font-sans px-5 py-2.5 rounded-[4px] cursor-pointer border-none"
        style={{ background: 'rgba(245,166,35,0.1)', color: '#F5A623' }}>
        Run another →
      </button>
    </div>
  )
}
