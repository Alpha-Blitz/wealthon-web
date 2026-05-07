# SCHEMA.md — Wealthon Capital Ventures Supabase Schema

Run this SQL in the Supabase SQL editor to set up the full database.

---

## STEP 1 — Enable UUID extension

```sql
create extension if not exists "uuid-ossp";
```

---

## STEP 2 — Create tables

```sql
-- Partners table
-- Links to Supabase auth.users via user_id
create table public.partners (
  id            uuid default uuid_generate_v4() primary key,
  user_id       uuid references auth.users(id) on delete cascade unique,
  full_name     text not null,
  initials      text not null,              -- e.g. "SK", "PR"
  email         text not null unique,
  phone         text,
  tier          text check (tier in ('L1', 'L2', 'L3', 'L4')) default 'L1',
  invested_amount bigint default 0,         -- stored in paise (multiply by 100)
  entry_date    date not null default now(),
  status        text check (status in ('active', 'paused', 'exited')) default 'active',
  avatar_url    text,                        -- optional photo URL
  notes         text,                        -- internal admin notes
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- Transactions table
create table public.transactions (
  id            uuid default uuid_generate_v4() primary key,
  partner_id    uuid references public.partners(id) on delete cascade not null,
  date          date not null,
  type          text check (type in ('investment', 'distribution', 'fee', 'pnl_update', 'withdrawal')) not null,
  amount        bigint not null,             -- positive = credit, negative = debit, in paise
  status        text check (status in ('completed', 'pending', 'processing', 'cancelled')) default 'pending',
  notes         text,
  created_by    uuid references auth.users(id),
  created_at    timestamptz default now()
);

-- P&L Reports table (quarterly summaries)
create table public.pnl_reports (
  id                  uuid default uuid_generate_v4() primary key,
  partner_id          uuid references public.partners(id) on delete cascade not null,
  quarter             int check (quarter in (1,2,3,4)) not null,
  year                int not null,
  opening_balance     bigint default 0,
  closing_balance     bigint default 0,
  gross_profit        bigint default 0,
  realized_pnl        bigint default 0,
  unrealized_pnl      bigint default 0,
  distribution_amount bigint default 0,
  distribution_date   date,
  distribution_status text check (distribution_status in ('paid', 'pending', 'processing')) default 'pending',
  win_rate            numeric(5,2),          -- percentage e.g. 68.50
  best_month          text,                  -- e.g. "Nov 2024"
  best_month_amount   bigint,
  worst_month         text,
  worst_month_amount  bigint,
  avg_monthly_pnl     bigint,
  positive_months     int,
  total_months        int,
  notes               text,
  created_at          timestamptz default now(),
  unique (partner_id, quarter, year)
);

-- Monthly P&L breakdown (for charts)
create table public.pnl_monthly (
  id            uuid default uuid_generate_v4() primary key,
  partner_id    uuid references public.partners(id) on delete cascade not null,
  month         int check (month between 1 and 12) not null,
  year          int not null,
  profit        bigint default 0,            -- can be negative
  forex_profit  bigint default 0,
  commodity_profit bigint default 0,
  crypto_profit bigint default 0,
  created_at    timestamptz default now(),
  unique (partner_id, month, year)
);

-- Securities / Documents table
create table public.securities (
  id                uuid default uuid_generate_v4() primary key,
  partner_id        uuid references public.partners(id) on delete cascade not null,
  mou_reference     text unique,             -- e.g. "WCV-2025-001"
  agreement_url     text,                    -- Supabase storage URL
  agreement_signed_date date,
  cheque_amount     bigint,
  cheque_date       date,
  cheque_reference  text,                    -- e.g. "CHQ-2025-001"
  cheque_status     text check (cheque_status in ('held', 'returned', 'encashed')) default 'held',
  status            text check (status in ('active', 'expired', 'terminated')) default 'active',
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

-- Asset allocation table
create table public.allocations (
  id            uuid default uuid_generate_v4() primary key,
  partner_id    uuid references public.partners(id) on delete cascade not null,
  asset_class   text not null,              -- 'Forex', 'Equities', 'Commodities', 'Cash', 'Crypto', 'Other'
  percentage    numeric(5,2) not null,       -- e.g. 45.00
  amount        bigint not null,             -- in paise
  updated_at    timestamptz default now(),
  unique (partner_id, asset_class)
);

-- Admin roles table
create table public.admin_roles (
  id        uuid default uuid_generate_v4() primary key,
  user_id   uuid references auth.users(id) on delete cascade unique,
  role      text check (role in ('admin', 'super_admin')) default 'admin',
  created_at timestamptz default now()
);
```

