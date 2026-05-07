import { TrendingUp, Layers, Handshake, MessageSquare, BarChart3, Building2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface ServiceCard {
  icon: LucideIcon
  title: string
  body: string
}

interface ComingSoonCard {
  icon: LucideIcon
  title: string
  sub: string
}

const SERVICES: ServiceCard[] = [
  {
    icon: TrendingUp,
    title: 'Active Trading',
    body: 'We trade across Forex, Commodities and Crypto markets daily on internationally regulated platforms and infrastructure.',
  },
  {
    icon: Layers,
    title: 'Portfolio Management',
    body: "Each capital partner's allocation is managed individually, tailored to their entry level, timeline and risk appetite.",
  },
  {
    icon: Handshake,
    title: 'Capital Partnerships',
    body: 'Selected individuals partner with the firm under a formal profit-sharing MoU. Referral and relationship-gated. No cold onboarding.',
  },
]

const COMING_SOON: ComingSoonCard[] = [
  { icon: MessageSquare, title: 'Financial Consulting', sub: 'Strategic money guidance' },
  { icon: BarChart3, title: 'Financial Advisory', sub: 'Planning beyond trading' },
  { icon: Building2, title: 'Real Estate', sub: 'Property as an asset class' },
]

export function WhatWeDo() {
  return (
    <section id="what" className="bg-[#0F0F0F] py-[120px] lg:py-[60px]">
      <div className="max-w-[1200px] mx-auto px-10 md:px-5">
        <p className="text-gold text-[11px] font-sans uppercase tracking-[0.2em] mb-3 fade-up" data-delay="0">
          Our Work
        </p>
        <h2 className="font-serif text-[40px] md:text-[32px] font-semibold text-[#F0EDE6] leading-[1.2] mb-4 fade-up" data-delay="60">
          What we do.
        </h2>
        <p className="text-[#8A8070] text-base font-sans font-light max-w-[520px] mb-12 fade-up" data-delay="120">
          We operate as a proprietary trading desk. Capital partners share in our performance,
          not in promises.
        </p>

        {/* Active service cards */}
        <div className="grid grid-cols-3 lg:grid-cols-1 gap-4 mb-4">
          {SERVICES.map((s, i) => (
            <div
              key={s.title}
              className="bg-[#111111] rounded-[8px] p-6 hover:-translate-y-0.5 hover:border-[rgba(245,166,35,0.4)] transition-all duration-200 fade-up"
              data-delay={i * 80}
              style={{
                border: '1px solid rgba(245,166,35,0.15)',
                borderTopColor: '#F5A623',
                borderTopWidth: '2px',
              }}
            >
              <s.icon size={22} className="text-gold mb-4" />
              <h3 className="font-serif text-[20px] text-[#F0EDE6] mb-3">{s.title}</h3>
              <p className="text-[#8A8070] text-[14px] font-sans font-light leading-[1.7]">{s.body}</p>
            </div>
          ))}
        </div>

        {/* Coming soon cards */}
        <div className="grid grid-cols-3 lg:grid-cols-1 gap-4">
          {COMING_SOON.map((s, i) => (
            <div
              key={s.title}
              className="bg-[#111111] rounded-[8px] p-6 fade-up"
              data-delay={i * 80}
              style={{
                border: '1px dashed rgba(245,166,35,0.2)',
                borderTopStyle: 'solid',
                borderTopColor: 'rgba(245,166,35,0.35)',
                borderTopWidth: '2px',
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <s.icon size={18} className="text-[#8A8070]" />
                <span className="text-[10px] font-sans uppercase tracking-[0.1em] text-[#4A4438] border border-[rgba(245,166,35,0.15)] px-2.5 py-0.5 rounded-full">
                  Coming Soon
                </span>
              </div>
              <h3 className="font-serif text-[18px] text-[#8A8070] mb-1">{s.title}</h3>
              <p className="text-[#4A4438] text-[13px] font-sans font-light">{s.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
