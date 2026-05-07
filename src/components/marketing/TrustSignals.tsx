import { CheckCircle2 } from 'lucide-react'

const CARDS = [
  {
    title: 'Formal Agreement First',
    body: "We sit down, discuss every term, and sign a Capital Partnership MoU before anything begins. You know exactly what you're entering.",
  },
  {
    title: 'Explicit Risk Disclosure',
    body: 'A separate Risk Disclosure Statement is signed by every partner. No fixed returns are ever promised. This is documented, not just said.',
  },
  {
    title: 'Clean Capital Structure',
    body: 'All partner capital is held in a dedicated firm current account, never mixed with personal funds. Clean paper trail. Full separation.',
  },
  {
    title: 'Quarterly P&L Reporting',
    body: "Every quarter, we share documented trading performance. You see the numbers, not just the distribution. Transparency is non-negotiable.",
  },
]

export function TrustSignals() {
  return (
    <section id="trust" className="bg-[#0F0F0F] py-[60px] lg:py-[120px]">
      <div className="max-w-[1200px] mx-auto px-5 lg:px-10">
        <p className="text-gold text-[11px] font-sans uppercase tracking-[0.2em] mb-3 fade-up" data-delay="0">
          Why Trust Us
        </p>
        <h2 className="font-serif text-[28px] md:text-[36px] lg:text-[40px] font-semibold text-[#F0EDE6] leading-[1.2] mb-4 fade-up" data-delay="60">
          Built on paper, not promises.
        </h2>
        <p className="text-[#9A9080] text-base font-sans font-light max-w-[520px] mb-12 fade-up" data-delay="120">
          Every capital partner is protected by formal agreements before a single rupee moves.
        </p>

        {/* 2×2 grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {CARDS.map((card, i) => (
            <div
              key={card.title}
              className="bg-[#111111] rounded-[8px] p-6 fade-up"
              data-delay={i * 70}
              style={{
                border: '1px solid rgba(245,166,35,0.12)',
                borderLeftColor: '#F5A623',
                borderLeftWidth: '2px',
              }}
            >
              <CheckCircle2 size={20} className="text-gold mb-4" />
              <h3 className="font-serif text-[18px] text-[#F0EDE6] mb-3">{card.title}</h3>
              <p className="text-[#9A9080] text-[13px] font-sans font-light leading-[1.7]">{card.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
