'use client'

import {
  BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { formatINRCompact } from '@/lib/utils'
import { CONTENT } from '@/config/content'

interface BarChartDataPoint {
  month: string
  profit: number
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  const val = payload[0].value
  return (
    <div
      className="px-3 py-2 rounded-[4px] text-[13px] font-sans"
      style={{ background: '#1a1a1a', border: '1px solid rgba(245,166,35,0.3)', color: '#F0EDE6' }}
    >
      <p className="text-[11px] text-[#9E9484] mb-1">{label}</p>
      <p style={{ color: val >= 0 ? '#22C55E' : '#EF4444' }}>
        {val >= 0 ? '+' : ''}{formatINRCompact(val)}
      </p>
    </div>
  )
}

interface BarChartProps {
  data: BarChartDataPoint[]
}

export function BarChart({ data }: BarChartProps) {
  return (
    <div className="w-full">
      <div className="w-full">
        <ResponsiveContainer width="100%" height={240}>
          <ReBarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
            <XAxis
              dataKey="month"
              tick={{ fill: '#9E9484', fontSize: 11, fontFamily: 'var(--font-inter)' }}
              axisLine={{ stroke: '#F5A623', strokeWidth: 1, strokeOpacity: 0.5 }}
              tickLine={false}
            />
            <YAxis
              tickFormatter={v => formatINRCompact(v as number)}
              tick={{ fill: '#9E9484', fontSize: 10, fontFamily: 'var(--font-inter)' }}
              axisLine={false}
              tickLine={false}
              width={56}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(245,166,35,0.04)' }} />
            <Bar dataKey="profit" radius={[3, 3, 0, 0]} maxBarSize={28}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.profit >= 0 ? '#0F5B2E' : '#8B1010'}
                  fillOpacity={0.95}
                  stroke="#F5A623"
                  strokeWidth={1.5}
                />
              ))}
            </Bar>
          </ReBarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center gap-2 mt-2">
        <div className="w-3 h-3 rounded-[2px]" style={{ background: '#F5A623' }} />
        <span className="text-[11px] font-sans text-[#9E9484]">{CONTENT.dashboard.chart.legend}</span>
      </div>
    </div>
  )
}
