const AUDIENCE = [
  {
    title: 'The working professional',
    body: "You have savings sitting in an FD earning 7%. You want better, but you don't have the time or knowledge to trade yourself. We do it for you.",
  },
  {
    title: 'The cautious first-timer',
    body: "You've heard about trading but don't know where to start or who to trust. We walk you through everything, slowly and clearly, with no pressure.",
  },
  {
    title: 'The intentional wealth-builder',
    body: 'You understand risk. You want a diversified allocation beyond gold and real estate. You want a partner, not a product.',
  },
]

const TIERS = [
  { tier: 'L1', range: '₹1L – ₹10L', entry: 'Close network / referred' },
  { tier: 'L2', range: '₹10L – ₹50L', entry: 'HNIs / referred partners' },
  { tier: 'L3', range: '₹50L+', entry: 'Formal due diligence' },
]

export function WhoWeWorkWith() {
  return (
    <section id="who" className="bg-[#0F0F0F] py-[120px] lg:py-[60px]">
      <div className="max-w-[1200px] mx-auto px-10 md:px-5">
        <p className="text-gold text-[11px] font-sans uppercase tracking-[0.2em] mb-3 fade-up" data-delay="0">
          Our Partners
        </p>
        <h2 className="font-serif text-[40px] md:text-[32px] font-semibold text-[#F0EDE6] leading-[1.2] mb-4 fade-up" data-delay="60">
          Who we work with.
        </h2>
        <p className="text-[#8A8070] text-base font-sans font-light mb-12 fade-up" data-delay="120">
          We work with people, not portfolios.
        </p>

        {/* Audience cards */}
        <div className="grid grid-cols-3 lg:grid-cols-1 gap-4 mb-16">
          {AUDIENCE.map((a, i) => (
            <div
              key={a.title}
              className="bg-[#111111] rounded-[8px] p-6 fade-up"
              data-delay={i * 80}
              style={{
                border: '1px solid rgba(245,166,35,0.15)',
                borderTopColor: '#F5A623',
                borderTopWidth: '1px',
              }}
            >
              <h3 className="font-serif text-[20px] text-[#F0EDE6] mb-3">{a.title}</h3>
              <p className="text-[#8A8070] text-[14px] font-sans font-light leading-[1.7]">{a.body}</p>
            </div>
          ))}
        </div>

        {/* Tiers table */}
        <div className="fade-up" data-delay="200">
          <div className="mb-6">
            <h3 className="font-serif text-[28px] text-[#F0EDE6] mb-1">
              Capital partnership tiers
            </h3>
            <p className="text-[#8A8070] text-[14px] font-sans font-light">
              Entry is always through conversation first.
            </p>
          </div>

          <div
            className="rounded-[8px] overflow-hidden"
            style={{ border: '1px solid rgba(245,166,35,0.15)' }}
          >
            {/* Header row */}
            <div
              className="grid grid-cols-3 px-6 py-3"
              style={{ background: '#0F0F0F', borderBottom: '1px solid rgba(245,166,35,0.15)' }}
            >
              {['Tier', 'Capital Range', 'Entry Method'].map((h) => (
                <p
                  key={h}
                  className="text-gold text-[11px] font-sans uppercase tracking-[0.08em] font-normal"
                >
                  {h}
                </p>
              ))}
            </div>

            {/* Body rows */}
            {TIERS.map((row, i) => (
              <div
                key={row.tier}
                className="grid grid-cols-3 px-6 py-4 hover:bg-[rgba(245,166,35,0.04)] transition-colors"
                style={{
                  background: i % 2 === 0 ? '#111111' : '#0D0D0D',
                  borderBottom: i < TIERS.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                }}
              >
                <p className="text-[#F0EDE6] text-[14px] font-sans font-semibold">{row.tier}</p>
                <p className="text-[#F0EDE6] text-[14px] font-sans">{row.range}</p>
                <p className="text-[#8A8070] text-[14px] font-sans font-light">{row.entry}</p>
              </div>
            ))}
          </div>

          <p className="text-[#4A4438] text-[12px] font-sans font-light mt-3">
            All tiers require a signed agreement. No tier guarantees fixed returns.
          </p>
        </div>
      </div>
    </section>
  )
}
