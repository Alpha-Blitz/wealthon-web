# OPTIMIZATION_PROMPTS.md — Wealthon Capital Ventures
# Token-efficient correction and refinement prompts
# Use these AFTER each phase build to fix specific issues
# Always prefix with: "Read CLAUDE.md and DESIGN_SYSTEM.md. Then:"

---

## HOW TO USE THESE

Never re-explain the project. Claude Code has CLAUDE.md.
Start every prompt with the prefix above, then paste only the relevant section below.
One issue = one prompt. Don't batch unrelated fixes.

---

## ═══════════════════════════════
## PHASE 1 — MARKETING SITE FIXES
## ═══════════════════════════════

### P1-FIX-01 — Navbar not transitioning on scroll
```
Fix the navbar scroll transition.
Currently: [describe what's happening]
Expected: transparent with no border at top, rgba(8,8,8,0.95) + blur(20px) + 1px gold bottom border after scrolling 80px.
Use a scroll event listener in a useEffect. Add/remove class 'scrolled' on the nav element.
```

### P1-FIX-02 — Hero image not covering full viewport
```
Fix the hero section background image.
banner.png must cover the full viewport with object-fit: cover.
Dark overlay must be a gradient: linear-gradient(to right, rgba(8,8,8,0.93) 0%, rgba(8,8,8,0.75) 50%, rgba(8,8,8,0.35) 100%).
Compass overlay (compass.png): absolute positioned bottom-right, width 42vw, opacity 0.3, mix-blend-mode: luminosity, partially off right edge.
```

### P1-FIX-03 — Font weights look too heavy
```
Audit all Inter font usage across the marketing site.
Inter must only be used at weight 300 (body), 400 (labels/UI), 500 (button text max).
Remove any font-weight 600 or 700 from Inter.
Playfair Display is the only font that should use 600 or 700.
```

### P1-FIX-04 — Section spacing inconsistent
```
Standardize all section padding to: 120px top and bottom on desktop (lg+), 60px on mobile.
Content max-width: 1200px, centered, horizontal padding 40px desktop / 20px mobile.
Apply this to: what-we-do, how-it-works, trust-signals, the-edge, calculator, who-we-work-with, leadership, contact sections.
```

### P1-FIX-05 — Calculator currency format wrong
```
Fix the returns calculator currency formatting.
All values must use Indian locale (en-IN) with ₹ prefix.
Format: ₹5,00,000 not ₹500,000.
Use: new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value)
Slider range: 100000 to 5000000 (₹1L to ₹50L).
Default: 500000 (₹5L).
Annual rate: 0.30. Quarterly: annual/4. 3yr compound: principal * (1.30^3).
```

### P1-FIX-06 — Service cards styling off
```
Fix the service card styling to match DESIGN_SYSTEM.md card spec exactly.
Current services (3 cards): background #111111, border 0.5px solid rgba(245,166,35,0.15), border-top 2px solid #F5A623, border-radius 8px, padding 24px.
Coming soon cards: same but border-top should be dashed, opacity 0.5 on entire card, add "Coming Soon" badge (Inter 400, 10px, gold, outlined pill) top-right.
Icon: lucide icon, gold (#F5A623), 22px, margin-bottom 16px.
Card hover: border-color rgba(245,166,35,0.4), transform translateY(-2px), transition 0.2s.
```

### P1-FIX-07 — How it works timeline needs fixing
```
Fix the How It Works section timeline.
Desktop (lg+): 4-column horizontal layout.
Each step has: large faint step number behind content (Playfair 700, 96px, rgba(245,166,35,0.04), absolute positioned), gold dot (8px circle), step title (Playfair 400, 20px, #F0EDE6), step body (Inter 300, 14px, #8A8070).
Between steps: horizontal gold connector line (1px, rgba(245,166,35,0.2)).
Mobile: vertical stack, left-aligned, gold vertical line connecting dots.
```