---

## STEP 3 — Row Level Security (RLS)

```sql
-- Enable RLS on all tables
alter table public.partners enable row level security;
alter table public.transactions enable row level security;
alter table public.pnl_reports enable row level security;
alter table public.pnl_monthly enable row level security;
alter table public.securities enable row level security;
alter table public.allocations enable row level security;
alter table public.admin_roles enable row level security;

-- Helper function: check if current user is admin
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.admin_roles
    where user_id = auth.uid()
  );
$$ language sql security definer;

-- PARTNERS policies
create policy "Partners can view own record"
  on public.partners for select
  using (user_id = auth.uid() or public.is_admin());

create policy "Only admin can insert partners"
  on public.partners for insert
  with check (public.is_admin());

create policy "Only admin can update partners"
  on public.partners for update
  using (public.is_admin());

-- TRANSACTIONS policies
create policy "Partners can view own transactions"
  on public.transactions for select
  using (
    partner_id in (
      select id from public.partners where user_id = auth.uid()
    ) or public.is_admin()
  );

create policy "Only admin can insert transactions"
  on public.transactions for insert
  with check (public.is_admin());

create policy "Only admin can update transactions"
  on public.transactions for update
  using (public.is_admin());

-- PNL_REPORTS policies
create policy "Partners can view own P&L reports"
  on public.pnl_reports for select
  using (
    partner_id in (
      select id from public.partners where user_id = auth.uid()
    ) or public.is_admin()
  );

create policy "Only admin can manage P&L reports"
  on public.pnl_reports for all
  using (public.is_admin());

-- PNL_MONTHLY policies
create policy "Partners can view own monthly P&L"
  on public.pnl_monthly for select
  using (
    partner_id in (
      select id from public.partners where user_id = auth.uid()
    ) or public.is_admin()
  );

create policy "Only admin can manage monthly P&L"
  on public.pnl_monthly for all
  using (public.is_admin());

-- SECURITIES policies
create policy "Partners can view own securities"
  on public.securities for select
  using (
    partner_id in (
      select id from public.partners where user_id = auth.uid()
    ) or public.is_admin()
  );

create policy "Only admin can manage securities"
  on public.securities for all
  using (public.is_admin());

-- ALLOCATIONS policies
create policy "Partners can view own allocations"
  on public.allocations for select
  using (
    partner_id in (
      select id from public.partners where user_id = auth.uid()
    ) or public.is_admin()
  );

create policy "Only admin can manage allocations"
  on public.allocations for all
  using (public.is_admin());

-- ADMIN_ROLES — only super_admin can view/modify
create policy "Admins can view admin roles"
  on public.admin_roles for select
  using (public.is_admin());
```

---

## STEP 4 — Useful views

```sql
-- Partner dashboard summary view
create or replace view public.partner_summary as
select
  p.id,
  p.user_id,
  p.full_name,
  p.initials,
  p.tier,
  p.invested_amount,
  p.entry_date,
  p.status,
  -- Latest P&L
  coalesce(
    (select gross_profit from public.pnl_reports
     where partner_id = p.id
     order by year desc, quarter desc limit 1), 0
  ) as current_quarter_pnl,
  -- Latest distribution
  coalesce(
    (select distribution_amount from public.pnl_reports
     where partner_id = p.id
     order by year desc, quarter desc limit 1), 0
  ) as last_distribution,
  -- Next payout date (last day of current quarter)
  case
    when extract(month from now()) between 1 and 3 then
      make_date(extract(year from now())::int, 3, 31)
    when extract(month from now()) between 4 and 6 then
      make_date(extract(year from now())::int, 6, 30)
    when extract(month from now()) between 7 and 9 then
      make_date(extract(year from now())::int, 9, 30)
    else
      make_date(extract(year from now())::int, 12, 31)
  end as next_payout_date
from public.partners p;
```

