# PHASE_1_PROMPT.md — Marketing Site Build

Copy everything between the === markers into Claude Code.

===

Build Phase 1 of the Wealthon Capital Ventures website.
Read CLAUDE.md, DESIGN_SYSTEM.md and SCHEMA.md before writing any code.

## WHAT TO BUILD IN THIS PHASE

A Next.js 14 (App Router) + TypeScript + Tailwind CSS marketing website.
NO Supabase auth in this phase. Static pages only.
Deploy-ready to Vercel.

---

## SETUP

```bash
npx create-next-app@latest wealthon-web \
  --typescript --tailwind --eslint --app \
  --src-dir --import-alias "@/*"

cd wealthon-web
npm install lucide-react clsx tailwind-merge
npx shadcn@latest init
npx shadcn@latest add button input label select slider
```

Google Fonts in layout.tsx:
```typescript
import { Playfair_Display, Inter } from 'next/font/google'
const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-serif'
})
const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-sans'
})
```

---

## PAGES TO BUILD

### 1. Homepage — `src/app/page.tsx`

Build all sections in order:

**NAVBAR**
- Fixed top, full width, z-50
- Transparent background when hero is in view
- `rgba(8,8,8,0.95)` + `backdrop-filter: blur(20px)` + gold bottom border after scroll (use IntersectionObserver or scroll event)
- Left: `<img src="/navlogo.png" height="36px" alt="Wealthon Capital Ventures" />`
- Center (desktop): nav links — What We Do · How It Works · Who We Work With · Insights · Contact
  - Each scrolls to section anchor smoothly
  - Active section link gets gold color + bottom border
- Right: "Apply to Partner →" button (gold outline style)
- Mobile: hamburger icon → full-width dropdown menu, dark bg

**HERO SECTION**
- Full viewport height (`min-h-screen`)
- Background: `<Image src="/banner.png" fill objectFit="cover" priority />`
- Overlay: `linear-gradient(to right, rgba(8,8,8,0.93) 0%, rgba(8,8,8,0.75) 50%, rgba(8,8,8,0.35) 100%)`
- Compass overlay: `<Image src="/compass.png" />` positioned absolute bottom-right, width 42vw, opacity 0.3, mix-blend-mode luminosity, partially off-screen
- Content left-aligned, max-width 600px, vertically centered

  Eyebrow: `PROPRIETARY TRADING · FOREX · COMMODITIES · CRYPTO`
  Inter 400, 11px, gold, letter-spacing 0.2em, uppercase

  Headline:
  ```
  Where capital
  finds direction<span class="text-gold">.</span>
  ```
  Playfair Display 700, 72px desktop / 48px mobile, white, line-height 1.0

  Gold divider line: 64px wide, 1px, gold color, margin 24px 0

  Subline: `We don't sell returns. We share them.`
  Then: `A founder-led trading desk that selectively partners with individuals who want their capital working, not sitting idle.`
  Inter 300, 17px, #8A8070, max-width 480px

  CTAs (row, gap 16px):
  - "Talk to us →" → scrolls to #contact, gold outline button
  - "See how it works ↓" → scrolls to #how, ghost text style

  Stat blocks (row of 4, desktop horizontal / 2×2 mobile):
  Separated by vertical gold lines (1px, rgba(245,166,35,0.25))
  Each block: no background, padding 0 28px
  - Value: Playfair 600, 22px, gold
  - Sub-label: Inter 400, 10px, uppercase, letter-spacing 0.1em, #8A8070

  Stats:
  - "25–35%" / "HISTORICAL ANNUAL PERFORMANCE"
  - "Quarterly" / "PROFIT DISTRIBUTIONS"
  - "3 Markets" / "FOREX · COMMODITIES · CRYPTO"
  - "Invite Only" / "REFERRAL-GATED ENTRY"

  Fine print: `Performance figures are historical and market-linked. No fixed or guaranteed returns.`
  Inter 300, 11px, #4A4438, shield icon (lucide) inline before text

  Scroll indicator: bottom center, circle with chevron-down icon, "SCROLL" text, bounce animation

