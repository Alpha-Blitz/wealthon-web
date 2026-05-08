'use client'

import { useState } from 'react'
import {
  LineChart as ReLineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { formatINRCompact } from '@/lib/utils'
import { CONTENT } from '@/config/content'
import type { PnLMonthly } from '@/types/database'

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const SERIES = [
  { key: 'all',        label: 'All Strategies', color: '#F5A623' },
  { key: 'forex',      label: 'Forex',          color: '#8B5CF6' },
  { key: 'commodity',  label: 'Commodities',    color: '#06B6D4' },
  { key: 'crypto',     label: 'Crypto',         color: '#3B82F6' },
]

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div
      className="px-3 py-2 rounded-[4px] text-[12px] font-sans"
      style={{ background: '#1a1a1a', border: '1px solid rgba(245,166,35,0.3)', color: '#F0EDE6' }}
    >
      <p className="text-[#9E9484] mb-2">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {formatINRCompact(p.value)}
        </p>
      ))}
    </div>
  )
}

function buildCumulative(data: PnLMonthly[]) {
  let all = 0, forex = 0, commodity = 0, crypto = 0
  return data.map(d => {
    all       += d.profit
    forex     += d.forex_profit
    commodity += d.commodity_profit
    crypto    += d.crypto_profit
    return {
      month:     MONTH_NAMES[(d.month - 1) % 12],
      all, forex, commodity, crypto,
    }
  })
}

function buildMonthly(data: PnLMonthly[]) {
  return data.map(d => ({
    month:     MONTH_NAMES[(d.month - 1) % 12],
    all:       d.profit,
    forex:     d.forex_profit,
    commodity: d.commodity_profit,
    crypto:    d.crypto_profit,
  }))
}

export function LineChart({ data }: { data: PnLMonthly[] }) {
  const [mode, setMode] = useState<'cumulative' | 'monthly'>('cumulative')
  const C = CONTENT.pnl
  const chartData = mode === 'cumulative' ? buildCumulative(data) : buildMonthly(data)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif text-[18px] text-[#F0EDE6]">{C.chartTitle}</h3>
        <div className="flex items-center gap-1 p-1 rounded-[4px]" style={{ background: 'rgba(255,255,255,0.04)' }}>
          {(['cumulative', 'monthly'] as const).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className="px-3 py-1 rounded-[3px] text-[12px] font-sans transition-all cursor-pointer border-none"
              style={{
                background: mode === m ? 'rgba(245,166,35,0.12)' : 'transparent',
                color:      mode === m ? '#F5A623' : '#9E9484',
              }}
            >
              {m === 'cumulative' ? C.cumulative : C.monthly}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full">
        <ResponsiveContainer width="100%" height={260}>
          <ReLineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="month" tick={{ fill: '#9E9484', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={v => formatINRCompact(v as number)} tick={{ fill: '#9E9484', fontSize: 10 }} axisLine={false} tickLine={false} width={56} />
            <Tooltip content={<CustomTooltip />} />
            {SERIES.map(s => (
              <Line key={s.key} type="monotone" dataKey={s.key} stroke={s.color} strokeWidth={2} dot={false} name={s.label} />
            ))}
          </ReLineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap mt-3">
        {SERIES.map(s => (
          <div key={s.key} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: s.color }} />
            <span className="text-[11px] font-sans text-[#9E9484]">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
