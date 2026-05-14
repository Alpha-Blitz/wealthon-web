import type { Partner, Transaction, PnLReport, PnLMonthly, Security, Allocation } from '@/types/database'
import { MOCK_COMPANY_ID } from '@/config/constants'

const PARTNER_ID = 'mock-partner-00000000-0000-0000-0000-000000000001'
const USER_ID    = 'mock-user-00000000-0000-0000-0000-000000000001'

export const mockPartner: Partner = {
  id: PARTNER_ID,
  company_id: MOCK_COMPANY_ID,
  user_id: USER_ID,
  full_name: 'Suhan S.K.',
  initials: 'SK',
  email: 'suhan@example.com',
  phone: '+91 98765 43210',
  tier: 'L1',
  invested_amount: 50000000,
  entry_date: '2025-01-01',
  status: 'active',
  avatar_url: null,
  username: null,
  notes: null,
  date_of_birth: null,
  pan_number: null,
  residential_address: null,
  city: null,
  state: null,
  pin_code: null,
  bank_account_number: null,
  bank_ifsc: null,
  bank_name: null,
  account_holder_name: null,
  profit_share_ratio: 75,
  lock_in_period: '6_months',
  lock_in_expiry: null,
  payout_preference: 'payout',
  contribution_date: '2025-01-01',
  risk_disclosure_acknowledged_at: null,
  terms_acknowledged_at: null,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
}

export const mockLatestPnLReport: PnLReport = {
  id: 'mock-pnl-00000000-0000-0000-0000-000000000001',
  company_id: MOCK_COMPANY_ID,
  partner_id: PARTNER_ID,
  quarter: 1,
  year: 2025,
  opening_balance: 50000000,
  closing_balance: 54500000,
  gross_profit: 4500000,        // +₹45,000
  realized_pnl: 3250000,        // ₹32,500
  unrealized_pnl: 1250000,      // ₹12,500
  distribution_amount: 3750000, // ₹37,500
  distribution_date: '2025-03-31',
  distribution_status: 'paid',
  win_rate: 68.00,
  best_month: 'Nov 2024',
  best_month_amount: 9530000,
  worst_month: 'Aug 2024',
  worst_month_amount: -812000,
  avg_monthly_pnl: 3958300,
  positive_months: 10,
  total_months: 12,
  notes: null,
  created_at: '2025-03-31T00:00:00Z',
}

