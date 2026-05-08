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

export const TRANSACTION_TYPES = ['investment', 'distribution', 'fee', 'pnl_update', 'withdrawal'] as const
export const TRANSACTION_STATUSES = ['completed', 'pending', 'processing', 'cancelled'] as const

export const ASSET_CLASSES = ['Forex', 'Equities', 'Commodities', 'Cash', 'Crypto', 'Other'] as const

export const LEAD_STAGES = ['new', 'contacted', 'qualified', 'proposal', 'converted', 'lost'] as const

export const DISTRIBUTION_MONTHS = [3, 6, 9, 12] // Q1-Q4 end months

export const PAISE_PER_RUPEE = 100

export const MOCK_COMPANY_ID = process.env.NEXT_PUBLIC_WEALTHON_COMPANY_ID ?? 'a9bb4010-8ef3-4809-bbc5-60de13db26ae'
