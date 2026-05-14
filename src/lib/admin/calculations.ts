import type { Transaction, Partner, LockInPeriodValue } from '@/types/database'

/**
 * Distribution = capital × monthlyRate × months × (profitShareRatio / 100)
 * All capital values are in paise. monthlyRate is a decimal (0.025 = 2.5%).
 */
export function calculateDistribution(
  capitalPaise: number,
  monthlyRate: number,
  profitShareRatio: number,
  months: number = 3,
): number {
  return Math.round(capitalPaise * monthlyRate * months * (profitShareRatio / 100))
}

/**
 * Adds a `running_balance` to each transaction.
 * For PAYOUT partners: balance only changes on CAPITAL_IN / CAPITAL_OUT.
 * For REINVEST partners: balance grows by REINVEST too.
 * Distributions do NOT change the capital base for payout partners — only
 * for reinvest partners.
 */
export function calculateRunningBalance(
  transactions: Transaction[],
  payoutPreference: Partner['payout_preference'],
): Transaction[] {
  const ascending = [...transactions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  )
  let balance = 0
  const enriched = ascending.map(t => {
    if (t.type === 'capital_in' || t.type === 'investment') {
      balance += t.amount
    } else if (t.type === 'capital_out' || t.type === 'withdrawal') {
      balance -= Math.abs(t.amount)
    } else if ((t.type === 'reinvest' || t.type === 'pnl_update') && payoutPreference === 'reinvest') {
      balance += t.amount
    }
    return { ...t, running_balance: balance }
  })
  // Return in original (descending date) order to match query output
  return enriched.reverse()
}

export function calculateLockInExpiry(
  contributionDate: Date,
  lockInPeriod: LockInPeriodValue,
): Date | null {
  if (lockInPeriod === 'flexible') return null
  const d = new Date(contributionDate)
  switch (lockInPeriod) {
    case '3_months': d.setMonth(d.getMonth() + 3); break
    case '6_months': d.setMonth(d.getMonth() + 6); break
    case '1_year':   d.setFullYear(d.getFullYear() + 1); break
  }
  return d
}

/**
 * First payout = last day of the next complete quarter after contribution.
 * Contribution mid-quarter waits for the NEXT full quarter to end.
 */
export function getFirstPayoutDate(contributionDate: Date): Date {
  const month = contributionDate.getMonth() + 1
  const year = contributionDate.getFullYear()
  const currentQuarter = Math.ceil(month / 3)
  const nextQuarter = currentQuarter === 4 ? 1 : currentQuarter + 1
  const targetYear = currentQuarter === 4 ? year + 1 : year
  const lastMonth = nextQuarter * 3                  // 3 / 6 / 9 / 12
  // Last day of that month
  return new Date(targetYear, lastMonth, 0)
}

/**
 * Sum INR helpers — receive arrays of transactions and sum by type.
 */
export function sumByType(transactions: Transaction[], types: Transaction['type'][]): number {
  return transactions
    .filter(t => types.includes(t.type))
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)
}

export function effectiveReturnPct(
  totalDistributed: number,
  totalReinvested: number,
  initialCapital: number,
): number {
  if (initialCapital <= 0) return 0
  return ((totalDistributed + totalReinvested) / initialCapital) * 100
}

export function maskAccountNumber(account: string | null | undefined): string {
  if (!account) return '****'
  const last4 = account.slice(-4)
  return `••••${last4}`
}

export function accountLast4(account: string | null | undefined): string {
  if (!account) return '0000'
  return account.slice(-4).padStart(4, '0')
}