---

## STEP 5 — Supabase Storage buckets

Run in Supabase dashboard → Storage:

```
Bucket name: documents
Public: false (private — only authenticated users)
File size limit: 10MB
Allowed MIME types: application/pdf, image/jpeg, image/png
```

Storage RLS policy:
```sql
-- Partners can download their own documents
create policy "Partners can view own documents"
  on storage.objects for select
  using (
    bucket_id = 'documents' and
    (storage.foldername(name))[1] = (
      select id::text from public.partners
      where user_id = auth.uid()
    )
  );

-- Only admin can upload
create policy "Only admin can upload documents"
  on storage.objects for insert
  with check (
    bucket_id = 'documents' and public.is_admin()
  );
```

Upload path convention: `documents/{partner_id}/agreement.pdf`

---

## STEP 6 — Seed admin user

After creating your admin user via Supabase Auth dashboard:

```sql
-- Replace with your actual admin user's UUID from auth.users
insert into public.admin_roles (user_id, role)
values ('your-admin-user-uuid-here', 'super_admin');
```

---

## TYPESCRIPT TYPES

```typescript
// src/types/database.ts

export interface Partner {
  id: string
  user_id: string
  full_name: string
  initials: string
  email: string
  phone: string | null
  tier: 'L1' | 'L2' | 'L3' | 'L4'
  invested_amount: number    // in paise
  entry_date: string
  status: 'active' | 'paused' | 'exited'
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  partner_id: string
  date: string
  type: 'investment' | 'distribution' | 'fee' | 'pnl_update' | 'withdrawal'
  amount: number             // positive = credit, negative = debit
  status: 'completed' | 'pending' | 'processing' | 'cancelled'
  notes: string | null
  created_at: string
}

export interface PnLReport {
  id: string
  partner_id: string
  quarter: 1 | 2 | 3 | 4
  year: number
  opening_balance: number
  closing_balance: number
  gross_profit: number
  realized_pnl: number
  unrealized_pnl: number
  distribution_amount: number
  distribution_date: string | null
  distribution_status: 'paid' | 'pending' | 'processing'
  win_rate: number | null
  best_month: string | null
  best_month_amount: number | null
  worst_month: string | null
  worst_month_amount: number | null
  avg_monthly_pnl: number | null
  positive_months: number | null
  total_months: number | null
}

export interface PnLMonthly {
  id: string
  partner_id: string
  month: number
  year: number
  profit: number
  forex_profit: number
  commodity_profit: number
  crypto_profit: number
}

export interface Security {
  id: string
  partner_id: string
  mou_reference: string | null
  agreement_url: string | null
  agreement_signed_date: string | null
  cheque_amount: number | null
  cheque_date: string | null
  cheque_reference: string | null
  cheque_status: 'held' | 'returned' | 'encashed'
  status: 'active' | 'expired' | 'terminated'
}

export interface Allocation {
  id: string
  partner_id: string
  asset_class: string
  percentage: number
  amount: number
}
```

---

## CURRENCY UTILITIES

```typescript
// src/lib/utils.ts

// Format paise to INR display string
export function formatINR(paise: number): string {
  const rupees = paise / 100
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(rupees)
}

// Format compact (₹5L, ₹1.2Cr)
export function formatINRCompact(paise: number): string {
  const rupees = paise / 100
  if (rupees >= 10000000) return `₹${(rupees/10000000).toFixed(1)}Cr`
  if (rupees >= 100000)   return `₹${(rupees/100000).toFixed(1)}L`
  if (rupees >= 1000)     return `₹${(rupees/1000).toFixed(0)}K`
  return `₹${rupees}`
}

// NOTE: All amounts stored in paise in DB
// ₹5,00,000 = 50000000 paise
// Always divide by 100 before display
// Always multiply by 100 before storing
```
