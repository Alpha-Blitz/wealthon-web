# SCHEMA.md — Wealthon Capital Ventures Supabase Schema

Multi-tenant: every table carries `company_id`. All RLS policies enforce it.
Wealthon company_id: `a9bb4010-8ef3-4809-bbc5-60de13db26ae` (stored in `.env.local` as `NEXT_PUBLIC_WEALTHON_COMPANY_ID`)

Run each numbered step in the Supabase SQL editor in order.

---

## STEP 1 — Enable UUID extension

```sql
create extension if not exists "uuid-ossp";
```

---

## STEP 2 — Create tables

```sql
-- Partners table
create table public.partners (
  id              uuid default uuid_generate_v4() primary key,
  company_id      uuid not null,
  user_id         uuid references auth.users(id) on delete cascade unique,
  full_name       text not null,
  initials        text not null,
  email           text not null,
  phone           text,
  tier            text check (tier in ('L1', 'L2', 'L3', 'L4')) default 'L1',
  invested_amount bigint default 0,        -- in paise
  entry_date      date not null default now(),
  status          text check (status in ('active', 'paused', 'exited')) default 'active',
  avatar_url      text,
  notes           text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now(),
  unique (company_id, email)
);

-- Transactions table
create table public.transactions (
  id          uuid default uuid_generate_v4() primary key,
  company_id  uuid not null,
  partner_id  uuid references public.partners(id) on delete cascade not null,
  date        date not null,
  type        text check (type in ('investment', 'distribution', 'fee', 'pnl_update', 'withdrawal')) not null,
  amount      bigint not null,             -- positive = credit, negative = debit, in paise
  status      text check (status in ('completed', 'pending', 'processing', 'cancelled')) default 'pending',
  notes       text,
  created_by  uuid references auth.users(id),
  created_at  timestamptz default now()
);

-- P&L Reports (quarterly summaries)
create table public.pnl_reports (
  id                  uuid default uuid_generate_v4() primary key,
  company_id          uuid not null,
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
  win_rate            numeric(5,2),
  best_month          text,
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
  id               uuid default uuid_generate_v4() primary key,
  company_id       uuid not null,
  partner_id       uuid references public.partners(id) on delete cascade not null,
  month            int check (month between 1 and 12) not null,
  year             int not null,
  profit           bigint default 0,
  forex_profit     bigint default 0,
  commodity_profit bigint default 0,
  crypto_profit    bigint default 0,
  created_at       timestamptz default now(),
  unique (partner_id, month, year)
);

-- Securities / Documents
create table public.securities (
  id                    uuid default uuid_generate_v4() primary key,
  company_id            uuid not null,
  partner_id            uuid references public.partners(id) on delete cascade not null,
  mou_reference         text,
  agreement_url         text,
  agreement_signed_date date,
  cheque_amount         bigint,
  cheque_date           date,
  cheque_reference      text,
  cheque_status         text check (cheque_status in ('held', 'returned', 'encashed')) default 'held',
  status                text check (status in ('active', 'expired', 'terminated')) default 'active',
  created_at            timestamptz default now(),
  updated_at            timestamptz default now(),
  unique (company_id, mou_reference)
);

-- Asset allocation
create table public.allocations (
  id          uuid default uuid_generate_v4() primary key,
  company_id  uuid not null,
  partner_id  uuid references public.partners(id) on delete cascade not null,
  asset_class text not null,
  percentage  numeric(5,2) not null,
  amount      bigint not null,             -- in paise
  updated_at  timestamptz default now(),
  unique (partner_id, asset_class)
);

-- Admin roles — company_id scopes admin to their tenant
create table public.admin_roles (
  id         uuid default uuid_generate_v4() primary key,
  company_id uuid not null,
  user_id    uuid references auth.users(id) on delete cascade unique,
  role       text check (role in ('admin', 'super_admin')) default 'admin',
  created_at timestamptz default now()
);

-- Audit log — immutable record of every admin mutation
create table public.audit_log (
  id          uuid default uuid_generate_v4() primary key,
  company_id  uuid not null,
  admin_id    uuid references auth.users(id),
  action      text not null,   -- e.g. 'partner.create', 'transaction.update'
  entity_type text not null,
  entity_id   uuid,
  before_data jsonb,
  after_data  jsonb,
  created_at  timestamptz default now()
);

-- Leads (pipeline / CRM)
create table public.leads (
  id          uuid default uuid_generate_v4() primary key,
  company_id  uuid not null,
  name        text not null,
  email       text,
  phone       text,
  source      text check (source in ('referral', 'organic', 'social', 'event', 'other')),
  stage       text check (stage in ('new', 'contacted', 'qualified', 'proposal', 'converted', 'lost')) default 'new',
  referred_by uuid references public.partners(id),
  notes       text,
  assigned_to uuid references auth.users(id),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Trading strategies
create table public.strategies (
  id                 uuid default uuid_generate_v4() primary key,
  company_id         uuid not null,
  name               text not null,
  asset_class        text,
  description        text,
  risk_level         text check (risk_level in ('low', 'medium', 'high')),
  allocation_pct     numeric(5,2),
  win_rate           numeric(5,2),
  avg_monthly_return numeric(5,2),
  is_active          boolean default true,
  created_at         timestamptz default now(),
  updated_at         timestamptz default now()
);

-- Notifications to partners
create table public.notifications (
  id         uuid default uuid_generate_v4() primary key,
  company_id uuid not null,
  partner_id uuid references public.partners(id),  -- null = broadcast to all company partners
  title      text not null,
  body       text not null,
  type       text check (type in ('update', 'distribution', 'alert', 'announcement')) default 'announcement',
  is_sent    boolean default false,
  sent_at    timestamptz,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);
```

