'use client'

import dynamic from 'next/dynamic'
import { Shield } from 'lucide-react'

const ReturnCalculator = dynamic(
  () => import('@/components/shared/ReturnCalculator').then(m => m.ReturnCalculator),
  { ssr: false, loading: () => <div className="h-[420px] rounded-[10px]" style={{ background: '#111111', border: '0.5px solid rgba(245,166,35,0.15)' }} /> },
)

export function Calculator() {
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
              See what your money could earn.
            </h2>
            <p className="text-[#9A9080] text-[13px] font-sans font-light leading-[1.7] mb-8 max-w-[420px]">
              Illustrative only. Live rate from our firm rate book. Profit-sharing is
              market-linked — not a guarantee of future returns.
            </p>

            <div
              className="rounded-[8px] p-5"
              style={{ border: '1px solid rgba(245,166,35,0.15)', background: 'rgba(245,166,35,0.03)' }}
            >
              <div className="flex items-start gap-3">
                <Shield size={16} className="text-gold flex-shrink-0 mt-0.5" />
                <p className="text-[#7F7566] text-[12px] font-sans font-light leading-[1.6]">
                  Wealthon Capital Ventures is a proprietary trading firm. Capital partnerships
                  are profit-sharing arrangements and not fixed deposit schemes or guaranteed
                  return products. All figures shown are illustrative.
                </p>
              </div>
            </div>
          </div>

          {/* Right — interactive calculator */}
          <div className="fade-up" data-delay="120">
            <ReturnCalculator mode="public" />
          </div>
        </div>
      </div>
    </section>
  )
}
