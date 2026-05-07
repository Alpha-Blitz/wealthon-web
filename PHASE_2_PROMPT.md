# PHASE_2_PROMPT.md — Auth + Dashboard Shell

Read CLAUDE.md, DESIGN_SYSTEM.md, and SCHEMA.md before writing any code.
Phase 1 (marketing site) must be complete before starting this phase.

===

## WHAT TO BUILD

Supabase auth integration + protected dashboard shell with mock data.
The portal should look exactly like the design screens (S4 dashboard overview).

---

## SETUP

```bash
npm install @supabase/supabase-js @supabase/ssr
```

Create `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=<from supabase dashboard>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from supabase dashboard>
SUPABASE_SERVICE_ROLE_KEY=<from supabase dashboard>
```

Create Supabase client files:
- `src/lib/supabase/client.ts` — browser client (createBrowserClient)
- `src/lib/supabase/server.ts` — server client (createServerClient with cookies)

---

## MIDDLEWARE

`middleware.ts` at project root:
- Check Supabase session on every request
- If accessing `/dashboard/*` without session → redirect to `/login`
- If accessing `/admin/*` without admin role → redirect to `/dashboard`
- If accessing `/login` with active session → redirect to `/dashboard`
- Allow all other routes through

---

## LOGIN PAGE — Wire up auth