---

## STEP 3 — Indexes

```sql
create index on public.partners (company_id);
create index on public.transactions (company_id);
create index on public.transactions (partner_id);
create index on public.pnl_reports (company_id);
create index on public.pnl_reports (partner_id);
create index on public.pnl_monthly (company_id);
create index on public.pnl_monthly (partner_id);
create index on public.securities (company_id);
create index on public.allocations (company_id);
create index on public.admin_roles (company_id);
create index on public.audit_log (company_id);
create index on public.audit_log (created_at desc);
create index on public.leads (company_id);
create index on public.leads (stage);
create index on public.strategies (company_id);
create index on public.notifications (company_id);
create index on public.notifications (partner_id);
```

---

## STEP 4 — Helper functions

```sql
-- Returns the company_id that the current authenticated user belongs to (as admin)
create or replace function public.current_company_id()
returns uuid as $$
  select company_id from public.admin_roles
  where user_id = auth.uid()
  limit 1;
$$ language sql security definer stable;

-- Returns true if the current user is an admin of any company
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.admin_roles
    where user_id = auth.uid()
  );
$$ language sql security definer stable;
```

---

## STEP 5 — Row Level Security (RLS)

```sql
alter table public.partners       enable row level security;
alter table public.transactions   enable row level security;
alter table public.pnl_reports    enable row level security;
alter table public.pnl_monthly    enable row level security;
alter table public.securities     enable row level security;
alter table public.allocations    enable row level security;
alter table public.admin_roles    enable row level security;
alter table public.audit_log      enable row level security;
alter table public.leads          enable row level security;
alter table public.strategies     enable row level security;
alter table public.notifications  enable row level security;

-- PARTNERS
create policy "Partner sees own record"
  on public.partners for select
  using (user_id = auth.uid());

create policy "Admin sees own company partners"
  on public.partners for select
  using (public.is_admin() and company_id = public.current_company_id());

create policy "Admin inserts into own company"
  on public.partners for insert
  with check (public.is_admin() and company_id = public.current_company_id());

create policy "Admin updates own company partners"
  on public.partners for update
  using (public.is_admin() and company_id = public.current_company_id());

-- TRANSACTIONS
create policy "Partner sees own transactions"
  on public.transactions for select
  using (
    partner_id in (select id from public.partners where user_id = auth.uid())
  );

create policy "Admin sees own company transactions"
  on public.transactions for select
  using (public.is_admin() and company_id = public.current_company_id());

create policy "Admin inserts transactions"
  on public.transactions for insert
  with check (public.is_admin() and company_id = public.current_company_id());

create policy "Admin updates transactions"
  on public.transactions for update
  using (public.is_admin() and company_id = public.current_company_id());

-- PNL_REPORTS
create policy "Partner sees own P&L"
  on public.pnl_reports for select
  using (
    partner_id in (select id from public.partners where user_id = auth.uid())
  );

create policy "Admin manages own company P&L"
  on public.pnl_reports for all
  using (public.is_admin() and company_id = public.current_company_id());

-- PNL_MONTHLY
create policy "Partner sees own monthly P&L"
  on public.pnl_monthly for select
  using (
    partner_id in (select id from public.partners where user_id = auth.uid())
  );

create policy "Admin manages own company monthly P&L"
  on public.pnl_monthly for all
  using (public.is_admin() and company_id = public.current_company_id());

-- SECURITIES
create policy "Partner sees own securities"
  on public.securities for select
  using (
    partner_id in (select id from public.partners where user_id = auth.uid())
  );

create policy "Admin manages own company securities"
  on public.securities for all
  using (public.is_admin() and company_id = public.current_company_id());

-- ALLOCATIONS
create policy "Partner sees own allocations"
  on public.allocations for select
  using (
    partner_id in (select id from public.partners where user_id = auth.uid())
  );

create policy "Admin manages own company allocations"
  on public.allocations for all
  using (public.is_admin() and company_id = public.current_company_id());

-- ADMIN_ROLES
create policy "Admin can view own company roles"
  on public.admin_roles for select
  using (public.is_admin() and company_id = public.current_company_id());

-- AUDIT_LOG (admin read-only, insert via service role only)
create policy "Admin reads own company audit log"
  on public.audit_log for select
  using (public.is_admin() and company_id = public.current_company_id());

-- LEADS
create policy "Admin manages own company leads"
  on public.leads for all
  using (public.is_admin() and company_id = public.current_company_id());

-- STRATEGIES
create policy "Admin manages own company strategies"
  on public.strategies for all
  using (public.is_admin() and company_id = public.current_company_id());

-- NOTIFICATIONS
create policy "Admin manages own company notifications"
  on public.notifications for all
  using (public.is_admin() and company_id = public.current_company_id());

create policy "Partner sees own company notifications"
  on public.notifications for select
  using (
    company_id in (
      select company_id from public.partners where user_id = auth.uid()
    )
    and (partner_id is null or partner_id in (
      select id from public.partners where user_id = auth.uid()
    ))
  );
```

