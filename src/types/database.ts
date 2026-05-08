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
  // use admin_id + entity_type + before_data + after_data (Phase 3 columns)
  admin_id: string | null
  action: string
  entity_type: string | null
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
  referred_by: string | null   // FK → partners.id
  assigned_to: string | null   // FK → auth.users.id
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Strategy {
  id: string
  company_id: string
  name: string
  market: string | null        // DB column name (maps to asset_class)
  description: string | null
  risk_level: 'low' | 'medium' | 'high' | null
  status: string | null        // 'active' | 'inactive' — DB uses status not is_active
  allocation_pct: number | null
  win_rate: number | null
  monthly_return: number | null  // DB column name (maps to avg_monthly_return)
  total_return: number | null
  notes: string | null
  created_at: string
  updated_at: string | null
}

export interface Notification {
  id: string
  company_id: string
  partner_id: string | null    // null = broadcast to all company partners
  title: string | null
  body: string | null
  message: string              // legacy NOT NULL column — set same as body on insert
  type: string
  is_sent: boolean | null
  sent_at: string | null
  created_by: string | null
  created_at: string
}

export interface PartnerSummary extends Partner {
  current_quarter_pnl: number
  last_distribution: number
  next_payout_date: string
}
