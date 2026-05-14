export const COMPANY_NAME = 'Wealthon Capital Ventures'
export const COMPANY_EMAIL = 'hello@wealthonventures.com'
export const COMPANY_WEBSITE = 'wealthonventures.com'
export const WHATSAPP_NUMBER = '919035373664'

export const ANNUAL_RETURN_MIDPOINT = 30 // % — midpoint of 25-35% historical range
export const QUARTERLY_RATE = 0.075      // 7.5% per quarter (illustrative)

export const PARTNER_TIERS = {
  L1: { label: 'L1', minAmount: 0 },
  L2: { label: 'L2', minAmount: 50000000 },   // ₹5L in paise
  L3: { label: 'L3', minAmount: 100000000 },  // ₹10L in paise
  L4: { label: 'L4', minAmount: 500000000 },  // ₹50L in paise
} as const

// Legacy enum (kept for backward compatibility with existing rows)
export const LEGACY_TRANSACTION_TYPES = ['investment', 'distribution', 'fee', 'pnl_update', 'withdrawal'] as const
export const TRANSACTION_STATUSES = ['completed', 'pending', 'processing', 'cancelled'] as const

// New transaction taxonomy
export const TRANSACTION_TYPES = {
  CAPITAL_IN:   'capital_in',
  DISTRIBUTION: 'distribution',
  REINVEST:     'reinvest',
  CAPITAL_OUT:  'capital_out',
} as const

export type TransactionTypeKey = typeof TRANSACTION_TYPES[keyof typeof TRANSACTION_TYPES]

export const TRANSACTION_TYPE_LABELS: Record<TransactionTypeKey, string> = {
  capital_in:   'Capital In',
  distribution: 'Distribution',
  reinvest:     'Reinvested',
  capital_out:  'Capital Out',
}

export const TRANSACTION_TYPE_COLORS: Record<TransactionTypeKey, 'green' | 'blue' | 'gold' | 'red'> = {
  capital_in:   'green',
  distribution: 'blue',
  reinvest:     'gold',
  capital_out:  'red',
}

export const TRANSACTION_TYPE_DESCRIPTIONS: Record<TransactionTypeKey, string> = {
  capital_in:   'Initial capital contribution',
  distribution: 'Quarterly profit distribution',
  reinvest:     'Reinvested quarterly profit',
  capital_out:  'Capital withdrawal',
}

export const QUARTERLY_RATE_DEFAULT = 0.025 // 2.5%/month

export const LOCK_IN_OPTIONS = [
  { value: '3_months', label: '3 Months' },
  { value: '6_months', label: '6 Months' },
  { value: '1_year',   label: '1 Year' },
  { value: 'flexible', label: 'Flexible' },
] as const

export type LockInPeriod = typeof LOCK_IN_OPTIONS[number]['value']

export const PAYOUT_OPTIONS = [
  { value: 'payout',   label: 'Quarterly Payout' },
  { value: 'reinvest', label: 'Reinvest (Compound)' },
] as const

export type PayoutPreference = typeof PAYOUT_OPTIONS[number]['value']

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh',
] as const

export const INVOICE_TYPES = {
  CAPITAL_RECEIPT: 'capital_receipt',
  DISTRIBUTION:    'distribution_invoice',
  REINVESTMENT:    'reinvestment_statement',
  ANNUAL:          'annual_statement',
} as const

export type InvoiceTypeKey = typeof INVOICE_TYPES[keyof typeof INVOICE_TYPES]

// Validation regexes
export const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/
export const PIN_REGEX = /^[1-9][0-9]{5}$/
export const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/

export const ASSET_CLASSES = ['Forex', 'Equities', 'Commodities', 'Cash', 'Crypto', 'Other'] as const

export const LEAD_STAGES = ['new', 'contacted', 'qualified', 'proposal', 'converted', 'lost'] as const

export const DISTRIBUTION_MONTHS = [3, 6, 9, 12] // Q1-Q4 end months

export const PAISE_PER_RUPEE = 100

export const MOCK_COMPANY_ID = (process.env.NEXT_PUBLIC_WEALTHON_COMPANY_ID ?? 'a9bb4010-8ef3-4809-bbc5-60de13db26ae').trim()

// ── Admin ──────────────────────────────────────────────────────────────────

export const ADMIN_ROLES = ['admin', 'super_admin'] as const

export const PIPELINE_STAGES = ['lead', 'conversation', 'terms_discussed', 'agreement_signed', 'active_partner'] as const
export type PipelineStage = typeof PIPELINE_STAGES[number]

export const PIPELINE_STAGE_LABELS: Record<PipelineStage, string> = {
  lead:             'Lead',
  conversation:     'Conversation',
  terms_discussed:  'Terms Discussed',
  agreement_signed: 'Agreement Signed',
  active_partner:   'Active Partner',
}

export const ARTICLE_CATEGORIES = ['Market Insights', 'Trading Notes', 'Wealth Education'] as const
export const STRATEGY_MARKETS   = ['Forex', 'Commodities', 'Crypto', 'Mixed'] as const
export const RISK_LEVELS        = ['low', 'medium', 'high'] as const

export const PARTNER_PROFIT_SHARE = 0.75
export const FIRM_PROFIT_SHARE    = 0.25

// ── Shared data ────────────────────────────────────────────────────────────

export const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'] as const

export const getCurrentQuarter = (): number => Math.ceil((new Date().getMonth() + 1) / 3)

// ── Documents ──────────────────────────────────────────────────────────────

export const MAX_DOCUMENT_SIZE_BYTES  = 10 * 1024 * 1024   // 10 MB
export const MAX_DOCUMENT_SIZE_LABEL  = '10 MB'
export const ACCEPTED_DOCUMENT_TYPES  = ['application/pdf'] as const

// ── Analytics ──────────────────────────────────────────────────────────────

export const ANALYTICS_EVENTS = {
  PAGE_VIEW:            'page_view',
  ARTICLE_VIEW:         'article_view',
  CONTACT_FORM_SUBMIT:  'contact_form_submit',
  CALCULATOR_USE:       'calculator_use',
  WHATSAPP_CLICK:       'whatsapp_click',
  CTA_CLICK:            'cta_click',
  APPLY_PARTNER_CLICK:  'apply_partner_click',
} as const

export type AnalyticsEvent = typeof ANALYTICS_EVENTS[keyof typeof ANALYTICS_EVENTS]

export const ANALYTICS_DEDUP_WINDOW_MS = 5000

// ── Pipeline — DB stage ↔ Kanban column mapping ────────────────────────────

export const LEAD_STAGE_TO_DB: Record<PipelineStage, 'new' | 'contacted' | 'qualified' | 'proposal' | 'converted'> = {
  lead:             'new',
  conversation:     'contacted',
  terms_discussed:  'qualified',
  agreement_signed: 'proposal',
  active_partner:   'converted',
}
