import { Navbar } from '@/components/marketing/Navbar'
import { Footer } from '@/components/marketing/Footer'
import { FloatingWhatsApp } from '@/components/shared/FloatingWhatsApp'
import { InsightsClient } from '@/components/marketing/InsightsClient'
import { articles, type Article } from '@/lib/articles'
import { createClient } from '@/lib/supabase/server'
import { getPublishedArticles, type Article as DbArticle } from '@/lib/admin/content'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Insights | Wealthon Capital Ventures',
  description:
    'Perspectives on trading, capital partnerships and wealth building from the Wealthon team.',
}

function dbToUiArticle(a: DbArticle): Article {
  const parts = a.author.trim().split(/\s+/)
  const authorInitials =
    parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : (parts[0]?.slice(0, 2) ?? '??').toUpperCase()

  const stripped = a.body
    .replace(/^#{1,6}\s.+$/gm, '')
    .replace(/[*_`\[\]()!]/g, '')
    .replace(/\n+/g, ' ')
    .trim()
  const excerpt = stripped.length > 200 ? stripped.slice(0, 200).trimEnd() + '…' : stripped

  const words = a.body.split(/\s+/).filter(Boolean).length
  const readTime = `${Math.max(1, Math.round(words / 200))} min read`

  const dateStr = a.published_at ?? a.created_at
  const date = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  }).format(new Date(dateStr))

  return {
    slug: a.slug,
    title: a.title,
    category: a.category,
    author: a.author,
    authorInitials,
    date,
    readTime,
    excerpt,
    featured: false,
  }
}

export default async function InsightsPage() {
  const supabase = await createClient()
  const dbArticles = await getPublishedArticles(supabase)

  const staticSlugs = new Set(articles.map((a) => a.slug))
  const dbUi = dbArticles
    .filter((a) => !staticSlugs.has(a.slug))
    .map(dbToUiArticle)

  const allArticles = [...articles, ...dbUi].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const featured = allArticles.find((a) => a.featured) ?? allArticles[0]
  const rest = allArticles.filter((a) => a !== featured)

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
