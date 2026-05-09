'use client'

import { PIPELINE_STAGES, PIPELINE_STAGE_LABELS } from '@/config/constants'

interface Props {
  stageCounts: number[]
  totalLeads:  number
}

export function FunnelStrip({ stageCounts, totalLeads }: Props) {
  const maxCount = Math.max(...stageCounts, 1)

  return (
    <div className="rounded-[10px] p-5 mb-5 overflow-x-auto"
      style={{ background: '#111111', border: '0.5px solid rgba(245,166,35,0.15)' }}>
      <div className="flex items-stretch gap-0 min-w-max">
        {PIPELINE_STAGES.map((stage, i) => {
          const count   = stageCounts[i] ?? 0
          const prev    = stageCounts[i - 1] ?? 0
          const convPct = i === 0 ? 100 : prev > 0 ? Math.round((count / prev) * 100) : 0
          const barPct  = Math.round((count / maxCount) * 100)

          return (
            <div key={stage} className="flex items-center">
              <div className="flex flex-col gap-2 px-6 py-1" style={{ minWidth: 130 }}>
                <span className="text-[10px] font-sans uppercase tracking-[0.1em] text-[#9A9080]">
                  {PIPELINE_STAGE_LABELS[stage]}
                </span>
                <div className="flex items-end gap-3">
                  <span className="font-dm-serif text-[36px] leading-none text-[#F0EDE6]">{count}</span>
                  {i > 0 && (
                    <span className="text-[11px] font-sans mb-1"
                      style={{ color: convPct >= 50 ? '#22C55E' : convPct >= 25 ? '#F59E0B' : '#9A9080' }}>
                      {convPct}%
                    </span>
                  )}
                </div>
                <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)', width: '100%' }}>
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${barPct}%`,
                      background: i === 0 ? '#F5A623'
                        : i === PIPELINE_STAGES.length - 1 ? '#22C55E'
                        : 'rgba(245,166,35,0.5)',
                    }}
                  />
                </div>
              </div>

              {i < PIPELINE_STAGES.length - 1 && (
                <svg width="16" height="24" viewBox="0 0 16 24" className="flex-shrink-0" style={{ opacity: 0.25 }}>
                  <polyline points="0,0 14,12 0,24" fill="none" stroke="#F5A623" strokeWidth="1.5" />
                </svg>
              )}
            </div>
          )
        })}

        <div className="ml-6 pl-6 flex flex-col justify-center gap-1" style={{ borderLeft: '1px solid rgba(255,255,255,0.06)' }}>
          <span className="text-[10px] font-sans uppercase tracking-[0.1em] text-[#9A9080]">Total</span>
          <span className="font-dm-serif text-[36px] leading-none text-[#F5A623]">{totalLeads}</span>
        </div>
      </div>
    </div>
  )
}