export const mockMonthlyPnL: PnLMonthly[] = [
  { id: 'm1',  company_id: MOCK_COMPANY_ID, partner_id: PARTNER_ID, month: 1,  year: 2024, profit: 1500000, forex_profit: 900000,  commodity_profit: 400000, crypto_profit: 200000,  created_at: '2024-01-31T00:00:00Z' },
  { id: 'm2',  company_id: MOCK_COMPANY_ID, partner_id: PARTNER_ID, month: 2,  year: 2024, profit: 3200000, forex_profit: 1800000, commodity_profit: 800000, crypto_profit: 600000,  created_at: '2024-02-29T00:00:00Z' },
  { id: 'm3',  company_id: MOCK_COMPANY_ID, partner_id: PARTNER_ID, month: 3,  year: 2024, profit: 4800000, forex_profit: 2400000, commodity_profit: 1200000, crypto_profit: 1200000, created_at: '2024-03-31T00:00:00Z' },
  { id: 'm4',  company_id: MOCK_COMPANY_ID, partner_id: PARTNER_ID, month: 4,  year: 2024, profit: 2800000, forex_profit: 1500000, commodity_profit: 700000, crypto_profit: 600000,  created_at: '2024-04-30T00:00:00Z' },
  { id: 'm5',  company_id: MOCK_COMPANY_ID, partner_id: PARTNER_ID, month: 5,  year: 2024, profit: 5500000, forex_profit: 3000000, commodity_profit: 1500000, crypto_profit: 1000000, created_at: '2024-05-31T00:00:00Z' },
  { id: 'm6',  company_id: MOCK_COMPANY_ID, partner_id: PARTNER_ID, month: 6,  year: 2024, profit: 3100000, forex_profit: 1600000, commodity_profit: 900000, crypto_profit: 600000,  created_at: '2024-06-30T00:00:00Z' },
  { id: 'm7',  company_id: MOCK_COMPANY_ID, partner_id: PARTNER_ID, month: 7,  year: 2024, profit: 1200000, forex_profit: 600000,  commodity_profit: 400000, crypto_profit: 200000,  created_at: '2024-07-31T00:00:00Z' },
  { id: 'm8',  company_id: MOCK_COMPANY_ID, partner_id: PARTNER_ID, month: 8,  year: 2024, profit: -812000, forex_profit: -500000, commodity_profit: -200000, crypto_profit: -112000, created_at: '2024-08-31T00:00:00Z' },
  { id: 'm9',  company_id: MOCK_COMPANY_ID, partner_id: PARTNER_ID, month: 9,  year: 2024, profit: 2200000, forex_profit: 1200000, commodity_profit: 600000, crypto_profit: 400000,  created_at: '2024-09-30T00:00:00Z' },
  { id: 'm10', company_id: MOCK_COMPANY_ID, partner_id: PARTNER_ID, month: 10, year: 2024, profit: 6100000, forex_profit: 3500000, commodity_profit: 1500000, crypto_profit: 1100000, created_at: '2024-10-31T00:00:00Z' },
  { id: 'm11', company_id: MOCK_COMPANY_ID, partner_id: PARTNER_ID, month: 11, year: 2024, profit: 9530000, forex_profit: 5200000, commodity_profit: 2500000, crypto_profit: 1830000, created_at: '2024-11-30T00:00:00Z' },
  { id: 'm12', company_id: MOCK_COMPANY_ID, partner_id: PARTNER_ID, month: 12, year: 2024, profit: 3500000, forex_profit: 1800000, commodity_profit: 1000000, crypto_profit: 700000,  created_at: '2024-12-31T00:00:00Z' },
]

export const mockTransactions: Transaction[] = [
  { id: 't1', company_id: MOCK_COMPANY_ID, partner_id: PARTNER_ID, date: '2025-03-31', type: 'distribution', amount: 3750000,  status: 'completed',  notes: 'Q1 2025 profit distribution', created_by: null, created_at: '2025-03-31T10:00:00Z', invoice_url: null, invoice_number: null, invoice_generated_at: null, invoice_sent_at: null, invoice_sent_via: null, running_balance: null },
  { id: 't2', company_id: MOCK_COMPANY_ID, partner_id: PARTNER_ID, date: '2025-03-15', type: 'fee',          amount: -300000,  status: 'completed',  notes: 'Quarterly admin fee',         created_by: null, created_at: '2025-03-15T10:00:00Z', invoice_url: null, invoice_number: null, invoice_generated_at: null, invoice_sent_at: null, invoice_sent_via: null, running_balance: null },
  { id: 't3', company_id: MOCK_COMPANY_ID, partner_id: PARTNER_ID, date: '2025-03-01', type: 'investment',   amount: 50000000, status: 'completed',  notes: 'Initial capital contribution', created_by: null, created_at: '2025-03-01T10:00:00Z', invoice_url: null, invoice_number: null, invoice_generated_at: null, invoice_sent_at: null, invoice_sent_via: null, running_balance: null },
  { id: 't4', company_id: MOCK_COMPANY_ID, partner_id: PARTNER_ID, date: '2025-02-28', type: 'pnl_update',  amount: 3280000,  status: 'completed',  notes: '',                            created_by: null, created_at: '2025-02-28T10:00:00Z', invoice_url: null, invoice_number: null, invoice_generated_at: null, invoice_sent_at: null, invoice_sent_via: null, running_balance: null },
  { id: 't5', company_id: MOCK_COMPANY_ID, partner_id: PARTNER_ID, date: '2024-12-31', type: 'distribution', amount: 3520000,  status: 'completed',  notes: 'Q4 2024 distribution',        created_by: null, created_at: '2024-12-31T10:00:00Z', invoice_url: null, invoice_number: null, invoice_generated_at: null, invoice_sent_at: null, invoice_sent_via: null, running_balance: null },
  { id: 't6', company_id: MOCK_COMPANY_ID, partner_id: PARTNER_ID, date: '2024-12-15', type: 'fee',          amount: -300000,  status: 'completed',  notes: 'Quarterly admin fee',         created_by: null, created_at: '2024-12-15T10:00:00Z', invoice_url: null, invoice_number: null, invoice_generated_at: null, invoice_sent_at: null, invoice_sent_via: null, running_balance: null },
  { id: 't7', company_id: MOCK_COMPANY_ID, partner_id: PARTNER_ID, date: '2024-09-30', type: 'distribution', amount: 3200000,  status: 'completed',  notes: 'Q3 2024 distribution',        created_by: null, created_at: '2024-09-30T10:00:00Z', invoice_url: null, invoice_number: null, invoice_generated_at: null, invoice_sent_at: null, invoice_sent_via: null, running_balance: null },
  { id: 't8', company_id: MOCK_COMPANY_ID, partner_id: PARTNER_ID, date: '2024-06-30', type: 'distribution', amount: 2900000,  status: 'completed',  notes: 'Q2 2024 distribution',        created_by: null, created_at: '2024-06-30T10:00:00Z', invoice_url: null, invoice_number: null, invoice_generated_at: null, invoice_sent_at: null, invoice_sent_via: null, running_balance: null },
]

