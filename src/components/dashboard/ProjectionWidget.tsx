'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { ReturnCalculator } from '@/components/shared/ReturnCalculator'

interface Props {
  capitalPaise: number
  monthlyRate?: number   // decimal
  profitShare?: number   // percent
}

export function ProjectionWidget({ capitalPaise, monthlyRate, profitShare }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div
      className="rounded-[8px]"
      style={{ background: '#111111', border: '0.5px solid rgba(245,166,35,0.15)' }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-5 cursor-pointer bg-transparent border-none"
      >
        <div className="text-left">
          <h3 className="font-serif text-[18px] text-[#F0EDE6]">Your Return Projection</h3>
          <p className="text-[12px] font-sans text-[#9A9080] mt-0.5">
            See how your capital could grow under different preferences
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-[12px] font-sans text-gold">
          {open ? <>Hide <ChevronUp size={13} /></> : <>Expand <ChevronDown size={13} /></>}
        </span>
      </button>
      {open && (
        <div className="px-5 pb-5">
          <ReturnCalculator
            mode="dashboard"
            initialAmount={capitalPaise}
            monthlyRate={monthlyRate}
            profitShare={profitShare}
            amountReadOnly
          />
        </div>
      )}
    </div>
  )
}