**WHAT WE DO SECTION** (`id="what"`)
- Background: #0F0F0F
- Eyebrow: "OUR WORK"
- Heading: "What we do."
- Subline: "We operate as a proprietary trading desk. Capital partners share in our performance, not in promises."

Current services (3 cards, dark, gold 2px top border):
Use icons from lucide-react.

Card 1 — Active Trading
Icon: TrendingUp
"We trade across Forex, Commodities and Crypto markets daily on internationally regulated platforms and infrastructure."

Card 2 — Portfolio Management
Icon: Layers
"Each capital partner's allocation is managed individually, tailored to their entry level, timeline and risk appetite."

Card 3 — Capital Partnerships
Icon: Handshake
"Selected individuals partner with the firm under a formal profit-sharing MoU. Referral and relationship-gated. No cold onboarding."

Coming soon (3 smaller cards, gold dashed top border, "Coming Soon" badge):
Card 1 — Financial Consulting / "Strategic money guidance" / Icon: MessageSquare
Card 2 — Financial Advisory / "Planning beyond trading" / Icon: BarChart3
Card 3 — Real Estate / "Property as an asset class" / Icon: Building2

**HOW IT WORKS SECTION** (`id="how"`)
- Background: #080808
- Eyebrow: "PROCESS"
- Heading: "Simple, structured, transparent."
- Subline: "We keep the process intentional, clear and documented — so you always know where you stand."