### P1-FIX-08 — Trust signal cards left border missing
```
Fix trust signal cards. Each card needs:
border-left: 2px solid #F5A623 (not top border — left border).
Background: #111111.
Other 3 borders: 0.5px solid rgba(245,166,35,0.15).
CheckCircle2 icon from lucide, gold, 20px, top-left of card.
Title: Playfair 400, 18px, #F0EDE6.
Body: Inter 300, 14px, #8A8070, line-height 1.7.
2x2 grid desktop, 1 col mobile.
```

### P1-FIX-09 — Contact form inputs look boxed
```
Fix contact form inputs to underline style only.
Remove all border-radius, box borders, and background fills from inputs.
Each input: background transparent, border none, border-bottom 1px solid rgba(255,255,255,0.15), padding 12px 0, Inter 300 14px, color #F0EDE6.
Placeholder: color #4A4438.
Focus state: border-bottom-color #F5A623, outline none, no box-shadow.
Apply to: text input, tel input, select, textarea.
Select arrow: custom gold chevron.
```

### P1-FIX-10 — WhatsApp float button wrong color
```
Fix the floating WhatsApp button.
Background must be gold (#F5A623) NOT green.
Size: 56px × 56px circle.
Icon: MessageCircle from lucide-react, white, 24px.
Position: fixed, bottom 24px, right 24px, z-index 50.
box-shadow: 0 4px 20px rgba(245,166,35,0.4).
Hover: transform scale(1.05), box-shadow intensifies.
```

### P1-FIX-11 — Footer layout broken on mobile
```
Fix footer mobile layout.
Desktop: 3 columns (logo+tagline | quick links | disclaimer).
Mobile: stack vertically — logo+tagline → quick links → disclaimer → copyright.
All text: Inter 300, color #4A4438.
Logo: navlogo.png height 28px.
Gold top border: 1px solid rgba(245,166,35,0.15).
Background: #050505.
```

### P1-FIX-12 — Fade-up animations not triggering
```
Fix scroll-triggered fade-up animations.
Use IntersectionObserver with threshold: 0.12, rootMargin: '0px 0px -50px 0px'.
Initial state: opacity 0, transform translateY(24px).
Triggered state: opacity 1, transform translateY(0), transition 0.7s ease.
Apply to: all section headings, all card grids (stagger 100ms per card), timeline steps.
Do NOT apply to: navbar, hero content (those are always visible).
```

### P1-FIX-13 — Mobile hero broken
```
Fix hero section on mobile (below 768px).
Text should be centered (not left-aligned).
Headline font-size: 40px mobile (72px desktop).
Compass overlay: hide on mobile (display none below md).
Stat blocks: 2x2 grid on mobile instead of horizontal row.
Vertical gold dividers: replace with horizontal dividers on mobile.
Both CTA buttons: full width stacked on mobile.
```

### P1-FIX-14 — Insights page category filter not working
```
Fix the insights page category filter.
Categories: All | Market Insights | Trading Notes | Wealth Education.
Active pill: gold bg (#F5A623), dark text (#080808), Inter 400.
Inactive pill: transparent bg, gold border (1px), gold text, Inter 400.
On click: filter article cards to show only matching category.
"All" shows all cards.
Use React useState to track active category.
Featured article: always shown regardless of filter.
```

### P1-FIX-15 — Login page split not rendering correctly
```
Fix the login page split layout.
Desktop (lg+): left 45% / right 55% fixed height 100vh.
Left panel: banner.png cover image, overlay rgba(8,8,8,0.72), centered logo (navlogo.png height 40px) + tagline "Where capital finds direction." below.
Compass watermark: compass.png, centered, opacity 0.05, width 280px, absolute.
Right panel: background #080808, flex center, form card max-width 400px.
Form card: background #111111, border 0.5px solid rgba(245,166,35,0.2), border-radius 8px, padding 40px.
Mobile: no split — full screen, banner.png bg with heavy overlay, form card centered on top.
```

---

## ═══════════════════════════════
## PHASE 2 — AUTH + DASHBOARD FIXES
## ═══════════════════════════════

