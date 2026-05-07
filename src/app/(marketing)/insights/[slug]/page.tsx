import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Shield } from 'lucide-react'
import { Navbar } from '@/components/marketing/Navbar'
import { Footer } from '@/components/marketing/Footer'
import { FloatingWhatsApp } from '@/components/shared/FloatingWhatsApp'
import { articles, getArticleBySlug } from '@/lib/articles'
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
  if (!article) return {}
  return {
    title: `${article.title} | Wealthon Capital Ventures`,
    description: article.excerpt,
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

  'how-we-trade': (
    <div className="prose-wealthon">
      <p>
        Trading is often misrepresented as a high-stakes gamble — a place where intuition and
        gut calls determine outcomes. That's one approach. It's not ours.
      </p>
      <p>
        At Wealthon, every decision is preceded by a model, and every model is preceded by data.
        Here's an honest look at how we operate.
      </p>
      <h2>Market selection</h2>
      <p>
        We trade across three asset classes: Forex, Commodities and Crypto. This isn't arbitrary.
        Each market has a distinct volatility profile, liquidity structure and correlation
        behaviour. By operating across all three, we can rotate allocation towards the market
        offering the best risk-adjusted opportunity in a given period.
      </p>
      <p>
        Forex gives us deep liquidity and tightly regulated markets. Commodities give us exposure
        to macro themes like energy, metals and agricultural cycles. Crypto gives us access to
        asymmetric moves during specific market regimes. Each has its place, and none is treated
        as a permanent primary focus.
      </p>
      <h2>How strategies are built</h2>
      <p>
        Our strategies start with a hypothesis: a belief about a market relationship or structural
        pattern that should persist over time. That hypothesis is tested against historical data
        across multiple market conditions — not just the period where it looks good, but periods
        of stress, low volatility and structural change.
      </p>
      <p>
        A strategy that only works in a bull market or only in high-volatility conditions is not
        a strategy. It's a coincidence. We filter for robustness, not recency.
      </p>
      <p>
        Once a strategy passes backtesting, it undergoes forward testing with minimal capital
        before any meaningful allocation is made. This process takes time. We don't rush it.
      </p>
      <h2>Execution</h2>
      <p>
        Once live, execution is automated where possible. Algorithmic systems remove
        execution-level emotion — hesitation, greed, fear — from the equation. Entry points, stop
        losses and take profits are predefined. A trade either meets the criteria or it doesn't
        open.
      </p>
      <p>
        Manual oversight is maintained for regime changes: macro events, sudden volatility spikes,
        or liquidity crises that the model wasn't designed for. In those cases, we reduce exposure
        and wait for conditions to normalise before re-engaging.
      </p>
      <h2>Risk management</h2>
      <p>
        Every open position has a defined maximum loss. Drawdown limits are set at the strategy
        level and at the portfolio level. If a strategy hits its drawdown threshold, it is paused
        and reviewed — even if the underlying thesis is still valid.
      </p>
      <p>
        Position sizing is calculated as a function of volatility, not intuition. In
        high-volatility environments, position sizes shrink. This is not timidity; it's
        arithmetic. The goal is capital preservation in adverse conditions and consistent
        compounding over time.
      </p>
      <h2>What we don't do</h2>
      <p>
        We don't chase high-leverage moonshots. We don't trade news events without structural
        edge. We don't hold positions through major risk events without explicit
        volatility-adjusted sizing. And we never allocate capital to a strategy that hasn't been
        tested and reviewed by the full team.
      </p>
      <p>
        The outcome isn't always exciting. But it's repeatable. And repeatability is what
        profit-sharing is built on.
      </p>
    </div>
  ),

  'first-capital-partnership': (
    <div className="prose-wealthon">
      <p>
        Entering a capital partnership for the first time can feel opaque. You're trusting a firm
        with money you've spent years building. The terminology is new. The structure is different
        from a mutual fund or FD. And you're probably wondering: what actually happens between
        the first conversation and the first distribution?
      </p>
      <p>This is a plain-language guide to exactly that.</p>
      <h2>Step 1 — The introduction</h2>
      <p>
        Every Wealthon capital partner arrives through a referral or a direct relationship. We
        don't advertise, and we don't cold-reach. This isn't elitism; it's how we maintain a
        small, high-trust network where we can give every partner the attention they deserve.
      </p>
      <p>
        If someone introduced you, that person knows both us and you. That mutual trust is the
        starting point for everything that follows.
      </p>
      <h2>Step 2 — The first conversation</h2>
      <p>
        Our first meeting is entirely informational. We walk you through how the firm operates:
        what markets we trade, how strategies are built, how capital is structured and what the
        profit-sharing terms look like. We don't ask for any commitment in this meeting.
      </p>
      <p>
        You're also encouraged to ask hard questions. How have recent quarters performed? What
        happens in a losing quarter? What are your exit rights? We will answer all of these
        directly.
      </p>
      <h2>Step 3 — The documentation</h2>
      <p>If you decide to proceed, documentation comes before capital. Every partner signs two documents:</p>
      <p>
        <strong>Capital Partnership MoU</strong> — This outlines the agreed profit-sharing ratio,
        the capital amount, the term of the partnership, reporting schedule, distribution dates
        and exit clauses. Every term is discussed before signing, not after.
      </p>
      <p>
        <strong>Risk Disclosure Statement</strong> — This explicitly states that capital is at
        market risk, that past performance does not guarantee future results, and that no fixed
        returns are promised under any circumstances. This document protects you legally and sets
        accurate expectations.
      </p>
      <h2>Step 4 — Capital transfer</h2>
      <p>
        Once documentation is complete, capital is transferred to the firm's dedicated current
        account. This account is held separately from personal funds — there is no commingling.
        You receive confirmation of receipt.
      </p>
      <h2>Step 5 — Quarterly reporting and distributions</h2>
      <p>
        At the end of each quarter, we prepare a documented P&L report for your allocation. This
        shows opening balance, trading performance, closing balance and the distribution amount
        based on the agreed ratio.
      </p>
      <p>
        Distributions are made as per the schedule in your MoU. You receive the report before or
        alongside the transfer — not a message saying "trust us, we did well."
      </p>
      <h2>What you should always have in writing</h2>
      <p>
        By the time you're a partner, you should have: a signed MoU, a signed risk disclosure, a
        receipt of capital transfer and quarterly P&L reports. If any of these are absent, ask for
        them. A firm that operates with integrity will have all of these ready without being asked.
      </p>
      <p>
        The goal of this process is simple: to make sure that the moment you transfer capital, you
        understand exactly what you've entered, what protections you have, and what to expect next.
      </p>
      <p>That clarity is what we consider the real product.</p>
    </div>
  ),
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params
  const article = getArticleBySlug(slug)
  if (!article) notFound()

  const content = CONTENT[slug]

  return (
    <>
      <Navbar />
      <main className="bg-[#080808] min-h-screen">
        {/* Article header */}
        <section className="pt-32 pb-12 max-w-[760px] mx-auto px-10 md:px-5">
          <Link
            href="/insights"
            className="inline-flex items-center gap-2 text-[#8A8070] text-[13px] font-sans hover:text-gold transition-colors mb-8"
          >
            <ArrowLeft size={14} />
            Back to Insights
          </Link>

          <p className="text-gold text-[11px] font-sans uppercase tracking-[0.15em] mb-4">
            {article.category}
          </p>
          <h1 className="font-serif text-[40px] md:text-[32px] font-semibold text-[#F0EDE6] leading-[1.2] mb-6">
            {article.title}
          </h1>
          <p className="text-[#8A8070] text-base font-sans font-light leading-[1.7] mb-8">
            {article.excerpt}
          </p>

          {/* Author + meta */}
          <div className="flex items-center gap-4 pb-8" style={{ borderBottom: '1px solid rgba(245,166,35,0.12)' }}>
            <div className="w-9 h-9 rounded-full bg-[rgba(245,166,35,0.1)] border border-[rgba(245,166,35,0.3)] flex items-center justify-center">
              <span className="font-serif text-[13px] text-gold">{article.authorInitials}</span>
            </div>
            <div>
              <p className="text-[#F0EDE6] text-[14px] font-sans">{article.author}</p>
              <p className="text-[#4A4438] text-[12px] font-sans">
                {article.date} · {article.readTime}
              </p>
            </div>
          </div>
        </section>

        {/* Article body */}
        <section className="max-w-[760px] mx-auto px-10 md:px-5 pb-8">
          <style>{`
            .prose-wealthon p {
              color: #8A8070;
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
        <section className="max-w-[760px] mx-auto px-10 md:px-5 pb-24">
          <div
            className="rounded-[8px] p-5 flex items-start gap-3"
            style={{ border: '1px solid rgba(245,166,35,0.12)', background: 'rgba(245,166,35,0.02)' }}
          >
            <Shield size={15} className="text-[#4A4438] flex-shrink-0 mt-0.5" />
            <p className="text-[#4A4438] text-[11px] font-sans font-light leading-[1.7]">
              Wealthon Capital Ventures is a proprietary trading firm. Capital partnerships are
              profit-sharing arrangements and not fixed deposit schemes or guaranteed return
              products. All partnerships are governed by signed agreements. Past performance does
              not guarantee future results. For informational purposes only.
            </p>
          </div>
        </section>
      </main>
      <Footer />
      <FloatingWhatsApp />
    </>
  )
}