---

## STEP 6 — Views

```sql
-- Partner dashboard summary (company-scoped)
create or replace view public.partner_summary as
select
  p.id,
  p.company_id,
  p.user_id,
  p.full_name,
  p.initials,
  p.tier,
  p.invested_amount,
  p.entry_date,
  p.status,
  coalesce(
    (select gross_profit from public.pnl_reports
     where partner_id = p.id
     order by year desc, quarter desc limit 1), 0
  ) as current_quarter_pnl,
  coalesce(
    (select distribution_amount from public.pnl_reports
     where partner_id = p.id
     order by year desc, quarter desc limit 1), 0
  ) as last_distribution,
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

## STEP 7 — Supabase Storage

In Supabase dashboard → Storage, create:

```
Bucket name:  documents
Public:       false
Size limit:   10MB
MIME types:   application/pdf, image/jpeg, image/png
```

Storage RLS:
```sql
create policy "Partner views own documents"
  on storage.objects for select
  using (
    bucket_id = 'documents' and
    (storage.foldername(name))[1] = (
      select id::text from public.partners where user_id = auth.uid()
    )
  );

create policy "Admin uploads documents"
  on storage.objects for insert
  with check (
    bucket_id = 'documents' and public.is_admin()
  );
```

Upload path: `documents/{partner_id}/agreement.pdf`

---

## STEP 8 — Seed admin users

After creating admin users in Supabase Auth dashboard:

```sql
-- Wealthon company_id: a9bb4010-8ef3-4809-bbc5-60de13db26ae
insert into public.admin_roles (company_id, user_id, role) values
  ('a9bb4010-8ef3-4809-bbc5-60de13db26ae', 'prathik-auth-uuid-here',  'super_admin'),
  ('a9bb4010-8ef3-4809-bbc5-60de13db26ae', 'suhan-auth-uuid-here',    'super_admin'),
  ('a9bb4010-8ef3-4809-bbc5-60de13db26ae', 'sumanth-auth-uuid-here',  'super_admin');
```

---

## STEP 9 — Migration (if tables already exist)

Only run this if you already created the tables without `company_id`. If starting fresh, skip — STEP 2 already includes `company_id`.

```sql
-- Add company_id to existing tables and backfill with Wealthon's ID
alter table public.partners     add column if not exists company_id uuid;
alter table public.transactions add column if not exists company_id uuid;
alter table public.pnl_reports  add column if not exists company_id uuid;
alter table public.pnl_monthly  add column if not exists company_id uuid;
alter table public.securities   add column if not exists company_id uuid;
alter table public.allocations  add column if not exists company_id uuid;
alter table public.admin_roles  add column if not exists company_id uuid;

