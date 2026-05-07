'use client'

import { useState } from 'react'
import { Shield } from 'lucide-react'

const ANNUAL_RATE = 0.3
const QUARTERLY_RATE = ANNUAL_RATE / 4
const MIN = 100000    // ₹1L
const MAX = 5000000   // ₹50L
const DEFAULT = 500000 // ₹5L

function fmt(rupees: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(rupees)
}

function calc(principal: number) {
  return {
    annual: Math.round(principal * ANNUAL_RATE),
    quarterly: Math.round(principal * QUARTERLY_RATE),
    threeYear: Math.round(principal * Math.pow(1 + ANNUAL_RATE, 3)),
  }
}

export function Calculator() {
  const [principal, setPrincipal] = useState(DEFAULT)
  const result = calc(principal)

  const pct = ((principal - MIN) / (MAX - MIN)) * 100

  return (
    <section className="py-[120px] lg:py-[60px] relative overflow-hidden" style={{ background: '#050505' }}>
      {/* Radial gold glow center */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(245,166,35,0.07) 0%, transparent 60%)',
        }}
      />

      <div className="max-w-[1200px] mx-auto px-10 md:px-5 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-16 lg:gap-12 items-start">
          {/* Left — heading */}
          <div className="fade-up" data-delay="0">
            <p className="text-gold text-[11px] font-sans uppercase tracking-[0.2em] mb-3">
              Returns Illustration
            </p>
            <h2 className="font-serif text-[40px] md:text-[32px] font-semibold text-[#F0EDE6] leading-[1.2] mb-6">
              See what performance-linked profit sharing could look like.
            </h2>
            <p className="text-[#8A8070] text-[13px] font-sans font-light leading-[1.7] mb-8 max-w-[420px]">
              Illustrative only. Based on historical performance of 25–35% annually. Not a
              guarantee of future returns.
            </p>

            {/* Disclaimer box */}
            <div
              className="rounded-[8px] p-5"
              style={{ border: '1px solid rgba(245,166,35,0.15)', background: 'rgba(245,166,35,0.03)' }}
            >
              <div className="flex items-start gap-3">
                <Shield size={16} className="text-gold flex-shrink-0 mt-0.5" />
                <p className="text-[#4A4438] text-[12px] font-sans font-light leading-[1.6]">
                  Wealthon Capital Ventures is a proprietary trading firm. Capital partnerships
                  are profit-sharing arrangements and not fixed deposit schemes or guaranteed
                  return products. All figures shown are illustrative and based on historical
                  performance. Past performance does not guarantee future results.
                </p>
              </div>
            </div>
          </div>

          {/* Right — slider + outputs */}
          <div className="fade-up" data-delay="120">
            {/* Principal display */}
            <p className="text-[#4A4438] text-[11px] font-sans uppercase tracking-[0.15em] mb-2">
              Capital Amount
            </p>
            <p className="font-serif font-semibold text-[48px] md:text-[36px] text-gold leading-tight mb-8">
              {fmt(principal)}
            </p>

            {/* Slider */}
            <div className="mb-10 relative">
              <input
                type="range"
                min={MIN}
                max={MAX}
                step={50000}
                value={principal}
                onChange={(e) => setPrincipal(Number(e.target.value))}
                className="w-full"
                style={
                  {
                    '--pct': `${pct}%`,
                    background: `linear-gradient(to right, #F5A623 ${pct}%, rgba(245,166,35,0.15) ${pct}%)`,
                  } as React.CSSProperties
                }
              />
              <div className="flex justify-between mt-2">
                <span className="text-[#4A4438] text-[11px] font-sans">₹1L</span>
                <span className="text-[#4A4438] text-[11px] font-sans">₹50L</span>
              </div>
            </div>

            {/* Output cards */}
            <div className="grid grid-cols-3 sm:grid-cols-1 gap-3">
              {[
                { label: 'Est. Annual Return', value: fmt(result.annual), sub: 'at 30% midpoint' },
                { label: 'Quarterly Distribution', value: fmt(result.quarterly), sub: 'per quarter' },
                {
                  label: '3-Year Compounded Value',
                  value: fmt(result.threeYear),
                  sub: 'compounded annually',
                },
              ].map((m) => (
                <div
                  key={m.label}
                  className="rounded-[8px] p-4"
                  style={{
                    background: 'linear-gradient(180deg, rgba(245,166,35,0.06) 0%, transparent 60%)',
                    border: '1px solid rgba(245,166,35,0.15)',
                  }}
                >
                  <p className="text-[#8A8070] text-[10px] font-sans uppercase tracking-[0.1em] mb-2">
                    {m.label}
                  </p>
                  <p className="font-serif font-semibold text-[22px] text-gold leading-tight mb-1">
                    {m.value}
                  </p>
                  <p className="text-[#4A4438] text-[11px] font-sans font-light">{m.sub}</p>
                </div>
              ))}
            </div>

            <p className="text-[#4A4438] text-[11px] font-sans font-light mt-4">
              Market-linked. Not guaranteed. For illustration only.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
