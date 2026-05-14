export const COMPANY_NAME = 'Wealthon Capital Ventures'
export const COMPANY_EMAIL = 'hello@wealthonventures.com'
export const COMPANY_WEBSITE = 'wealthonventures.com'
export const WHATSAPP_NUMBER = '919035373664'

// ── Operations cadence (non-financial) ─────────────────────────────────────

export const LOCK_IN_MONTHS = 3
export const PAYOUT_SUMMARY_DAY = 15
export const PAYOUT_DETAIL_DAY = 20
export const PARTIAL_MONTH_CUTOFF_DAY = 15

// Tier thresholds — amounts in paise. Match falls within [min, max].
export const TIER_THRESHOLDS = [
  { tier: 'L1', min: 10000000,  max: 100000000  }, // ₹1L – ₹10L
  { tier: 'L2', min: 100000001, max: 500000000  }, // ₹10L – ₹50L
  { tier: 'L3', min: 500000001, max: Infinity   }, // ₹50L+
] as const

// Legacy enum (kept for back-compat with existing data + queries)
export const PARTNER_TIERS = {
  L1: { label: 'L1', minAmount: 0 },
  L2: { label: 'L2', minAmount: 50000000 },
  L3: { label: 'L3', minAmount: 100000000 },
  L4: { label: 'L4', minAmount: 500000000 },
} as const

export function getTierForAmount(paise: number): 'L1' | 'L2' | 'L3' {
  for (const t of TIER_THRESHOLDS) {
    if (paise >= t.min && paise <= t.max) return t.tier
  }
  return 'L1'
}

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

// Fallback rate used only if app_settings can't be read.
export const DEFAULT_MONTHLY_RATE = 0.025
export const QUARTERLY_RATE_DEFAULT = 0.025 // legacy alias

export const LOCK_IN_OPTIONS = [
  { value: '3_months', label: '3 Months',  months: 3  },
  { value: '6_months', label: '6 Months',  months: 6  },
  { value: '1_year',   label: '1 Year',    months: 12 },
  { value: 'flexible', label: 'Flexible',  months: 3  },
] as const

export type LockInPeriod = typeof LOCK_IN_OPTIONS[number]['value']

export const PAYOUT_OPTIONS = [
  { value: 'payout',   label: 'Monthly Payout' },
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

export const PIPELINE_STAGES = [
  'new',
  'contacted',
  'terms_discussed',
  'agreement_signed',
  'application_submitted',
  'active_partner',
] as const
export type PipelineStage = typeof PIPELINE_STAGES[number]

export const PIPELINE_STAGE_LABELS: Record<PipelineStage, string> = {
  new:                   'New Lead',
  contacted:             'Contacted',
  terms_discussed:       'Terms Discussed',
  agreement_signed:      'Agreement Signed',
  application_submitted: 'Application Submitted',
  active_partner:        'Active Partner',
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
// The leads table uses a constrained set: new|contacted|qualified|proposal|converted|lost.
// Our 6-column kanban maps logical stages to those values, with
// 'application_submitted' collapsing to 'proposal' until the DB enum is widened.

export const LEAD_STAGE_TO_DB: Record<PipelineStage, 'new' | 'contacted' | 'qualified' | 'proposal' | 'converted'> = {
  new:                   'new',
  contacted:             'contacted',
  terms_discussed:       'qualified',
  agreement_signed:      'proposal',
  application_submitted: 'proposal',
  active_partner:        'converted',
}