### P2-FIX-01 — Supabase auth not connecting
```
Fix Supabase auth connection.
Check .env.local has NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.
Recreate src/lib/supabase/client.ts using createBrowserClient from @supabase/ssr.
Recreate src/lib/supabase/server.ts using createServerClient from @supabase/ssr with Next.js cookies().
Ensure middleware.ts uses createServerClient with request/response cookies pattern.
```

### P2-FIX-02 — Protected routes not redirecting
```
Fix middleware route protection.
File: middleware.ts at project root (not in src/).
Logic:
- Get session via supabase.auth.getUser()
- If path starts with /dashboard and no session → redirect to /login
- If path starts with /admin and no session → redirect to /login  
- If path is /login and session exists → redirect to /dashboard
- All other paths: pass through
Export config matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg).*)']
```

### P2-FIX-03 — Sidebar active state not working
```
Fix dashboard sidebar active state.
Use usePathname() from next/navigation to get current route.
Active when pathname === item.href OR pathname.startsWith(item.href) for nested routes.
Active styles: border-left 2px solid #F5A623, text color #F5A623, background rgba(245,166,35,0.08).
Inactive styles: text color #8A8070, background transparent.
Hover: text #F0EDE6, background rgba(255,255,255,0.04).
The sidebar component must be a client component ('use client') to use usePathname.
```

### P2-FIX-04 — Dashboard charts not rendering
```
Fix Recharts charts in dashboard.
Install: npm install recharts
Wrap chart components in 'use client' directive.
Bar chart: BarChart from recharts, ResponsiveContainer width="100%" height={300}.
Bar fill: #F5A623 for positive, #EF4444 for negative values.
CartesianGrid: strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)".
XAxis/YAxis: tick color #8A8070, axisLine false, tickLine false.
Tooltip: contentStyle background #1a1a1a, border 1px solid rgba(245,166,35,0.3), color #F0EDE6.
```

### P2-FIX-05 — Metric cards gold glow missing
```
Add gold glow gradient to dashboard metric cards.
Each MetricCard needs a subtle gradient at the top:
background: linear-gradient(180deg, rgba(245,166,35,0.06) 0%, transparent 50%), #111111
Also add: box-shadow 0 1px 0 rgba(245,166,35,0.1) inset at top.
Card border: 0.5px solid rgba(245,166,35,0.2).
Positive P&L value: color #22C55E with upward arrow icon.
Negative P&L value: color #EF4444 with downward arrow icon.
Neutral values (dates, amounts): color #F5A623.
```

### P2-FIX-06 — Transaction type pills wrong colors
```
Fix transaction type pills and status pills in the transactions table.
Type pills (from design S3):
- Investment: bg rgba(34,197,94,0.12), text #22C55E, border rgba(34,197,94,0.3), ArrowUp icon
- Distribution: bg rgba(59,130,246,0.12), text #3B82F6, border rgba(59,130,246,0.3), ArrowDown icon
- Fee: bg rgba(107,114,128,0.12), text #6B7280, border rgba(107,114,128,0.3), Minus icon
- PnL Update: bg rgba(245,166,35,0.12), text #F5A623, border rgba(245,166,35,0.3), RefreshCw icon
Status pills:
- Completed: green
- Pending: gold (#F59E0B)
- Processing: blue
- Cancelled: red
```

### P2-FIX-07 — P&L multi-line chart colors wrong
```
Fix the cumulative P&L trend line chart colors.
Lines must use these exact colors:
- All Strategies: #F5A623 (gold), strokeWidth 2.5
- Equity: #3B82F6 (blue), strokeWidth 1.5
- Forex: #8B5CF6 (purple), strokeWidth 1.5
- Commodities: #06B6D4 (cyan), strokeWidth 1.5
Legend dots: match line colors.
Toggle (Cumulative/Monthly): gold active state, dark inactive.
Chart bg: transparent. Grid: rgba(255,255,255,0.04).
```

### P2-FIX-08 — Donut chart not centered
```
Fix the asset allocation donut chart.
Use Recharts PieChart + Pie with innerRadius 70 outerRadius 100.
Center label: use a custom label component rendering "Total" in Inter 300 12px #8A8070 and "₹5,00,000" in Playfair 600 18px #F5A623.
Colors in order: #F5A623, #3B82F6, #06B6D4, #FFC15E, #8B5CF6.
Legend: custom rendered below chart, each item has colored dot + label + percentage + amount.
```

