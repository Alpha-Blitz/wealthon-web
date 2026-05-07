import { Cpu, Calculator, Shield, Globe, RefreshCw, Server } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface EdgeCard {
  icon: LucideIcon
  title: string
  body: string
}

const CARDS: EdgeCard[] = [
  {
    icon: Cpu,
    title: 'Algorithmic Execution',
    body: 'Rule-based systems built on statistical models. Speed, precision and consistency — without manual bias interfering at the moment of execution.',
  },
  {
    icon: Calculator,
    title: 'Quantitative Finance',
    body: 'Mathematical frameworks to model market behaviour, price risk and identify statistical edges. Every strategy is back-tested before live capital.',
  },
  {
    icon: Shield,
    title: 'Systematic Risk Management',
    body: 'Position sizing, drawdown limits and volatility controls are built into the system. Risk parameters are defined before a trade opens, not after.',
  },
  {
    icon: Globe,
    title: 'Cross-Market Strategies',
    body: 'Our models run across Forex, Commodities and Crypto simultaneously. Diversification is built at the strategy level, not just the asset level.',
  },
  {
    icon: RefreshCw,
    title: 'Strategy Iteration',
    body: 'Market conditions shift. Our models are regularly reviewed, stress-tested and updated to reflect current volatility regimes and structural market changes.',
  },
  {
    icon: Server,
    title: 'Regulated Platforms',
    body: 'All algorithmic activity runs through internationally regulated, low-latency platforms built for professional trading operations.',
  },
]

export function TheEdge() {
  return (
    <section className="bg-[#080808] py-[120px] lg:py-[60px] relative overflow-hidden">
      {/* Radial gold glow top-right */}
      <div
        className="absolute top-0 right-0 w-[600px] h-[600px] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at top right, rgba(245,166,35,0.06) 0%, transparent 65%)',
        }}
      />

      <div className="max-w-[1200px] mx-auto px-10 md:px-5 relative z-10">
        <p className="text-gold text-[11px] font-sans uppercase tracking-[0.2em] mb-3 fade-up" data-delay="0">
          The Edge
        </p>
        <h2 className="font-serif text-[40px] md:text-[32px] font-semibold text-[#F0EDE6] leading-[1.2] mb-4 fade-up" data-delay="60">
          Built on algorithms. Backed by data.
        </h2>
        <p className="text-[#8A8070] text-base font-sans font-light max-w-[600px] mb-12 fade-up" data-delay="120">
          Our trading approach is systematic and research-driven. We apply quantitative models
          and algorithmic strategies across every market we operate in, removing emotion from
          execution.
        </p>

        <div className="grid grid-cols-3 md:grid-cols-1 lg:grid-cols-2 gap-4">
          {CARDS.map((card, i) => (
            <div
              key={card.title}
              className="bg-[#111111] rounded-[8px] p-6 hover:-translate-y-0.5 hover:border-[rgba(245,166,35,0.4)] transition-all duration-200 fade-up"
              data-delay={i * 70}
              style={{ border: '1px solid rgba(245,166,35,0.15)' }}
            >
              <card.icon size={20} className="text-gold mb-4" />
              <h3 className="font-serif text-[18px] text-[#F0EDE6] mb-2">{card.title}</h3>
              <p className="text-[#8A8070] text-[13px] font-sans font-light leading-[1.7]">{card.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
