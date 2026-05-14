'use client'

import { useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { formatINR, formatINRCompact } from '@/lib/utils'

const GrowthChart = dynamic(() => import('./ReturnCalculatorChart').then(m => m.GrowthChart), {
  ssr: false,
  loading: () => <div className="h-[220px]" />,
})

export type CalculatorMode = 'public' | 'apply' | 'admin' | 'dashboard'

interface Config {
  monthlyRate:   number   // %
  profitShare:   number   // %
  minInvestment: number   // paise
  maxInvestment: number   // paise
  maxYears:      number
  rateLabel:     string
}

interface Props {
  mode:            CalculatorMode
  initialAmount?:  number   // paise
  monthlyRate?:    number   // override (decimal e.g. 0.025)
  profitShare?:    number   // override (percent e.g. 75)
  onAmountChange?: (paise: number) => void
  compact?:        boolean
  amountReadOnly?: boolean
}

const DURATION_OPTIONS = [1, 2, 3, 5] as const

export function ReturnCalculator({
  mode,
  initialAmount,
  monthlyRate,
  profitShare,
  onAmountChange,
  compact = false,
  amountReadOnly = false,
}: Props) {
  const [config, setConfig]     = useState<Config | null>(null)
  const [pref, setPref]         = useState<'payout' | 'reinvest'>('payout')
  const [years, setYears]       = useState<number>(3)
  const [amount, setAmount]     = useState<number>(initialAmount ?? 500000) // paise default ₹5L
  const [amountText, setAmountText] = useState<string>(((initialAmount ?? 500000) / 100).toFixed(0))

  // Fetch config (rate, min/max, etc.) if not overridden
  useEffect(() => {
    let cancelled = false
    fetch('/api/calculator/config', { cache: 'force-cache' })
      .then(r => r.json())
      .then((c: Config) => {
        if (cancelled) return
        setConfig(c)
        if (years > c.maxYears) setYears(c.maxYears)
        if (!initialAmount) {
          setAmount(Math.max(c.minInvestment, Math.min(c.maxInvestment, 500000)))
          setAmountText((Math.max(c.minInvestment, Math.min(c.maxInvestment, 500000)) / 100).toFixed(0))
        }
      })
      .catch(() => {
        if (cancelled) return
        // Fallback config: 2.5% / 75% / ₹1L–₹5Cr / 5y
        setConfig({
          monthlyRate: 2.5, profitShare: 75,
          minInvestment: 100000, maxInvestment: 500000000, maxYears: 5,
          rateLabel: '2.5% per month',
        })
      })
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sync external initialAmount changes
  useEffect(() => {
    if (initialAmount !== undefined && initialAmount !== amount) {
      setAmount(initialAmount)
      setAmountText((initialAmount / 100).toFixed(0))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialAmount])

  const ratePct  = monthlyRate !== undefined ? monthlyRate * 100 : config?.monthlyRate ?? 2.5
  const sharePct = profitShare ?? config?.profitShare ?? 75
  const rateDec  = ratePct / 100
  const shareDec = sharePct / 100

  const capitalRupees = amount / 100
  const months = years * 12

  const projection = useMemo(() => {
    if (!config) return null
    // Payout (flat)
    const monthlyPayout = Math.round(capitalRupees * rateDec * shareDec * 100) // paise
    const annualPayout  = monthlyPayout * 12
    const totalPayout   = monthlyPayout * months

    // Reinvest (compound — full monthly profit reinvested into capital base)
    let cap = capitalRupees
    for (let m = 0; m < months; m++) {
      cap = cap * (1 + rateDec * shareDec)
    }
    const finalCapitalPaise = Math.round(cap * 100)
    const totalProfitPaise  = finalCapitalPaise - amount

    // Series for chart (yearly points)
    const series: { year: number; payout: number; reinvest: number }[] = []
    for (let y = 0; y <= years; y++) {
      const monthsAt = y * 12
      let capAt = capitalRupees
      for (let m = 0; m < monthsAt; m++) {
        capAt = capAt * (1 + rateDec * shareDec)
      }
      series.push({
        year: y,
        payout:   amount + monthlyPayout * monthsAt,       // capital preserved + cumulative payout
        reinvest: Math.round(capAt * 100),
      })
    }

    return { monthlyPayout, annualPayout, totalPayout, finalCapitalPaise, totalProfitPaise, series }
  }, [config, capitalRupees, rateDec, shareDec, months, years, amount])

  function commitAmount(rupeesText: string) {
    const n = Number(rupeesText.replace(/[^0-9]/g, ''))
    if (isNaN(n)) return
    if (!config) {
      const paise = Math.round(n * 100)
      setAmount(paise)
      setAmountText(String(n))
      onAmountChange?.(paise)
      return
    }
    const minRupees = config.minInvestment / 100
    const maxRupees = config.maxInvestment / 100
    const clamped = Math.max(minRupees, Math.min(maxRupees, n))
    const paise = Math.round(clamped * 100)
    setAmount(paise)
    setAmountText(String(clamped))
    onAmountChange?.(paise)
  }

  if (!config || !projection) {
    return (
      <div className="rounded-[10px] p-6 animate-pulse flex flex-col gap-3"
        style={{ background: '#111111', border: '0.5px solid rgba(245,166,35,0.15)' }}>
        <div className="h-3 w-40 rounded" style={{ background: 'rgba(255,255,255,0.06)' }} />
        <div className="h-10 w-64 rounded" style={{ background: 'rgba(255,255,255,0.06)' }} />
        <div className="h-2 w-full rounded" style={{ background: 'rgba(255,255,255,0.04)' }} />
      </div>
    )
  }

  const minRupees = config.minInvestment / 100
  const maxRupees = config.maxInvestment / 100
  const sliderPct = ((capitalRupees - minRupees) / (maxRupees - minRupees)) * 100
  const effectiveAnnualPct = (Math.pow(1 + rateDec * shareDec, 12) - 1) * 100

  // ── Output cards ─────────────────────────────────────────────────────────
  const payoutCards = [
    { label: 'Monthly Payout', value: formatINR(projection.monthlyPayout) },
    { label: 'Annual Total',   value: formatINR(projection.annualPayout) },
    { label: `Over ${years} Year${years === 1 ? '' : 's'}`, value: formatINR(projection.totalPayout) },
  ]

  const reinvestCards = [
    { label: 'Monthly Addition', value: formatINR(Math.round(amount * rateDec * shareDec)) },
    { label: `After ${years} Year${years === 1 ? '' : 's'}`, value: formatINR(projection.finalCapitalPaise) },
    { label: 'Total Profit', value: formatINR(projection.totalProfitPaise) },
  ]

  const cards = pref === 'payout' ? payoutCards : reinvestCards

  return (
    <div
      className="rounded-[10px] p-5 sm:p-6 flex flex-col gap-6"
      style={{ background: '#111111', border: '0.5px solid rgba(245,166,35,0.2)' }}
    >
      {/* Amount input */}
      <div>
        <p className="text-[10px] font-sans uppercase tracking-[0.12em] text-gold mb-2">Capital amount</p>
        <div className="flex items-baseline gap-3 mb-4 flex-wrap">
          <p className="font-dm-serif text-[36px] sm:text-[44px] text-gold leading-none">
            {formatINR(amount)}
          </p>
          {!amountReadOnly && (
            <input
              type="text"
              inputMode="numeric"
              value={amountText}
              onChange={e => setAmountText(e.target.value)}
              onBlur={() => commitAmount(amountText)}
              onKeyDown={e => e.key === 'Enter' && commitAmount(amountText)}
              className="text-[13px] font-sans px-3 py-1.5 rounded-[4px] outline-none w-32 tabular-nums"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#F0EDE6',
              }}
              placeholder="Or type ₹"
            />
          )}
        </div>
        {!amountReadOnly && (
          <>
            <input
              type="range"
              min={minRupees}
              max={maxRupees}
              step={10000}
              value={capitalRupees}
              onChange={e => {
                const v = Number(e.target.value)
                const paise = Math.round(v * 100)
                setAmount(paise)
                setAmountText(String(v))
                onAmountChange?.(paise)
              }}
              className="w-full"
              style={{
                appearance: 'none',
                background: `linear-gradient(to right, #F5A623 ${sliderPct}%, rgba(245,166,35,0.15) ${sliderPct}%)`,
                height: 4,
                borderRadius: 2,
                outline: 'none',
              }}
            />
            <div className="flex justify-between mt-1.5">
              <span className="text-[11px] font-sans text-[#7F7566]">{formatINRCompact(config.minInvestment)}</span>
              <span className="text-[11px] font-sans text-[#7F7566]">{formatINRCompact(config.maxInvestment)}</span>
            </div>
          </>
        )}
      </div>

      {/* Payout preference */}
      <div>
        <p className="text-[10px] font-sans uppercase tracking-[0.12em] text-gold mb-2">Preference</p>
        <div className="inline-flex rounded-[6px] overflow-hidden"
          style={{ border: '1px solid rgba(245,166,35,0.25)', background: '#0F0F0F' }}>
          {[
            { value: 'payout',   label: 'Monthly Payout' },
            { value: 'reinvest', label: 'Reinvest' },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => setPref(opt.value as 'payout' | 'reinvest')}
              className="px-4 py-2 text-[12px] font-sans cursor-pointer border-none"
              style={{
                background: pref === opt.value ? '#F5A623' : 'transparent',
                color:      pref === opt.value ? '#080808' : '#9A9080',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div>
        <p className="text-[10px] font-sans uppercase tracking-[0.12em] text-gold mb-2">Duration</p>
        <div className="flex gap-2 flex-wrap">
          {DURATION_OPTIONS.filter(y => y <= config.maxYears).map(y => (
            <button
              key={y}
              onClick={() => setYears(y)}
              className="px-4 py-2 rounded-[4px] text-[13px] font-sans cursor-pointer border bg-transparent"
              style={{
                borderColor: years === y ? '#F5A623' : 'rgba(255,255,255,0.1)',
                color:       years === y ? '#F5A623' : '#9A9080',
                background:  years === y ? 'rgba(245,166,35,0.08)' : 'transparent',
              }}
            >
              {y}Y
            </button>
          ))}
        </div>
      </div>

      {/* Output cards */}
      <div className={`grid gap-3 ${compact ? 'sm:grid-cols-3' : 'sm:grid-cols-3'}`}>
        {cards.map((m, i) => (
          <div
            key={i}
            className="rounded-[8px] p-4"
            style={{ background: 'rgba(245,166,35,0.04)', border: '1px solid rgba(245,166,35,0.15)' }}
          >
            <p className="text-[10px] font-sans uppercase tracking-[0.08em] text-[#8A8070] mb-1.5">{m.label}</p>
            <p className="font-dm-serif text-[20px] sm:text-[22px] text-gold leading-none tabular-nums">
              {m.value}
            </p>
          </div>
        ))}
      </div>

      {/* Caption */}
      {pref === 'payout' ? (
        <p className="text-[11px] font-sans text-[#7F7566] -mt-2">
          Capital remains <span className="text-[#F0EDE6]">{formatINR(amount)}</span>{' · '}
          effective annual rate <span className="text-[#F0EDE6]">{(rateDec * shareDec * 12 * 100).toFixed(1)}%</span>
        </p>
      ) : (
        <p className="text-[11px] font-sans text-[#7F7566] -mt-2">
          Compounding monthly{' · '}
          effective annual rate <span className="text-[#F0EDE6]">{effectiveAnnualPct.toFixed(1)}%</span>
        </p>
      )}

      {/* Chart */}
      {!compact && (
        <div className="mt-2">
          <GrowthChart data={projection.series} />
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-[11px] font-sans font-light text-[#7F7566] leading-[1.6] mt-1"
         style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 12 }}>
        Based on current rate of <span className="text-[#F0EDE6]">{ratePct.toFixed(2)}%/month</span>{' · '}
        partner share <span className="text-[#F0EDE6]">{sharePct}%</span>. Historical performance,
        not a guarantee. All returns are market-linked.
      </p>
    </div>
  )
}