### P2-FIX-09 — Logout not working
```
Fix the logout functionality.
Create a LogoutButton client component.
On click: call supabase.auth.signOut(), then router.push('/login').
Use useRouter from next/navigation for redirect.
Show loading state on button during signout.
Place in sidebar bottom section.
```

### P2-FIX-10 — Mobile dashboard needs bottom nav
```
Add mobile bottom navigation for dashboard (below md breakpoint).
Hide sidebar on mobile. Show bottom tab bar instead.
Bottom bar: fixed bottom, full width, height 60px, background #080808, border-top 1px solid rgba(245,166,35,0.1).
5 tabs: Dashboard (LayoutDashboard) | Transactions (ArrowLeftRight) | P&L (TrendingUp) | Securities (Shield) | Profile (User).
Active tab: gold icon + gold label text.
Inactive: #4A4438 icon, no label (icon only on mobile to save space).
```

---

## ═══════════════════════════════
## PHASE 3 — REAL DATA FIXES
## ═══════════════════════════════

### P3-FIX-01 — Replace mock data with Supabase queries
```
Replace mock data in dashboard/page.tsx with real Supabase queries.
Use the server client (src/lib/supabase/server.ts).
Queries needed:
1. Get partner record: SELECT * FROM partners WHERE user_id = auth.uid()
2. Get latest P&L report: SELECT * FROM pnl_reports WHERE partner_id = ? ORDER BY year DESC, quarter DESC LIMIT 1
3. Get monthly P&L for chart: SELECT * FROM pnl_monthly WHERE partner_id = ? AND year = 2025 ORDER BY month
4. Get recent 8 transactions: SELECT * FROM transactions WHERE partner_id = ? ORDER BY date DESC LIMIT 8
All amounts stored in paise — divide by 100 before display.
Handle loading and error states.
```

### P3-FIX-02 — RLS blocking dashboard queries
```
Debug RLS policy issue. Partner cannot see their own data.
Check: the partners table must have a row where user_id matches auth.uid().
If no partner row exists for this user, show a message: "Your account is being set up. Contact hello@wealthonventures.com"
Add a helper function: async function getPartnerForUser(supabase, userId) that returns null gracefully instead of throwing.
Check Supabase dashboard → Authentication → Users to confirm user exists.
Check Supabase dashboard → Table editor → partners to confirm partner row exists with correct user_id.
```

### P3-FIX-03 — PDF download from Supabase storage
```
Fix document download in securities page.
Get signed URL from Supabase storage:
const { data } = await supabase.storage.from('documents').createSignedUrl(`${partnerId}/agreement.pdf`, 3600)
Open URL in new tab on button click.
If no URL (file not uploaded yet): show toast "Document not yet available. Contact hello@wealthonventures.com"
Use lucide Download icon on button.
```

---

## ═══════════════════════════════
## GLOBAL — USE ANYTIME
## ═══════════════════════════════

### GLOBAL-01 — TypeScript errors on build
```
Fix all TypeScript errors. Run npm run build and fix every error.
Common issues to check:
- Missing return types on async functions
- 'any' types — replace with proper types from src/types/index.ts
- Missing null checks on Supabase query results
- useRouter/usePathname used in server components (move to client components)
- Image component missing width/height props
Do not use @ts-ignore or @ts-expect-error as a fix.
```

### GLOBAL-02 — Performance audit
```
Run a performance pass on the entire project.
1. Add loading="lazy" to all images below the fold (keep priority on hero banner.png)
2. Add next/image width and height to all Image components
3. Move all heavy client components (charts, calculator) to dynamic imports with ssr: false
4. Add Suspense boundaries around dashboard data-fetching components
5. Ensure no layout shift on font load (font-display: swap is default with next/font)
6. Check bundle size: npm run build — flag any page over 150kb first load JS
```

