export interface Partner {
  id: string
  user_id: string
  full_name: string
  initials: string
  email: string
  phone: string | null
  tier: "L1" | "L2" | "L3" | "L4"
  invested_amount: number    // in paise
  entry_date: string
  status: "active" | "paused" | "exited"
  avatar_url: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  partner_id: string
  date: string
  type: "investment" | "distribution" | "fee" | "pnl_update" | "withdrawal"
  amount: number             // positive = credit, negative = debit, in paise
  status: "completed" | "pending" | "processing" | "cancelled"
  notes: string | null
  created_by: string | null
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
  distribution_status: "paid" | "pending" | "processing"
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
  partner_id: string
  mou_reference: string | null
  agreement_url: string | null
  agreement_signed_date: string | null
  cheque_amount: number | null
  cheque_date: string | null
  cheque_reference: string | null
  cheque_status: "held" | "returned" | "encashed"
  status: "active" | "expired" | "terminated"
  created_at: string
  updated_at: string
}

export interface Allocation {
  id: string
  partner_id: string
  asset_class: string
  percentage: number
  amount: number
  updated_at: string
}

export interface AdminRole {
  id: string
  user_id: string
  role: "admin" | "super_admin"
  created_at: string
}
