import Image from 'next/image'

const FOUNDERS = [
  {
    initials: 'SK',
    photo: null,
    name: 'Suhan S.K.',
    title: 'Co-Founder & Analyst',
    sub: 'Trading · Research · Portfolio Analysis',
    quote:
      'Every trade is backed by research, discipline and a clear risk framework. Performance is earned, not promised.',
  },
  {
    initials: 'PR',
    photo: '/pratik.jpeg',
    name: 'Prathik R.N.',
    title: 'Co-Founder & Strategist',
    sub: 'Business · Operations · Client Relations',
    quote:
      'Wealthon was built on one belief: that everyday people deserve access to professionally managed capital growth.',
  },
  {
    initials: 'SH',
    photo: null,
    name: 'Sumanth Hegde',
    title: 'Technical Head',
    sub: 'Technology · Systems · Digital Infrastructure',
    quote:
      'Technology should make trust transparent. Every system we build puts clarity and security first.',
  },
]

export function Leadership() {
  return (
    <section className="bg-[#080808] py-[60px] lg:py-[120px]">
      <div className="max-w-[1200px] mx-auto px-5 lg:px-10">
        <p className="text-gold text-[11px] font-sans uppercase tracking-[0.2em] mb-3 fade-up" data-delay="0">
          Leadership
        </p>
        <h2 className="font-serif text-[28px] md:text-[36px] lg:text-[40px] font-semibold text-[#F0EDE6] leading-[1.2] mb-12 fade-up" data-delay="60">
          The people behind Wealthon.
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FOUNDERS.map((f, i) => (
            <div
              key={f.name}
              className="bg-[#111111] rounded-[8px] p-7 fade-up"
              data-delay={i * 100}
              style={{
                border: '1px solid rgba(245,166,35,0.15)',
                borderTopColor: '#F5A623',
                borderTopWidth: '2px',
              }}
            >
              {/* Avatar */}
              <div className="mb-5">
                {f.photo ? (
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[rgba(245,166,35,0.4)]">
                    <Image
                      src={f.photo}
                      alt={f.name}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-full border-2 border-[rgba(245,166,35,0.4)] flex items-center justify-center bg-[rgba(245,166,35,0.05)]">
                    <span className="font-serif font-semibold text-[20px] text-gold">
                      {f.initials}
                    </span>
                  </div>
                )}
              </div>

              {/* Name + role */}
              <h3 className="font-serif text-[22px] text-[#F0EDE6] mb-1">{f.name}</h3>
              <p className="text-gold text-[13px] font-sans font-light mb-1">{f.title}</p>
              <p className="text-[#9A9080] text-[12px] font-sans font-light mb-5">{f.sub}</p>

              {/* Quote */}
              <blockquote
                className="pl-4 text-[#9A9080] text-[13px] font-sans font-light leading-[1.7] italic"
                style={{ borderLeft: '2px solid #F5A623' }}
              >
                "{f.quote}"
              </blockquote>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