### GLOBAL-03 — Responsive audit
```
Do a full mobile responsive audit at 390px viewport width.
Issues to fix:
- Any element causing horizontal scroll → add overflow-x: hidden to body
- Text that's too large on mobile → scale down with responsive Tailwind classes
- Buttons too small for touch → minimum 44px tap target height
- Tables → wrap in horizontal scroll container
- Grid layouts → stack to single column below md
- Fixed positioned elements → check they don't overlap content
- Hero headline → max 2 lines on mobile
```

### GLOBAL-04 — Add missing meta tags
```
Add complete meta tags to src/app/layout.tsx.
Required:
- canonical URL
- robots: index, follow
- og:image pointing to /og.png
- twitter:card summary_large_image
- theme-color: #080808
- apple-mobile-web-app-capable
- viewport: width=device-width, initial-scale=1, maximum-scale=5
Also add to public/:
- favicon.ico (if missing, generate from compass.png)
- apple-touch-icon.png (180x180)
- site.webmanifest with name, short_name, theme_color #080808, background_color #080808
```

### GLOBAL-05 — Noise texture not showing
```
Add the CSS noise texture overlay to all dark section backgrounds.
Create a reusable CSS class 'noise-bg' in globals.css:

.noise-bg {
  position: relative;
}
.noise-bg::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
  pointer-events: none;
  z-index: 0;
}
.noise-bg > * { position: relative; z-index: 1; }

Apply 'noise-bg' class to: hero section, what-we-do section, trust signals section, calculator section.
```

### GLOBAL-06 — Gold dot in headings missing
```
Add gold period to all major section headings that have it in the designs.
Sections that need "heading<span class='text-gold-primary'>.</span>":
- "What we do."
- "Simple, structured, transparent."
- "Built on paper, not promises."
- "Built on algorithms. Backed by data."
- "Who we work with."
- "The people behind Wealthon."
- "Start a conversation."
- "Insights."
- "Capital partnership tiers."
In Tailwind: text-[#F5A623]
Do NOT add gold period to: eyebrow labels, body text, sublines.
```

### GLOBAL-07 — Section eyebrows missing or wrong style
```
Standardize all section eyebrow labels.
Style: Inter 400, 11px, letter-spacing 0.18em, text-transform uppercase, color #F5A623.
Add thin gold line (40px wide, 1px height, background #F5A623) below eyebrow, margin-bottom 16px.
Then heading.
Eyebrows: "OUR WORK" | "PROCESS" | "WHY TRUST US" | "THE EDGE" | "RETURNS ILLUSTRATION" | "OUR PARTNERS" | "LEADERSHIP" | "GET IN TOUCH" | "INSIGHTS" | "PARTNER PORTAL"
```

### GLOBAL-08 — Quick component check
```
Audit all shadcn components for correct dark theme styling.
Every shadcn component (Button, Input, Select, Table, Badge) needs these overrides:
- Background: transparent or #111111
- Border: rgba(245,166,35,0.2)
- Text: #F0EDE6
- Focus ring: gold (#F5A623)
- Placeholder: #4A4438
Check src/components/ui/ files and add cn() class overrides.
Do not modify the shadcn source — use className props to override.
```

### GLOBAL-09 — Vercel deployment failing
```
Fix Vercel deployment.
Common causes:
1. Environment variables not set in Vercel dashboard → add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel project settings
2. Build error: run npm run build locally first and fix all errors
3. Image optimization: if using external image URLs, add domains to next.config.ts images.domains array
4. Missing public assets: ensure banner.png, navlogo.png, compass.png, pratik.jpeg are all in /public/ and committed to git
5. Node version: add .nvmrc file with content "20" to ensure Node 20 on Vercel
```

### GLOBAL-10 — Add smooth scroll behavior
```
Add smooth scroll to all anchor links.
In globals.css: html { scroll-behavior: smooth; }
Add scroll-padding-top: 80px to html (accounts for sticky navbar height).
All nav links use href="#section-id".
All CTA buttons that scroll: onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
Active nav link detection: use IntersectionObserver on each section to update active state as user scrolls.
```
