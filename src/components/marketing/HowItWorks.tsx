const STEPS = [
  {
    num: '01',
    title: "You're introduced",
    body: "Every capital partner joins through a referral or direct relationship. No cold calls, no ads.",
  },
  {
    num: '02',
    title: 'We meet and discuss',
    body: "We walk through how the firm operates, our trading approach, profit-sharing terms, and what the agreement covers. No pressure.",
  },
  {
    num: '03',
    title: 'Agreements are signed',
    body: 'A Capital Partnership MoU is signed before any capital moves. Risk disclosure is explicit. No guaranteed returns. Ever. Documented.',
  },
  {
    num: '04',
    title: 'Profits are shared quarterly',
    body: 'Each quarter, trading P&L is documented and profit distributions are made per the agreed ratio. Transparent. Written. Consistent.',
  },
]

export function HowItWorks() {
  return (
    <section id="how" className="bg-[#080808] py-[120px] lg:py-[60px]">
      <div className="max-w-[1200px] mx-auto px-10 md:px-5">
        <p className="text-gold text-[11px] font-sans uppercase tracking-[0.2em] mb-3 fade-up" data-delay="0">
          Process
        </p>
        <h2 className="font-serif text-[40px] md:text-[32px] font-semibold text-[#F0EDE6] leading-[1.2] mb-4 fade-up" data-delay="60">
          Simple, structured, transparent.
        </h2>
        <p className="text-[#8A8070] text-base font-sans font-light max-w-[520px] mb-16 fade-up" data-delay="120">
          We keep the process intentional, clear and documented — so you always know where you
          stand.
        </p>

        <div className="grid grid-cols-4 lg:grid-cols-1 gap-8 lg:gap-12">
          {STEPS.map((step, i) => (
            <div
              key={step.num}
              className="relative fade-up"
              data-delay={i * 100}
            >
              {/* Faint large step number */}
              <p
                className="font-serif font-bold absolute -top-4 -left-2 select-none pointer-events-none"
                style={{ fontSize: '96px', color: 'rgba(245,166,35,0.04)', lineHeight: 1 }}
              >
                {step.num}
              </p>

              {/* Gold dot */}
              <div className="w-2 h-2 rounded-full bg-gold mb-6 relative z-10" />

              <h3 className="font-serif text-[20px] text-[#F0EDE6] leading-[1.4] mb-3 relative z-10">
                {step.title}
              </h3>
              <p className="text-[#8A8070] text-[14px] font-sans font-light leading-[1.7] relative z-10">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
