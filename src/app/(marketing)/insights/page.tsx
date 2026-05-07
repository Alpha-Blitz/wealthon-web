import { Navbar } from '@/components/marketing/Navbar'
import { Footer } from '@/components/marketing/Footer'
import { FloatingWhatsApp } from '@/components/shared/FloatingWhatsApp'
import { InsightsClient } from '@/components/marketing/InsightsClient'
import { articles } from '@/lib/articles'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Insights | Wealthon Capital Ventures',
  description:
    'Perspectives on trading, capital partnerships and wealth building from the Wealthon team.',
}

const featured = articles.find((a) => a.featured)
const rest = articles.filter((a) => !a.featured)

export default function InsightsPage() {
  return (
    <>
      <Navbar />
      <main className="bg-[#080808] min-h-screen">
        {/* Hero */}
        <section className="pt-32 pb-10 max-w-[1200px] mx-auto px-5 lg:px-10">
          <p className="text-gold text-[11px] font-sans uppercase tracking-[0.2em] mb-3">
            Insights
          </p>
          <h1 className="font-serif text-[40px] lg:text-[56px] font-bold text-[#F0EDE6] leading-[1.1] mb-4">
            Insights<span className="text-gold">.</span>
          </h1>
          <p className="text-[#9A9080] text-base font-sans font-light max-w-[480px]">
            Perspectives on trading, capital partnerships and wealth building from the
            Wealthon team.
          </p>
        </section>

        {/* Interactive filter + article grid */}
        <section className="max-w-[1200px] mx-auto px-5 lg:px-10 pb-24">
          <InsightsClient featured={featured} rest={rest} />
        </section>
      </main>
      <Footer />
      <FloatingWhatsApp />
    </>
  )
}
