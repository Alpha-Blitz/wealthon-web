'use client'

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { formatINRCompact } from '@/lib/utils'

const TIER_COLORS: Record<string, string> = { L1: '#F5A623', L2: '#8B5CF6', L3: '#06B6D4', L4: '#3B82F6' }

interface TierData { tier: string; amount: number }

export function AumDonut({ data, totalAUM }: { data: TierData[]; totalAUM: number }) {
  return (
    <>
      <div className="relative">
        <ResponsiveContainer width="100%" height={160}>
          <PieChart>
            <Pie
              data={data}
              dataKey="amount"
              nameKey="tier"
              cx="50%" cy="50%"
              innerRadius={55} outerRadius={80}
              paddingAngle={2} startAngle={90} endAngle={-270}
            >
              {data.map((t, i) => (
                <Cell key={t.tier} fill={TIER_COLORS[t.tier] ?? `hsl(${i * 60},70%,60%)`} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-[10px] font-sans text-[#9A9080] uppercase tracking-[0.08em]">Total</p>
          <p className="font-dm-serif text-[16px] text-[#F5A623]">{formatINRCompact(totalAUM)}</p>
        </div>
      </div>
      <div className="flex flex-col gap-1.5 mt-3">
        {data.map((t, i) => (
          <div key={t.tier} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: TIER_COLORS[t.tier] ?? `hsl(${i * 60},70%,60%)` }} />
              <span className="text-[12px] font-sans text-[#9A9080]">{t.tier}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-sans text-[#9A9080]">{Math.round((t.amount / (totalAUM || 1)) * 100)}%</span>
              <span className="text-[12px] font-sans text-[#F0EDE6]">{formatINRCompact(t.amount)}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
