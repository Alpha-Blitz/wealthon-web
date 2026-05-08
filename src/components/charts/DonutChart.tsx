'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { formatINR, formatINRCompact } from '@/lib/utils'
import { CONTENT } from '@/config/content'
import type { Allocation } from '@/types/database'

const COLORS = ['#F5A623', '#3B82F6', '#06B6D4', '#F59E0B', '#8B5CF6']

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ name: string; value: number; payload: { amount: number } }>
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  const p = payload[0]
  return (
    <div
      className="px-3 py-2 rounded-[4px] text-[12px] font-sans"
      style={{ background: '#1a1a1a', border: '1px solid rgba(245,166,35,0.3)', color: '#F0EDE6' }}
    >
      <p className="font-medium mb-1">{p.name}</p>
      <p className="text-[#9E9484]">{p.value.toFixed(1)}%</p>
      <p className="text-gold">{formatINR(p.payload.amount)}</p>
    </div>
  )
}

export function DonutChart({ allocations }: { allocations: Allocation[] }) {
  const total = allocations.reduce((s, a) => s + a.amount, 0)
  const C = CONTENT.pnl

  return (
    <div>
      <h3 className="font-serif text-[18px] text-[#F0EDE6] mb-4">{C.allocationTitle}</h3>
      <div className="relative">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={allocations}
              dataKey="percentage"
              nameKey="asset_class"
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={2}
              startAngle={90}
              endAngle={-270}
            >
              {allocations.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-[11px] font-sans text-[#9E9484] uppercase tracking-[0.1em]">{C.totalLabel}</p>
          <p className="font-dm-serif text-[18px] text-gold leading-tight">{formatINRCompact(total)}</p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-2 mt-4">
        {allocations.map((a, i) => (
          <div key={a.asset_class} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
              <span className="text-[12px] font-sans text-[#9E9484]">{a.asset_class}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[12px] font-sans text-[#F0EDE6]">{a.percentage}%</span>
              <span className="text-[11px] font-sans text-[#68625A]">{formatINRCompact(a.amount)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