Update `src/app/login/page.tsx`:
- Replace "Auth coming soon" toast with real Supabase signInWithPassword
- On success: redirect to `/dashboard`
- On error: show inline error message below password field (Inter 300, 13px, #EF4444)
- Loading state: button shows spinner, disabled

---

## DASHBOARD LAYOUT — `src/app/dashboard/layout.tsx`

Server component. Fetch current user + partner record.
If no partner record found, show "Access pending" message.

Sidebar (240px, fixed height, flex column):
- Logo at top (navlogo.png, height 32px, padding 24px)
- Nav items with icons (lucide-react):
  - LayoutDashboard: "Dashboard" → /dashboard
  - ArrowLeftRight: "Transactions" → /dashboard/transactions
  - TrendingUp: "P&L" → /dashboard/pnl
  - Shield: "Securities" → /dashboard/securities
  - User: "Profile" → /dashboard/profile
- Active state: 2px left gold border, gold text, subtle gold bg tint
- Bottom section (mt-auto):
  - Partner avatar (initials circle or photo) + name + "Partner" label
  - Collapse chevron
  - LogOut icon + "Logout" → calls supabase.auth.signOut() → redirect /login

Top bar (full width, height 64px):
- "Good morning/afternoon/evening, [first name]." (Playfair 400, 22px, white)
  Time-based greeting using server time
- "Here's your portfolio overview." (Inter 300, #8A8070)
- Right side: Bell icon (notifications placeholder) + avatar circle

---

## DASHBOARD OVERVIEW — `src/app/dashboard/page.tsx`

Use MOCK DATA for this phase (real Supabase queries come in Phase 3).
Mock data should match the design exactly:

```typescript
const mockData = {
  partner: { full_name: 'Suhan S.K.', initials: 'SK', tier: 'L1' },
  metrics: {
    totalInvested: 50000000,          // ₹5,00,000 in paise
    currentPnL: 4500000,              // +₹45,000
    pnlPercent: 9,
    quarterDistribution: 3750000,     // ₹37,500
    distributionDate: '31 Mar 2025',
    nextPayoutDate: '30 June 2025',
    daysToNextPayout: 26,
  },
  monthlyPnL: [
    { month: 'Jan', profit: 1500000 },
    { month: 'Feb', profit: 3200000 },
    { month: 'Mar', profit: 4800000 },
    { month: 'Apr', profit: 2800000 },
    { month: 'May', profit: 5500000 },
    { month: 'Jun', profit: 3100000 },
    { month: 'Jul', profit: 1200000 },
    { month: 'Aug', profit: -812000 },
    { month: 'Sep', profit: 2200000 },
    { month: 'Oct', profit: 6100000 },
    { month: 'Nov', profit: 9530000 },
    { month: 'Dec', profit: 3500000 },
  ],
  stats: {
    bestMonth: 'Nov 2024', bestMonthAmount: 9530000,
    worstMonth: 'Aug 2024', worstMonthAmount: -812000,
    avgMonthlyPnL: 3958300,
    positiveMonths: 10, totalMonths: 12,
  },
  recentActivity: [
    { date: '31 Mar 2025', type: 'distribution', amount: 3750000, status: 'completed', notes: 'Q1 2025 profit distribution' },
    { date: '15 Mar 2025', type: 'fee', amount: -300000, status: 'completed', notes: 'Quarterly admin fee' },
    { date: '01 Mar 2025', type: 'investment', amount: 50000000, status: 'completed', notes: 'Initial capital contribution' },
    { date: '28 Feb 2025', type: 'pnl_update', amount: 3280000, status: 'completed', notes: '' },
    { date: '31 Dec 2024', type: 'distribution', amount: 3520000, status: 'completed', notes: '' },
  ]
}
```

**Layout (see design screen S4):**

Top row — 4 MetricCards:
1. Total Invested: ₹5,00,000 / "Across all markets"
2. Current P&L: +₹45,000 (green) / "+9% this quarter"
3. This Quarter's Distribution: ₹37,500 / "Distributed on 31 Mar 2025"
4. Next Payout Date: "30 June 2025" (gold date in Playfair) / "In 26 days"

Middle row (60/40 split):
Left — "Quarterly Performance" bar chart:
- Recharts BarChart
- Gold bars (#F5A623), negative bars red (#EF4444)
- Dark grid lines, minimal axes
- "This Year" dropdown (decorative)
- Stats below chart: Best Month | Worst Month | Avg Monthly P&L | Positive Months

Right — "Recent Activity" list:
- Title + "View all transactions →" link
- Each row: date + type pill + amount (green/red) + status pill
- Max 8 rows shown

Bottom — Trust banner:
Full width, dark card, Shield icon gold, text:
"Your capital is protected by a signed Capital Partnership Agreement."
"All performance is market-linked. No fixed or guaranteed returns."
"View Agreement →" gold link right side

---

## TRANSACTIONS PAGE — `src/app/dashboard/transactions/page.tsx`

Mock data only this phase. UI matches design screen S3 exactly.

3 summary metric cards at top (horizontal):
- Total Invested: ₹5,00,000
- Total Distributed: ₹75,000
- Net P&L: +₹45,000 (+9% this quarter)

Filter bar:
- Date range picker (shadcn DateRangePicker, gold styled)
- Type dropdown: All | Investment | Distribution | Fee
- Export CSV button (ghost style, right aligned, decorative only this phase)

Data table (see DESIGN_SYSTEM.md for table styles):
Columns: DATE ↕ | TYPE ↕ | AMOUNT ↕ | STATUS ↕ | NOTES
Sortable column headers (decorative this phase)
8 rows of mock data (from PHASE_1_PROMPT or design S3)
Pagination: < 1 2 3 ... 10 > | "Showing 1 to 8 of 78 transactions"

---

## P&L PAGE — `src/app/dashboard/pnl/page.tsx`

Matches design screen S2.

4 metric cards top:
- Total P&L: +₹45,000 (+9.2% vs last quarter)
- Realized P&L: +₹32,500 (63% of total)
- Unrealized P&L: +₹12,500 (37% of total)
- Win Rate: 68% (+3% vs last quarter)

Main chart: "Cumulative P&L Trend" (Recharts LineChart)
- Toggle: Cumulative | Monthly
- Multi-line: All Strategies (gold), Equity (blue), Forex (purple), Commodities (cyan)
- Custom tooltip with dark bg + gold border

Right side: "Asset Allocation" donut chart
- Recharts PieChart
- Center label: "Total ₹5,00,000"
- Legend: Equities 45% | Forex 25% | Commodities 15% | Cash 10% | Other 5%

Below: "Monthly P&L Breakdown" bar chart + stats
Right: "Strategy Performance" list (Global Macro, Event Driven, Quant Equity, FX Alpha, Commodities)

---

## SECURITIES PAGE — `src/app/dashboard/securities/page.tsx`

Matches design screen S8.

Page title: "Securities & Documents" (Playfair)

Two main document cards (side by side desktop, stacked mobile):

Card 1 — Capital Partnership Agreement
Gold seal icon top-right (Shield or Award from lucide)
```
MoU Reference: WCV-2025-001
Signed: 01 January 2025
Partner: Suhan S.K.
Status: Active (green pill)
```
"Download Agreement PDF" button (gold outline)
→ Shows "Document will be available once uploaded by admin" toast (Phase 3: real PDF)

Card 2 — Security Details
```
Cheque Amount: ₹5,00,000
Cheque Date: 01 January 2025
Reference: CHQ-2025-001
Status: Held as security (gold pill)
```
"View Details" button

Below: Document history table
Columns: DOCUMENT | DATE | TYPE | DOWNLOAD
3 placeholder rows

---

## DONE WHEN

- [ ] Login with email/password works via Supabase
- [ ] Incorrect credentials shows error message
- [ ] Successful login redirects to /dashboard
- [ ] /dashboard/* redirects to /login when not authenticated
- [ ] Dashboard sidebar renders with correct active states
- [ ] All 4 dashboard pages render with mock data
- [ ] Charts render correctly (bar chart, line chart, donut)
- [ ] Logout works and redirects to /login
- [ ] `npm run build` succeeds with no errors

===