export const mockSecurity: Security = {
  id: 'mock-sec-00000000-0000-0000-0000-000000000001',
  company_id: MOCK_COMPANY_ID,
  partner_id: PARTNER_ID,
  mou_reference: 'WCV-2025-001',
  agreement_url: null,
  agreement_signed_date: '2025-01-01',
  cheque_amount: 50000000,  // ₹5,00,000
  cheque_date: '2025-01-01',
  cheque_reference: 'CHQ-2025-001',
  cheque_status: 'held',
  status: 'active',
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
}

export const mockAllocations: Allocation[] = [
  { id: 'a1', company_id: MOCK_COMPANY_ID, partner_id: PARTNER_ID, asset_class: 'Equities',    percentage: 45, amount: 22500000, updated_at: '2025-01-01T00:00:00Z' },
  { id: 'a2', company_id: MOCK_COMPANY_ID, partner_id: PARTNER_ID, asset_class: 'Forex',       percentage: 25, amount: 12500000, updated_at: '2025-01-01T00:00:00Z' },
  { id: 'a3', company_id: MOCK_COMPANY_ID, partner_id: PARTNER_ID, asset_class: 'Commodities', percentage: 15, amount: 7500000,  updated_at: '2025-01-01T00:00:00Z' },
  { id: 'a4', company_id: MOCK_COMPANY_ID, partner_id: PARTNER_ID, asset_class: 'Cash',        percentage: 10, amount: 5000000,  updated_at: '2025-01-01T00:00:00Z' },
  { id: 'a5', company_id: MOCK_COMPANY_ID, partner_id: PARTNER_ID, asset_class: 'Other',       percentage: 5,  amount: 2500000,  updated_at: '2025-01-01T00:00:00Z' },
]

export const mockStrategies = [
  { name: 'Global Macro',  market: 'Multi-Asset', monthly_return: 3.2, win_rate: 72, status: 'active' },
  { name: 'Event Driven',  market: 'Equities',    monthly_return: 2.8, win_rate: 65, status: 'active' },
  { name: 'Quant Equity',  market: 'Equities',    monthly_return: 2.1, win_rate: 68, status: 'active' },
  { name: 'FX Alpha',      market: 'Forex',       monthly_return: 3.5, win_rate: 74, status: 'active' },
  { name: 'Commodities',   market: 'Commodities', monthly_return: 1.9, win_rate: 61, status: 'active' },
]
