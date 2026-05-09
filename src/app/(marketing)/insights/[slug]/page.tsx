import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Shield } from 'lucide-react'
import { Navbar } from '@/components/marketing/Navbar'
import { Footer } from '@/components/marketing/Footer'
import { FloatingWhatsApp } from '@/components/shared/FloatingWhatsApp'
import { articles, getArticleBySlug } from '@/lib/articles'
import { createClient } from '@/lib/supabase/server'
import { getArticleBySlugFromDb, type Article as DbArticle } from '@/lib/admin/content'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const article = getArticleBySlug(slug)
  if (article) {
    return {
      title: `${article.title} | Wealthon Capital Ventures`,
      description: article.excerpt,
    }
  }
  const supabase = await createClient()
  const dbArticle = await getArticleBySlugFromDb(supabase, slug)
  if (!dbArticle) return {}
  const excerpt = dbArticle.body
    .replace(/^#{1,6}\s.+$/gm, '')
    .replace(/[*_`\[\]()!]/g, '')
    .replace(/\n+/g, ' ')
    .trim()
    .slice(0, 160)
  return {
    title: `${dbArticle.title} | Wealthon Capital Ventures`,
    description: excerpt,
  }
}

// Article body content keyed by slug
const CONTENT: Record<string, React.ReactNode> = {
  'profit-sharing-vs-fixed-returns': (
    <div className="prose-wealthon">
      <p>
        Most people who walk into a wealth conversation have been sold one of two things: a fixed
        deposit that promises 7%, or a mutual fund that promises "market-linked returns." Both are
        legitimate instruments. But neither is what we do at Wealthon.
      </p>
      <p>
        We operate on a profit-sharing model. And it's worth understanding precisely what that
        means before you commit to anything.
      </p>
      <h2>What fixed returns actually mean</h2>
      <p>
        When someone promises you a fixed return — say, 12% per annum — they are guaranteeing that
        number regardless of how their underlying assets perform. That guarantee has to come from
        somewhere. Either they're holding extremely safe instruments (bonds, FDs), or they're
        cross-subsidising from other clients, or the number simply isn't sustainable.
      </p>
      <p>
        Fixed return products work when the market cooperates. When it doesn't, either the promise
        is broken, or the firm absorbs losses privately. Neither outcome is transparent to you.
      </p>
      <h2>What profit-sharing actually means</h2>
      <p>
        In a profit-sharing arrangement, your return is directly tied to the performance of the
        firm you're partnering with. If we make money trading, you receive a pre-agreed percentage
        of the profit. If we don't perform well in a quarter, you don't receive a distribution
        that quarter.
      </p>
      <p>
        This sounds riskier on the surface. But consider what it means in practice: our incentives
        are completely aligned with yours. We only earn when you earn. There is no scenario where
        we profit while you lose — which is not true for most financial products.
      </p>
      <h2>The questions you should ask</h2>
      <p>Before entering any profit-sharing arrangement, ask four things:</p>
      <p>
        <strong>1. What is the documentation?</strong> Is there a signed agreement? A clear MoU
        with specified ratios, terms and exit clauses? If the answer is "we do it informally,"
        walk away.
      </p>
      <p>
        <strong>2. What is the risk disclosure?</strong> A legitimate firm will make you sign a
        risk disclosure statement that explicitly says: past performance does not guarantee future
        results, capital is at market risk. This protects you legally and signals seriousness.
      </p>
      <p>
        <strong>3. How is the capital structured?</strong> Is your money held in a dedicated
        account? Is there clear separation between firm capital and partner capital? Commingling
        is a serious red flag.
      </p>
      <p>
        <strong>4. How often do you receive reporting?</strong> Quarterly P&L statements,
        documented and consistent, are the minimum standard. If you can't see the numbers, you
        can't trust the distribution.
      </p>
      <h2>Why we chose this model</h2>
      <p>
        We built Wealthon on profit-sharing because it was the only model we could look a partner
        in the eye and describe honestly. We trade with discipline and data. Some quarters will be
        better than others. But you will always know exactly where you stand — because the
        agreement, the reporting and the relationship are all built on transparency.
      </p>
      <p>That's not a promise of returns. It's a commitment to honesty.</p>
    </div>
  ),

  'your-fd-is-not-beating-inflation': (
    <div className="prose-wealthon">
      <p>
        Most people open a Fixed Deposit and feel responsible.
      </p>
      <p>
        And honestly? It's not a bad instinct. Your money is safe. It's earning something. It's
        not sitting idle.
      </p>
      <p>But let's look at the actual numbers.</p>
      <h2>The math nobody talks about</h2>
      <p>
        Average FD rate today: <strong>6.5% – 7.5%</strong> per year.<br />
        India's average inflation: <strong>5% – 6%</strong> per year.
      </p>
      <p>
        Real return after inflation: <strong>1% – 2%.</strong>
      </p>
      <p>
        On ₹5,00,000 — that's roughly ₹5,000 to ₹10,000 of actual purchasing power gained in a
        year.
      </p>
      <p>
        Meanwhile, everything you buy — groceries, fuel, rent, education — got more expensive by
        5–6%.
      </p>
      <p>
        Your money grew on paper.<br />
        Your lifestyle got more expensive in reality.
      </p>
      <p>This is called the inflation trap. And most people don't realise they're in it.</p>
      <h2>Why FDs feel safe</h2>
      <p>
        There's a reason FDs are the default. They're simple, guaranteed and backed by the bank.
        After watching the news and seeing market crashes, "safe" feels like the right word. And
        for short-term goals or emergency funds, it often is.
      </p>
      <p>
        But there's a difference between capital preservation and capital growth. FDs do the
        former. For the long term, you need both.
      </p>
      <h2>The question worth asking</h2>
      <p>
        This is not a pitch. The answer isn't to blindly chase high returns either. Higher returns
        always come with higher risk — and anyone who tells you otherwise is not being honest with
        you.
      </p>
      <p>But the conversation worth having is this:</p>
      <p>
        Are you aware of what your money is actually doing?<br />
        Are you making an informed choice, or just a comfortable one?
      </p>
      <p>
        Because there's a difference between safe and smart. And the first step is simply
        understanding where you stand.
      </p>
      <h2>What informed looks like</h2>
      <p>
        Understanding your real return after inflation. Knowing what alternatives exist, what
        their risks are, and what their structures look like. Asking questions before committing
        to anything.
      </p>
      <p>
        At Wealthon, we believe the most important thing we can do before anyone becomes a capital
        partner is make sure they understand this landscape clearly.
      </p>
      <p>Not to sell them something. But because informed decisions are the only kind worth making.</p>
    </div>
  ),

  'algorithms-and-ai-in-trading': (
    <div className="prose-wealthon">
      <p>
        For most of financial history, trading was a human activity. Analysts read charts, fund
        managers made calls, traders shouted across floors. Intuition, experience and nerve were
        the edge.
      </p>
      <p>
        That era didn't end — but it's no longer the whole picture. Algorithms and AI have
        become the dominant force in global markets. And understanding what that means is
        essential for anyone with capital in the game.
      </p>
      <h2>The algorithmic revolution</h2>
      <p>
        Algorithmic trading — where computer programs execute orders based on predefined rules —
        began in the 1980s with simple arbitrage strategies. By the 2000s, it accounted for a
        significant portion of all equity trades. Today, estimates suggest that 60–75% of all
        trades in developed markets are executed algorithmically.
      </p>
      <p>
        The reason is straightforward: speed and consistency. An algorithm can scan hundreds of
        markets simultaneously, identify a signal, calculate position size, factor in risk
        parameters and execute a trade in microseconds. A human cannot. And crucially, the
        algorithm doesn't hesitate, panic or get greedy.
      </p>
      <p>
        Rule-based systems removed execution-level emotion from trading. That alone was a
        structural advantage. But then came AI.
      </p>
      <h2>How AI entered the markets</h2>
      <p>
        Machine learning models changed what was possible. Instead of hard-coded rules — "buy
        when the 50-day moving average crosses the 200-day" — ML models could learn patterns from
        data that no human had explicitly programmed.
      </p>
      <p>
        Natural language processing allowed systems to parse earnings calls, central bank
        statements and social media sentiment in real time, converting unstructured language into
        trading signals. Computer vision models began reading satellite imagery to estimate
        inventory levels at oil storage facilities before official reports were released.
      </p>
      <p>
        Deep learning networks found non-linear relationships in market data that statistical
        models had missed for decades. Reinforcement learning produced agents that could optimise
        execution strategies dynamically — learning, from millions of simulations, how to move
        large positions without revealing themselves to the market.
      </p>
      <h2>What this means for markets today</h2>
      <p>
        Markets have become faster, more efficient and more crowded at the edges. Classic
        inefficiencies that once offered easy returns — simple momentum, index arbitrage,
        post-earnings drift — have largely been arbitraged away. AI spotted them, scaled into
        them and closed the gap.
      </p>
      <p>
        This creates a compounding dynamic: the more AI is used, the harder it becomes to find
        edge without AI. Firms that haven't adapted to systematic, data-driven approaches are
        competing at a structural disadvantage.
      </p>
      <p>
        It also creates new risks. Flash crashes — sudden violent price moves with no fundamental
        cause — are often algorithmic feedback loops. When multiple systems share similar signals
        and react simultaneously, liquidity can vanish in seconds. The 2010 Flash Crash, the 2015
        Treasury market disruption, and several crypto liquidation cascades have all carried this
        fingerprint.
      </p>
      <h2>Where human judgement still matters</h2>
      <p>
        AI is not infallible. Models trained on historical data can fail spectacularly in regime
        changes — market conditions that look nothing like anything in the training set. The early
        days of COVID-19 broke many quantitative strategies precisely because nothing in decades
        of data resembled a global pandemic shutdown.
      </p>
      <p>
        This is why human oversight remains critical. Not to override signals, but to understand
        when the context has shifted fundamentally. The best systematic operations combine model
        discipline with human judgement at the boundary conditions.
      </p>
      <h2>How we think about this at Wealthon</h2>
      <p>
        Our approach is systematic and model-driven, but not blindly automated. We run
        algorithmic strategies across Forex, Commodities and Crypto — markets with the liquidity
        and structure that quantitative approaches work well in.
      </p>
      <p>
        Every strategy is back-tested, stress-tested, and forward-tested with limited capital
        before meaningful allocation. Risk parameters are built into the system. We don't chase
        AI as a buzzword — we use systematic, data-backed methods because they produce
        consistent, reviewable, repeatable outcomes.
      </p>
      <p>
        The world of trading has changed. Understanding how is the first step to navigating it
        intelligently.
      </p>
    </div>
  ),
}

function DbArticleBody({ body }: { body: string }) {
  const blocks = body.split(/\n\n+/).filter(Boolean)
  return (
    <div className="prose-wealthon">
      {blocks.map((block, i) => {
        const h2Match = block.match(/^##\s+(.+)/)
        const h1Match = block.match(/^#\s+(.+)/)
        if (h2Match ?? h1Match) {
          return <h2 key={i}>{(h2Match ?? h1Match)![1]}</h2>
        }
        const text = block.replace(/\*\*(.+?)\*\*/g, '$1').replace(/[*_]/g, '')
        return <p key={i}>{text}</p>
      })}
    </div>
  )
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params
  const staticArticle = getArticleBySlug(slug)

  let dbArticle: DbArticle | null = null
  if (!staticArticle) {
    const supabase = await createClient()
    dbArticle = await getArticleBySlugFromDb(supabase, slug)
    if (!dbArticle) notFound()
  }

  const article = staticArticle ?? {
    slug: dbArticle!.slug,
    title: dbArticle!.title,
    category: dbArticle!.category,
    author: dbArticle!.author,
    authorInitials: (() => {
      const parts = dbArticle!.author.trim().split(/\s+/)
      return parts.length >= 2
        ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        : (parts[0]?.slice(0, 2) ?? '??').toUpperCase()
    })(),
    date: new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      .format(new Date(dbArticle!.published_at ?? dbArticle!.created_at)),
    readTime: `${Math.max(1, Math.round(dbArticle!.body.split(/\s+/).filter(Boolean).length / 200))} min read`,
    excerpt: dbArticle!.body.replace(/^#{1,6}\s.+$/gm, '').replace(/[*_`\[\]()!]/g, '').replace(/\n+/g, ' ').trim().slice(0, 200),
  }

  const content = staticArticle ? CONTENT[slug] : <DbArticleBody body={dbArticle!.body} />

  return (
    <>
      <Navbar />
      <main className="bg-[#080808] min-h-screen">
        {/* Article header */}
        <section className="pt-32 pb-12 max-w-[760px] mx-auto px-5 lg:px-10">
          <Link
            href="/insights"
            className="inline-flex items-center gap-2 text-[#9A9080] text-[13px] font-sans hover:text-gold transition-colors mb-8"
          >
            <ArrowLeft size={14} />
            Back to Insights
          </Link>

          <p className="text-gold text-[11px] font-sans uppercase tracking-[0.15em] mb-4">
            {article.category}
          </p>
          <h1 className="font-serif text-[32px] lg:text-[40px] font-semibold text-[#F0EDE6] leading-[1.2] mb-6">
            {article.title}
          </h1>
          <p className="text-[#9A9080] text-base font-sans font-light leading-[1.7] mb-8">
            {article.excerpt}
          </p>

          {/* Author + meta */}
          <div className="flex items-center gap-4 pb-8" style={{ borderBottom: '1px solid rgba(245,166,35,0.12)' }}>
            {article.authorPhoto ? (
              <div className="w-10 h-10 rounded-full overflow-hidden border border-[rgba(245,166,35,0.4)] flex-shrink-0">
                <Image
                  src={article.authorPhoto}
                  alt={article.author}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-[rgba(245,166,35,0.1)] border border-[rgba(245,166,35,0.3)] flex items-center justify-center flex-shrink-0">
                <span className="font-serif text-[13px] text-gold">{article.authorInitials}</span>
              </div>
            )}
            <div>
              <p className="text-[#F0EDE6] text-[14px] font-sans">{article.author}</p>
              <p className="text-[#7F7566] text-[12px] font-sans">
                {article.date} · {article.readTime}
              </p>
            </div>
          </div>
        </section>

        {/* Cover image */}
        {article.coverImage && (
          <section className="max-w-[760px] mx-auto px-5 lg:px-10 pb-10">
            <div className="rounded-[8px] overflow-hidden" style={{ border: '1px solid rgba(245,166,35,0.12)' }}>
              <Image
                src={article.coverImage}
                alt={article.title}
                width={760}
                height={400}
                className="w-full h-auto object-cover"
                priority
              />
            </div>
          </section>
        )}

        {/* Article body */}
        <section className="max-w-[760px] mx-auto px-5 lg:px-10 pb-8">
          <style>{`
            .prose-wealthon p {
              color: #9A9080;
              font-family: var(--font-inter);
              font-weight: 300;
              font-size: 16px;
              line-height: 1.85;
              margin-bottom: 1.5rem;
            }
            .prose-wealthon h2 {
              font-family: var(--font-playfair);
              font-size: 24px;
              font-weight: 600;
              color: #F0EDE6;
              line-height: 1.3;
              margin-top: 2.5rem;
              margin-bottom: 1rem;
            }
            .prose-wealthon strong {
              color: #F0EDE6;
              font-weight: 500;
            }
          `}</style>
          {content}
        </section>

        {/* Disclaimer */}
        <section className="max-w-[760px] mx-auto px-5 lg:px-10 pb-10">
          <div
            className="rounded-[8px] p-5 flex items-start gap-3"
            style={{ border: '1px solid rgba(245,166,35,0.12)', background: 'rgba(245,166,35,0.02)' }}
          >
            <Shield size={15} className="text-[#7F7566] flex-shrink-0 mt-0.5" />
            <p className="text-[#7F7566] text-[11px] font-sans font-light leading-[1.7]">
              Wealthon Capital Ventures is a proprietary trading firm. Capital partnerships are
              profit-sharing arrangements and not fixed deposit schemes or guaranteed return
              products. All partnerships are governed by signed agreements. Past performance does
              not guarantee future results. For informational purposes only.
            </p>
          </div>
        </section>

        {/* End-of-article CTA */}
        <section className="max-w-[760px] mx-auto px-5 lg:px-10 pb-24">
          <div
            className="rounded-[12px] p-8 lg:p-10 relative overflow-hidden text-center"
            style={{
              background: 'linear-gradient(160deg, rgba(245,166,35,0.08) 0%, rgba(245,166,35,0.03) 60%, transparent 100%)',
              border: '1px solid rgba(245,166,35,0.3)',
              boxShadow: '0 0 60px rgba(245,166,35,0.06)',
            }}
          >
            {/* Glow */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(245,166,35,0.1) 0%, transparent 65%)' }}
            />
            <div className="relative z-10">
              <p className="text-gold text-[11px] font-sans uppercase tracking-[0.2em] mb-3">
                Capital Partnership
              </p>
              <h3 className="font-serif text-[26px] lg:text-[30px] font-semibold text-[#F0EDE6] leading-[1.2] mb-3">
                Interested in working with us?
              </h3>
              <p className="text-[#9A9080] text-[14px] font-sans font-light leading-[1.7] max-w-[420px] mx-auto mb-7">
                Every partnership starts with a conversation. No commitment, no pressure — just an
                honest discussion about whether this makes sense for you.
              </p>
              <Link
                href="/#contact"
                className="inline-block bg-gold text-[#080808] text-[15px] font-sans font-medium tracking-[0.04em] px-8 py-3 rounded-[4px] hover:opacity-90 transition-opacity"
              >
                Start a conversation →
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <FloatingWhatsApp />
    </>
  )
}
