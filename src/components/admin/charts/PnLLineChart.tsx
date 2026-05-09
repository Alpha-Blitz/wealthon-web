'use client'

import {
  LineChart as ReLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { formatINRCompact } from '@/lib/utils'

interface DataPoint { month: string; profit: number }

function TooltipContent({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="px-3 py-2 rounded-[4px] text-[12px] font-sans"
      style={{ background: '#1a1a1a', border: '1px solid rgba(245,166,35,0.3)', color: '#F0EDE6' }}>
      <p className="text-[#9E9484] mb-1">{label}</p>
      <p style={{ color: (payload[0].value ?? 0) >= 0 ? '#22C55E' : '#EF4444' }}>
        {formatINRCompact(payload[0].value ?? 0)}
      </p>
    </div>
  )
}

export function PnLLineChart({ data }: { data: DataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <ReLineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
        <XAxis dataKey="month" tick={{ fill: '#9E9484', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={v => formatINRCompact(v as number)} tick={{ fill: '#9E9484', fontSize: 10 }} axisLine={false} tickLine={false} width={56} />
        <Tooltip content={<TooltipContent />} />
        <Line type="monotone" dataKey="profit" stroke="#F5A623" strokeWidth={2} dot={false} name="Monthly P&L" />
      </ReLineChart>
    </ResponsiveContainer>
  )
}