Timeline layout (desktop: 4 columns side by side / mobile: vertical stack):
Large faint step number in background (Playfair 700, 96px, rgba(245,166,35,0.04))
Gold dot marker
Step title (Playfair 400, 20px, white)
Step body (Inter 300, 14px, #8A8070)

Step 01: "You're introduced" / "Every capital partner joins through a referral or direct relationship. No cold calls, no ads."
Step 02: "We meet and discuss" / "We walk through how the firm operates, our trading approach, profit-sharing terms, and what the agreement covers. No pressure."
Step 03: "Agreements are signed" / "A Capital Partnership MoU is signed before any capital moves. Risk disclosure is explicit. No guaranteed returns. Ever. Documented."
Step 04: "Profits are shared quarterly" / "Each quarter, trading P&L is documented and profit distributions are made per the agreed ratio. Transparent. Written. Consistent."

**TRUST SIGNALS SECTION** (`id="trust"`)
- Background: #0F0F0F
- Eyebrow: "WHY TRUST US"
- Heading: "Built on paper, not promises."
- Subline: "Every capital partner is protected by formal agreements before a single rupee moves."

4 cards, 2×2 grid, white card bg (#111111), 2px LEFT gold border, CheckCircle2 icon (gold) top-left:

Card 1: "Formal Agreement First" / "We sit down, discuss every term, and sign a Capital Partnership MoU before anything begins. You know exactly what you're entering."
Card 2: "Explicit Risk Disclosure" / "A separate Risk Disclosure Statement is signed by every partner. No fixed returns are ever promised. This is documented, not just said."
Card 3: "Clean Capital Structure" / "All partner capital is held in a dedicated firm current account, never mixed with personal funds. Clean paper trail. Full separation."
Card 4: "Quarterly P&L Reporting" / "Every quarter, we share documented trading performance. You see the numbers, not just the distribution. Transparency is non-negotiable."

**THE EDGE SECTION**
- Background: #080808 with subtle gold particle/wave illustration top-right (CSS only — radial gradient)
- Eyebrow: "THE EDGE"
- Heading: "Built on algorithms. Backed by data."
- Subline: "Our trading approach is systematic and research-driven. We apply quantitative models and algorithmic strategies across every market we operate in, removing emotion from execution."

6 cards, 2×3 grid (desktop) / 1 col (mobile):
Each card: dark, thin gold border, icon (gold, 20px), title, body

- Cpu: "Algorithmic Execution" / "Rule-based systems built on statistical models. Speed, precision and consistency — without manual bias interfering at the moment of execution."
- Sigma (use Calculator icon): "Quantitative Finance" / "Mathematical frameworks to model market behaviour, price risk and identify statistical edges. Every strategy is back-tested before live capital."
- Shield: "Systematic Risk Management" / "Position sizing, drawdown limits and volatility controls are built into the system. Risk parameters are defined before a trade opens, not after."
- Globe: "Cross-Market Strategies" / "Our models run across Forex, Commodities and Crypto simultaneously. Diversification is built at the strategy level, not just the asset level."
- RefreshCw: "Strategy Iteration" / "Market conditions shift. Our models are regularly reviewed, stress-tested and updated to reflect current volatility regimes and structural market changes."
- Server: "Regulated Platforms" / "All algorithmic activity runs through internationally regulated, low-latency platforms built for professional trading operations."

**RETURNS CALCULATOR SECTION**
- Background: darkest black #050505, radial gold glow at center (CSS)
- Eyebrow: "RETURNS ILLUSTRATION"
- Heading: "See what performance-linked profit sharing could look like."
- Disclaimer: "Illustrative only. Based on historical performance of 25–35% annually. Not a guarantee of future returns."

Layout: left side heading/disclaimer, right side slider + outputs

Slider: ₹1,00,000 to ₹50,00,000, default ₹5,00,000
Custom styled (see DESIGN_SYSTEM.md for CSS)
Show current value above slider: large, gold, Playfair

3 output metric cards below slider:
- Est. Annual Return (at 30% midpoint)
- Quarterly Distribution
- 3-Year Compounded Value

Calculator logic (use CLAUDE.md for formula):
Format all values as Indian currency (en-IN locale)

Fine print: "Market-linked. Not guaranteed. For illustration only."

**WHO WE WORK WITH SECTION** (`id="who"`)
- Background: #0F0F0F
- Eyebrow: "OUR PARTNERS"
- Heading: "Who we work with."
- Subline: "We work with people, not portfolios."

3 audience cards (horizontal desktop, vertical mobile):
- Gold top border 1px
- Title: Playfair 400, 20px
- Body: Inter 300, 14px, #8A8070

Card 1: "The working professional" / "You have savings sitting in an FD earning 7%. You want better, but you don't have the time or knowledge to trade yourself. We do it for you."
Card 2: "The cautious first-timer" / "You've heard about trading but don't know where to start or who to trust. We walk you through everything, slowly and clearly, with no pressure."
Card 3: "The intentional wealth-builder" / "You understand risk. You want a diversified allocation beyond gold and real estate. You want a partner, not a product."

Capital tiers table below cards:
Header: "Capital partnership tiers" (Playfair), "Entry is always through conversation first." (Inter muted)
Table style: gold header row, alternating dark rows (see DESIGN_SYSTEM.md)

| Tier | Range | Entry Method |
|------|-------|-------------|
| L1 | ₹1L – ₹10L | Close network / referred |
| L2 | ₹10L – ₹50L | HNIs / referred partners |
| L3 | ₹50L+ | Formal due diligence |

Note below: "All tiers require a signed agreement. No tier guarantees fixed returns."

**LEADERSHIP SECTION**
- Background: #080808
- Eyebrow: "LEADERSHIP"
- Heading: "The people behind Wealthon."

3 founder cards horizontal (desktop) / vertical (mobile):
Card: dark bg, 2px gold top border, padding 28px

Suhan S.K.:
Avatar: gold-border circle, "SK" in Playfair, gold
Name: "Suhan S.K." Playfair 400
Title: "Co-Founder & Analyst" Inter 300, gold
Sub: "Trading · Research · Portfolio Analysis" Inter 300, #8A8070
Quote with left gold border: "Every trade is backed by research, discipline and a clear risk framework. Performance is earned, not promised."

Prathik R.N.:
Avatar: `<Image src="/pratik.jpeg" />` in circle, object-cover
Name: "Prathik R.N." Playfair 400
Title: "Co-Founder & Strategist" Inter 300, gold
Sub: "Business · Operations · Client Relations" Inter 300, #8A8070
Quote: "Wealthon was built on one belief: that everyday people deserve access to professionally managed capital growth."

Sumanth Hegde:
Avatar: gold-border circle, "SH" in Playfair, gold
Name: "Sumanth Hegde" Playfair 400
Title: "Technical Head" Inter 300, gold
Sub: "Technology · Systems · Digital Infrastructure" Inter 300, #8A8070
Quote: "Technology should make trust transparent. Every system we build puts clarity and security first."

**CONTACT SECTION** (`id="contact"`)
- Background: #0F0F0F
- Eyebrow: "GET IN TOUCH"
- Heading: "Start a conversation."
- Subline: "No commitment. No pressure. Just an honest conversation about whether this makes sense for you."

Form (left, max-width 520px):
All inputs use underline style (border-bottom only, see DESIGN_SYSTEM.md)
- Your name (text)
- WhatsApp number (tel)
- Investment range (select): "₹1L – ₹10L" | "₹10L – ₹50L" | "₹50L+" | "Just exploring"
- Brief message (textarea, 3 rows)
- Submit button: "Send via WhatsApp →" full-width gold primary

On submit: open WhatsApp link (see CLAUDE.md for link format)
"You will be redirected to WhatsApp" caption below button

Contact details (right side, stacked):
- Mail icon + "Email" label + "hello@wealthonventures.com" (mailto link)
- MessageCircle icon + "WhatsApp" label + "+91 90353 73664" (wa.me link)
- Shield icon + "Your information is safe with us. We respect your privacy."

**FOOTER**
- Background: #050505
- Gold top border: 1px, rgba(245,166,35,0.15)
- Layout: logo+tagline left | quick links center | disclaimer right

Logo: navlogo.png, height 32px
Tagline: "Where capital finds direction." Inter 300, #4A4438

Quick links (two columns):
Col 1: What We Do · How It Works · Who We Work With
Col 2: Insights · Contact · Partner Portal (/login)

Disclaimer text (right or below on mobile):
"Wealthon Capital Ventures is a proprietary trading firm. Capital partnerships are profit-sharing arrangements and not fixed deposit schemes or guaranteed return products. All partnerships are governed by signed agreements. Past performance does not guarantee future results. For informational purposes only."
Inter 300, 11px, #4A4438

Bottom strip:
"© 2025 Wealthon Capital Ventures · wealthonventures.com"
Social icons right: LinkedIn, Instagram, YouTube (lucide or simple SVG)

**FLOATING WHATSAPP BUTTON**
Fixed, bottom-right, z-50
56px gold circle, MessageCircle icon white 24px
href: wa.me link
gold box-shadow glow
scale(1.05) on hover

---

### 2. Insights page — `src/app/insights/page.tsx`

- Shared Navbar
- Hero: "Insights." heading, subtitle, category filter pills
- Featured article (full width card)
- 3-column article grid
- Pagination (static, just UI)

Create 3 static MDX articles in `src/content/articles/`:

Article 1: `profit-sharing-vs-fixed-returns.mdx`
```
title: "What is profit-sharing and how is it different from fixed returns?"
category: "Wealth Education"
author: "Suhan S.K."
authorInitials: "SK"
date: "02 May 2025"
readTime: "6 min read"
featured: true
excerpt: "Profit-sharing aligns interests. You grow with the firm, not just the promise. Here's how it works, what to watch for, and the questions every investor should ask before they commit."
```

Article 2: `how-we-trade.mdx`
```
title: "How we trade: our approach to Forex, Commodities and Crypto"
category: "Trading Notes"
author: "Prathik R.N."
authorInitials: "PR"
date: "24 Apr 2025"
readTime: "7 min read"
excerpt: "Inside our systematic process, market selection, strategy design and risk controls."
```

Article 3: `first-capital-partnership.mdx`
```
title: "Your first capital partnership — what to expect before you sign"
category: "Wealth Education"
author: "Sumanth Hegde"
authorInitials: "SH"
date: "18 Apr 2025"
readTime: "5 min read"
excerpt: "A step-by-step guide to our partnership process, agreements and protections."
```

Write 400-word body content for each article. Keep tone: clear, grounded, professional. No financial promises.

---

### 3. Login page — `src/app/login/page.tsx`

UI only in this phase. No auth logic. Show a toast "Auth coming soon" on submit.

Split screen layout (desktop):
- Left 45%: banner.png full cover, dark overlay, compass watermark centered (opacity 0.06), logo centered, tagline
- Right 55%: dark bg, centered form card

Form card (max-width 400px, centered):
Logo at top (small, 40px height)
"PARTNER PORTAL" eyebrow (gold, tracked, small)
"Welcome back." heading (Playfair 700, 36px)
"Sign in to access your partner dashboard." subline (Inter 300, #8A8070)

Email input (underline)
Password input (underline, eye toggle)
"Forgot password? →" right-aligned muted text

"Sign in →" button (gold primary, full width)
Divider: "OR"
"Not a partner yet? Start a conversation →" (secondary button, links to /#contact)

Footer of card:
Shield icon + "Secure access. All data is encrypted and protected with bank-grade security." (Inter 300, 11px, #4A4438)

---

## ANIMATIONS AND INTERACTIONS

1. Scroll-triggered fade-up on all section content
   Use IntersectionObserver, threshold 0.15
   Class: `fade-up` → adds `visible` on intersect
   Stagger cards with delay: 0, 100, 200ms etc.

2. Navbar transition on scroll
   Add class `scrolled` to navbar when window.scrollY > 80

3. Calculator number updates
   Smooth update when slider moves — no count-up animation needed, just instant recalculate

4. Scroll indicator bounce
   CSS keyframe animation

5. Hero stats: count-up animation on page load
   Use a simple counter hook, duration 1500ms, trigger immediately

---

## METADATA AND SEO

```typescript
// src/app/layout.tsx
export const metadata = {
  title: 'Wealthon Capital Ventures | Where capital finds direction.',
  description: 'A founder-led proprietary trading firm. Profit-sharing structure across Forex, Commodities and Crypto. Capital partnerships by referral and relationship only.',
  keywords: 'proprietary trading, forex, commodities, crypto, capital partnership, profit sharing, Bangalore',
  openGraph: {
    title: 'Wealthon Capital Ventures',
    description: 'Where capital finds direction.',
    url: 'https://www.wealthonventures.com',
    siteName: 'Wealthon Capital Ventures',
    images: [{ url: '/og.png', width: 1200, height: 630 }],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wealthon Capital Ventures',
    description: 'Where capital finds direction.',
    images: ['/og.png'],
  },
}
```

---

## DEPLOYMENT CONFIG

```typescript
// next.config.ts
const config = {
  images: {
    domains: ['www.wealthonventures.com'],
  },
}
export default config
```

```
// vercel.json (root)
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs"
}
```

---

## DONE WHEN

- [ ] All homepage sections render at 1440px with correct design
- [ ] Mobile responsive at 390px — no horizontal overflow
- [ ] Insights page shows 3 article cards + featured article
- [ ] Login page split layout renders correctly
- [ ] Calculator works with correct Indian currency formatting
- [ ] WhatsApp button and contact form link works
- [ ] No TypeScript errors (`npm run build` succeeds)
- [ ] Scroll animations work

===