-- Backfill
update public.partners     set company_id = 'a9bb4010-8ef3-4809-bbc5-60de13db26ae' where company_id is null;
update public.transactions set company_id = 'a9bb4010-8ef3-4809-bbc5-60de13db26ae' where company_id is null;
update public.pnl_reports  set company_id = 'a9bb4010-8ef3-4809-bbc5-60de13db26ae' where company_id is null;
update public.pnl_monthly  set company_id = 'a9bb4010-8ef3-4809-bbc5-60de13db26ae' where company_id is null;
update public.securities   set company_id = 'a9bb4010-8ef3-4809-bbc5-60de13db26ae' where company_id is null;
update public.allocations  set company_id = 'a9bb4010-8ef3-4809-bbc5-60de13db26ae' where company_id is null;
update public.admin_roles  set company_id = 'a9bb4010-8ef3-4809-bbc5-60de13db26ae' where company_id is null;

-- Make not-null after backfill
alter table public.partners     alter column company_id set not null;
alter table public.transactions alter column company_id set not null;
alter table public.pnl_reports  alter column company_id set not null;
alter table public.pnl_monthly  alter column company_id set not null;
alter table public.securities   alter column company_id set not null;
alter table public.allocations  alter column company_id set not null;
alter table public.admin_roles  alter column company_id set not null;

-- Drop old is_admin policy and recreate with company-scoped helper
-- (re-run STEP 4 and STEP 5 after migration)
```

---

## TYPESCRIPT TYPES

```typescript
// src/types/database.ts

export interface Partner {
  id: string
  company_id: string
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
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  company_id: string
  partner_id: string
  date: string
  type: 'investment' | 'distribution' | 'fee' | 'pnl_update' | 'withdrawal'
  amount: number             // positive = credit, negative = debit, in paise
  status: 'completed' | 'pending' | 'processing' | 'cancelled'
  notes: string | null
  created_by: string | null
  created_at: string
}

export interface PnLReport {
  id: string
  company_id: string
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
  notes: string | null
  created_at: string
}

export interface PnLMonthly {
  id: string
  company_id: string
  partner_id: string
  month: number
  year: number
  profit: number
  forex_profit: number
  commodity_profit: number
  crypto_profit: number
  created_at: string
}

export interface Security {
  id: string
  company_id: string
  partner_id: string
  mou_reference: string | null
  agreement_url: string | null
  agreement_signed_date: string | null
  cheque_amount: number | null
  cheque_date: string | null
  cheque_reference: string | null
  cheque_status: 'held' | 'returned' | 'encashed'
  status: 'active' | 'expired' | 'terminated'
  created_at: string
  updated_at: string
}

export interface Allocation {
  id: string
  company_id: string
  partner_id: string
  asset_class: string
  percentage: number
  amount: number             // in paise
  updated_at: string
}

export interface AdminRole {
  id: string
  company_id: string
  user_id: string
  role: 'admin' | 'super_admin'
  created_at: string
}

export interface AuditLog {
  id: string
  company_id: string
  admin_id: string | null
  action: string
  entity_type: string
  entity_id: string | null
  before_data: Record<string, unknown> | null
  after_data: Record<string, unknown> | null
  created_at: string
}

export interface Lead {
  id: string
  company_id: string
  name: string
  email: string | null
  phone: string | null
  source: 'referral' | 'organic' | 'social' | 'event' | 'other' | null
  stage: 'new' | 'contacted' | 'qualified' | 'proposal' | 'converted' | 'lost'
  referred_by: string | null
  notes: string | null
  assigned_to: string | null
  created_at: string
  updated_at: string
}

export interface Strategy {
  id: string
  company_id: string
  name: string
  asset_class: string | null
  description: string | null
  risk_level: 'low' | 'medium' | 'high' | null
  allocation_pct: number | null
  win_rate: number | null
  avg_monthly_return: number | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  company_id: string
  partner_id: string | null  // null = all partners in company
  title: string
  body: string
  type: 'update' | 'distribution' | 'alert' | 'announcement'
  is_sent: boolean
  sent_at: string | null
  created_by: string | null
  created_at: string
}
```

---

## CURRENCY UTILITIES

```typescript
// src/lib/utils.ts

export function formatINR(paise: number): string {
  const rupees = paise / 100
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(rupees)
}

export function formatINRCompact(paise: number): string {
  const rupees = paise / 100
  if (rupees >= 10_000_000) return `₹${(rupees / 10_000_000).toFixed(1)}Cr`
  if (rupees >= 100_000)    return `₹${(rupees / 100_000).toFixed(1)}L`
  if (rupees >= 1_000)      return `₹${(rupees / 1_000).toFixed(0)}K`
  return `₹${rupees}`
}

// All amounts in DB are in paise. ₹5,00,000 = 50000000 paise.
// Divide by 100 to display. Multiply by 100 before storing.
```
