'use client'

import { useState } from 'react'
import { Shield } from 'lucide-react'

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

function calcRange(principal: number) {
  return {
    annualMin: Math.round(principal * 0.25),
    annualMax: Math.round(principal * 0.35),
    quarterlyMin: Math.round(principal * 0.25 / 4),
    quarterlyMax: Math.round(principal * 0.35 / 4),
    threeYearMin: Math.round(principal * Math.pow(1.25, 3)),
    threeYearMax: Math.round(principal * Math.pow(1.35, 3)),
  }
}

export function Calculator() {
  const [principal, setPrincipal] = useState(DEFAULT)
  const r = calcRange(principal)
  const pct = ((principal - MIN) / (MAX - MIN)) * 100

  const metrics = [
    {
      label: 'Est. Annual Return',
      range: `${fmt(r.annualMin)} – ${fmt(r.annualMax)}`,
      sub: '25% – 35% range',
    },
    {
      label: 'Quarterly Distribution',
      range: `${fmt(r.quarterlyMin)} – ${fmt(r.quarterlyMax)}`,
      sub: 'per quarter',
    },
    {
      label: '3-Year Compounded',
      range: `${fmt(r.threeYearMin)} – ${fmt(r.threeYearMax)}`,
      sub: 'compounded annually',
    },
  ]

  return (
    <section className="py-[60px] lg:py-[120px] relative overflow-hidden" style={{ background: '#050505' }}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, rgba(245,166,35,0.07) 0%, transparent 60%)' }}
      />

      <div className="max-w-[1200px] mx-auto px-5 lg:px-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left — heading */}
          <div className="fade-up" data-delay="0">
            <p className="text-gold text-[11px] font-sans uppercase tracking-[0.2em] mb-3">
              Returns Illustration
            </p>
            <h2 className="font-serif text-[28px] md:text-[36px] lg:text-[40px] font-semibold text-[#F0EDE6] leading-[1.2] mb-6">
              See what performance-linked profit sharing could look like.
            </h2>
            <p className="text-[#9A9080] text-[13px] font-sans font-light leading-[1.7] mb-8 max-w-[420px]">
              Illustrative only. Based on historical performance of 25–35% annually. Not a
              guarantee of future returns.
            </p>

            <div
              className="rounded-[8px] p-5"
              style={{ border: '1px solid rgba(245,166,35,0.15)', background: 'rgba(245,166,35,0.03)' }}
            >
              <div className="flex items-start gap-3">
                <Shield size={16} className="text-gold flex-shrink-0 mt-0.5" />
                <p className="text-[#6B6152] text-[12px] font-sans font-light leading-[1.6]">
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
            <p className="text-[#6B6152] text-[11px] font-sans uppercase tracking-[0.15em] mb-2">
              Capital Amount
            </p>
            <p className="font-serif font-semibold text-[40px] lg:text-[48px] text-gold leading-tight mb-8">
              {fmt(principal)}
            </p>

            {/* Slider */}
            <div className="mb-10">
              <input
                type="range"
                min={MIN}
                max={MAX}
                step={50000}
                value={principal}
                onChange={(e) => setPrincipal(Number(e.target.value))}
                className="w-full"
                style={{
                  background: `linear-gradient(to right, #F5A623 ${pct}%, rgba(245,166,35,0.15) ${pct}%)`,
                }}
              />
              <div className="flex justify-between mt-2">
                <span className="text-[#6B6152] text-[11px] font-sans">₹1L</span>
                <span className="text-[#6B6152] text-[11px] font-sans">₹50L</span>
              </div>
            </div>

            {/* Output metric cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {metrics.map((m) => (
                <div
                  key={m.label}
                  className="rounded-[8px] p-4"
                  style={{
                    background: 'linear-gradient(180deg, rgba(245,166,35,0.06) 0%, transparent 60%)',
                    border: '1px solid rgba(245,166,35,0.15)',
                  }}
                >
                  <p className="text-[#9A9080] text-[10px] font-sans uppercase tracking-[0.1em] mb-2">
                    {m.label}
                  </p>
                  <p className="font-serif font-semibold text-[15px] lg:text-[16px] text-gold leading-snug mb-1">
                    {m.range}
                  </p>
                  <p className="text-[#6B6152] text-[11px] font-sans font-light">{m.sub}</p>
                </div>
              ))}
            </div>

            <p className="text-[#6B6152] text-[11px] font-sans font-light mt-4">
              Market-linked. Not guaranteed. For illustration only.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
