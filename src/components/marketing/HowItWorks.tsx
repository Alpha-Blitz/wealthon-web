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
    <section id="how" className="bg-[#080808] py-[60px] lg:py-[120px]">
      <div className="max-w-[1200px] mx-auto px-5 lg:px-10">
        <p className="text-gold text-[11px] font-sans uppercase tracking-[0.2em] mb-3 fade-up" data-delay="0">
          Process
        </p>
        <h2 className="font-serif text-[28px] md:text-[36px] lg:text-[40px] font-semibold text-[#F0EDE6] leading-[1.2] mb-4 fade-up" data-delay="60">
          Simple, structured, transparent.
        </h2>
        <p className="text-[#9A9080] text-base font-sans font-light max-w-[520px] mb-16 fade-up" data-delay="120">
          We keep the process intentional, clear and documented — so you always know where you
          stand.
        </p>

        {/* Flow layout */}
        <div className="relative fade-up" data-delay="180">

          {/* Desktop: horizontal connector line behind the circles */}
          <div
            className="absolute top-5 left-0 right-0 h-px hidden lg:block"
            style={{
              background:
                'linear-gradient(90deg, transparent 3%, rgba(245,166,35,0.25) 15%, rgba(245,166,35,0.25) 85%, transparent 97%)',
            }}
          />

          {/* Mobile: vertical connector line on the left */}
          <div
            className="absolute left-5 top-5 bottom-10 w-px lg:hidden"
            style={{
              background:
                'linear-gradient(180deg, rgba(245,166,35,0.25) 0%, rgba(245,166,35,0.25) 85%, transparent 100%)',
            }}
          />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-0 lg:gap-8">
            {STEPS.map((step, i) => (
              <div
                key={step.num}
                className="relative flex lg:flex-col gap-5 lg:gap-0 pl-14 lg:pl-0 pb-10 lg:pb-0"
              >
                {/* Circle */}
                <div
                  className="absolute left-0 top-0 lg:static lg:mb-6 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10"
                  style={{
                    background: '#080808',
                    border: '1px solid rgba(245,166,35,0.55)',
                    boxShadow: '0 0 14px rgba(245,166,35,0.1)',
                  }}
                >
                  <span className="font-dm-serif text-[13px] text-gold">{step.num}</span>
                </div>

                {/* Desktop: faint large number behind content */}
                <p
                  className="font-dm-serif absolute top-6 left-0 select-none pointer-events-none hidden lg:block"
                  style={{ fontSize: '80px', color: 'rgba(245,166,35,0.04)', lineHeight: 1 }}
                >
                  {step.num}
                </p>

                {/* Content */}
                <div className="lg:mt-0 relative z-10">
                  <h3 className="font-serif text-[19px] text-[#F0EDE6] leading-[1.4] mb-2 lg:mb-3">
                    {step.title}
                  </h3>
                  <p className="text-[#9A9080] text-[13px] lg:text-[14px] font-sans font-light leading-[1.7]">
                    {step.body}
                  </p>
                </div>

                {/* Desktop: arrow between steps */}
                {i < STEPS.length - 1 && (
                  <div
                    className="hidden lg:flex absolute right-0 top-4 items-center -mr-4 z-20"
                    style={{ transform: 'translateX(50%)' }}
                  >
                    <div className="w-2 h-2 border-t border-r border-[rgba(245,166,35,0.4)] rotate-45" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
