'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { formatINRCompact } from '@/lib/utils'

interface Point { year: number; payout: number; reinvest: number }

function ChartTooltip({ active, payload, label }: {
  active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string | number
}) {
  if (!active || !payload?.length) return null
  return (
    <div
      className="px-3 py-2 rounded-[4px] text-[12px] font-sans"
      style={{ background: '#1a1a1a', border: '1px solid rgba(245,166,35,0.3)', color: '#F0EDE6' }}
    >
      <p className="text-[#9A9080] mb-1">Year {label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }} className="tabular-nums">
          {p.name}: {formatINRCompact(p.value)}
        </p>
      ))}
    </div>
  )
}

export function GrowthChart({ data }: { data: Point[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
        <XAxis
          dataKey="year"
          tick={{ fill: '#9A9080', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={v => `${v}Y`}
        />
        <YAxis
          tickFormatter={v => formatINRCompact(v as number)}
          tick={{ fill: '#9A9080', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          width={56}
        />
        <Tooltip content={<ChartTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: 11, color: '#9A9080' }}
          iconType="line"
        />
        <Line type="monotone" dataKey="reinvest" stroke="#F5A623" strokeWidth={2} dot={false} name="Reinvest" />
        <Line type="monotone" dataKey="payout"   stroke="#3B82F6" strokeWidth={2} dot={false} name="Monthly Payout" strokeDasharray="4 4" />
      </LineChart>
    </ResponsiveContainer>
  )
}
