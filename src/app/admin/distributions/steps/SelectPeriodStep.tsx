'use client'

import { CONTENT } from '@/config/content'

const C = CONTENT.admin.distributions
const CURRENT_YEAR = new Date().getFullYear()

interface Props {
  quarter:    number
  year:       number
  loading:    boolean
  error:      string | null
  onQuarterChange: (q: number) => void
  onYearChange:    (y: number) => void
  onProceed:  () => void
}

export function SelectPeriodStep({ quarter, year, loading, error, onQuarterChange, onYearChange, onProceed }: Props) {
  return (
    <div className="rounded-[8px] p-6 flex flex-col gap-5"
      style={{ background: '#111111', border: '0.5px solid rgba(245,166,35,0.15)' }}>
      <h3 className="font-serif text-[18px] text-[#F0EDE6]">
        Select distribution period<span className="text-gold">.</span>
      </h3>
      <div className="flex gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-sans uppercase tracking-[0.08em] text-[#9A9080]">Quarter</label>
          <select value={quarter} onChange={e => onQuarterChange(Number(e.target.value))}
            className="text-[14px] font-sans text-[#F0EDE6] px-3 py-2.5 rounded-[6px] outline-none cursor-pointer"
            style={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.08)', minWidth: 100 }}>
            {[1,2,3,4].map(q => <option key={q} value={q}>Q{q}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-sans uppercase tracking-[0.08em] text-[#9A9080]">Year</label>
          <select value={year} onChange={e => onYearChange(Number(e.target.value))}
            className="text-[14px] font-sans text-[#F0EDE6] px-3 py-2.5 rounded-[6px] outline-none cursor-pointer"
            style={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.08)', minWidth: 100 }}>
            {[CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>
      {error && <p className="text-[12px] font-sans" style={{ color: '#EF4444' }}>{error}</p>}
      <button onClick={onProceed} disabled={loading}
        className="self-start text-[14px] font-sans px-5 py-2.5 rounded-[4px] cursor-pointer border-none disabled:opacity-50"
        style={{ background: '#F5A623', color: '#080808' }}>
        {loading ? 'Loading…' : C.proceed}
      </button>
    </div>
  )
}
