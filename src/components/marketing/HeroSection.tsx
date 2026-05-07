'use client'

import Image from 'next/image'
import { Shield, ChevronDown } from 'lucide-react'

const STATS = [
  { value: '25–35%', label: 'HISTORICAL ANNUAL PERFORMANCE' },
  { value: 'Quarterly', label: 'PROFIT DISTRIBUTIONS' },
  { value: '3 Markets', label: 'FOREX · COMMODITIES · CRYPTO' },
  { value: 'Invite Only', label: 'REFERRAL-GATED ENTRY' },
]

export function HeroSection() {
  const scrollTo = (id: string) =>
    document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <Image src="/banner.png" alt="" fill className="object-cover" priority />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to right, rgba(8,8,8,0.93) 0%, rgba(8,8,8,0.75) 50%, rgba(8,8,8,0.35) 100%)',
          }}
        />
      </div>

      {/* Compass overlay */}
      <div className="absolute bottom-0 right-0 z-0 w-[42vw] pointer-events-none overflow-hidden">
        <Image
          src="/compass.png"
          alt=""
          width={900}
          height={900}
          className="w-full h-auto opacity-30 mix-blend-luminosity translate-x-[12%] translate-y-[8%]"
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col justify-center max-w-[1200px] mx-auto w-full px-5 lg:px-10 pt-28 pb-20">
        <div className="max-w-[600px]">
          <p className="text-gold text-[11px] font-sans uppercase tracking-[0.2em] mb-6">
            Proprietary Trading · Forex · Commodities · Crypto
          </p>

          <h1 className="font-serif font-bold leading-[1.0] text-[#F0EDE6] mb-6 text-[42px] sm:text-[56px] lg:text-[72px]">
            Where capital
            <br />
            finds direction<span className="text-gold">.</span>
          </h1>

          <div className="w-16 h-px bg-gold mb-6" />

          <p className="text-[#9A9080] text-[16px] lg:text-[17px] font-sans font-light leading-[1.7] max-w-[480px] mb-2">
            We don't sell returns. We share them.
          </p>
          <p className="text-[#9A9080] text-[16px] lg:text-[17px] font-sans font-light leading-[1.7] max-w-[480px] mb-10">
            A founder-led trading desk that selectively partners with individuals who want
            their capital working, not sitting idle.
          </p>

          {/* CTAs */}
          <div className="flex items-center gap-3 flex-wrap mb-12">
            <button
              onClick={() => scrollTo('#contact')}
              className="w-[200px] bg-gold text-[#080808] text-[15px] font-sans font-medium tracking-[0.04em] px-6 py-3 rounded-[4px] hover:opacity-90 transition-opacity cursor-pointer border-none"
            >
              Talk to us →
            </button>
            <button
              onClick={() => scrollTo('#how')}
              className="w-[200px] border border-[rgba(245,166,35,0.35)] text-[#9A9080] text-[15px] font-sans tracking-[0.03em] px-6 py-3 rounded-[4px] hover:border-[rgba(245,166,35,0.7)] hover:text-[#F0EDE6] transition-colors cursor-pointer bg-transparent"
            >
              How it works ↓
            </button>
          </div>

          {/* Stats — 4×1 on desktop */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-5">
            {STATS.map((stat, i) => (
              <div
                key={stat.label}
                className="flex items-stretch"
              >
                {i > 0 && (
                  <div className="w-px self-stretch bg-[rgba(245,166,35,0.2)] mr-5 hidden lg:block" />
                )}
                <div>
                  <p className="font-dm-serif text-[20px] lg:text-[22px] text-gold leading-tight">
                    {stat.value}
                  </p>
                  <p className="text-[#9A9080] text-[10px] font-sans uppercase tracking-[0.1em] mt-1">
                    {stat.label}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 mt-6">
            <Shield size={12} className="text-[#6B6152] flex-shrink-0" />
            <p className="text-[#6B6152] text-[11px] font-sans font-light">
              Performance figures are historical and market-linked. No fixed or guaranteed returns.
            </p>
          </div>
        </div>
      </div>

      {/* Scroll indicator — arrow only, no text, no animation */}
      <button
        onClick={() => scrollTo('#what')}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex items-center justify-center cursor-pointer bg-transparent border-none"
        aria-label="Scroll down"
      >
        <div className="w-8 h-8 rounded-full border border-[rgba(245,166,35,0.3)] flex items-center justify-center hover:border-[rgba(245,166,35,0.6)] transition-colors">
          <ChevronDown size={14} className="text-gold" />
        </div>
      </button>
    </section>
  )
}
