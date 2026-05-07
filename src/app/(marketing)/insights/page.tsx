import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { Navbar } from '@/components/marketing/Navbar'
import { Footer } from '@/components/marketing/Footer'
import { FloatingWhatsApp } from '@/components/shared/FloatingWhatsApp'
import { articles } from '@/lib/articles'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Insights | Wealthon Capital Ventures',
  description:
    'Perspectives on trading, capital partnerships and wealth building from the Wealthon team.',
}

const CATEGORIES = ['All', 'Wealth Education', 'Trading Notes']

const featured = articles.find((a) => a.featured)
const rest = articles.filter((a) => !a.featured)

export default function InsightsPage() {
  return (
    <>
      <Navbar />
      <main className="bg-[#080808] min-h-screen">
        {/* Hero */}
        <section className="pt-32 pb-16 max-w-[1200px] mx-auto px-5 lg:px-10">
          <p className="text-gold text-[11px] font-sans uppercase tracking-[0.2em] mb-3">
            Insights
          </p>
          <h1 className="font-serif text-[40px] lg:text-[56px] font-bold text-[#F0EDE6] leading-[1.1] mb-4">
            Insights<span className="text-gold">.</span>
          </h1>
          <p className="text-[#9A9080] text-base font-sans font-light max-w-[480px] mb-10">
            Perspectives on trading, capital partnerships and wealth building from the
            Wealthon team.
          </p>

          {/* Category pills */}
          <div className="flex flex-wrap gap-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className="text-[12px] font-sans uppercase tracking-[0.1em] px-4 py-1.5 rounded-full border transition-colors cursor-pointer bg-transparent"
                style={
                  cat === 'All'
                    ? { border: '1px solid #F5A623', color: '#F5A623' }
                    : { border: '1px solid rgba(245,166,35,0.2)', color: '#9A9080' }
                }
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* Featured article */}
        {featured && (
          <section className="max-w-[1200px] mx-auto px-5 lg:px-10 mb-12">
            <Link href={`/insights/${featured.slug}`}>
              <div
                className="rounded-[8px] p-8 lg:p-10 hover:border-[rgba(245,166,35,0.4)] transition-all duration-200 group"
                style={{ background: '#111111', border: '1px solid rgba(245,166,35,0.15)' }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className="text-[10px] font-sans uppercase tracking-[0.1em] px-3 py-1 rounded-full"
                    style={{
                      background: 'rgba(245,166,35,0.1)',
                      color: '#F5A623',
                      border: '1px solid rgba(245,166,35,0.3)',
                    }}
                  >
                    Featured
                  </span>
                  <span className="text-[#6B6152] text-[11px] font-sans uppercase tracking-[0.08em]">
                    {featured.category}
                  </span>
                </div>

                <h2 className="font-serif text-[24px] lg:text-[32px] text-[#F0EDE6] leading-[1.3] mb-4 max-w-[700px] group-hover:text-gold transition-colors">
                  {featured.title}
                </h2>
                <p className="text-[#9A9080] text-[15px] font-sans font-light leading-[1.7] max-w-[600px] mb-6">
                  {featured.excerpt}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {featured.authorPhoto ? (
                      <div className="w-8 h-8 rounded-full overflow-hidden border border-[rgba(245,166,35,0.4)] flex-shrink-0">
                        <Image src={featured.authorPhoto} alt={featured.author} width={32} height={32} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[rgba(245,166,35,0.1)] border border-[rgba(245,166,35,0.3)] flex items-center justify-center flex-shrink-0">
                        <span className="font-serif text-[12px] text-gold">{featured.authorInitials}</span>
                      </div>
                    )}
                    <div>
                      <p className="text-[#F0EDE6] text-[13px] font-sans">{featured.author}</p>
                      <p className="text-[#6B6152] text-[11px] font-sans">
                        {featured.date} · {featured.readTime}
                      </p>
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-gold opacity-60 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </Link>
          </section>
        )}

        {/* Article grid */}
        <section className="max-w-[1200px] mx-auto px-5 lg:px-10 pb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rest.map((article) => (
              <Link key={article.slug} href={`/insights/${article.slug}`}>
                <div
                  className="rounded-[8px] p-6 h-full flex flex-col hover:border-[rgba(245,166,35,0.4)] hover:-translate-y-0.5 transition-all duration-200 group"
                  style={{
                    background: '#111111',
                    border: '1px solid rgba(245,166,35,0.15)',
                    borderTopColor: '#F5A623',
                    borderTopWidth: '2px',
                  }}
                >
                  <p className="text-[#6B6152] text-[10px] font-sans uppercase tracking-[0.1em] mb-3">
                    {article.category}
                  </p>
                  <h3 className="font-serif text-[20px] text-[#F0EDE6] leading-[1.3] mb-3 group-hover:text-gold transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-[#9A9080] text-[13px] font-sans font-light leading-[1.7] mb-6 flex-1">
                    {article.excerpt}
                  </p>

                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-3">
                      {article.authorPhoto ? (
                        <div className="w-7 h-7 rounded-full overflow-hidden border border-[rgba(245,166,35,0.4)] flex-shrink-0">
                          <Image src={article.authorPhoto} alt={article.author} width={28} height={28} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-[rgba(245,166,35,0.1)] border border-[rgba(245,166,35,0.3)] flex items-center justify-center flex-shrink-0">
                          <span className="font-serif text-[11px] text-gold">{article.authorInitials}</span>
                        </div>
                      )}
                      <div>
                        <p className="text-[#F0EDE6] text-[12px] font-sans">{article.author}</p>
                        <p className="text-[#6B6152] text-[10px] font-sans">
                          {article.date} · {article.readTime}
                        </p>
                      </div>
                    </div>
                    <ArrowRight size={14} className="text-gold opacity-50 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
      <FloatingWhatsApp />
    </>
  )
}
