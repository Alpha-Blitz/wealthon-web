import type { SupabaseClient } from '@supabase/supabase-js'
import type { Partner, DistributionPreview } from '@/types/database'
import { MOCK_COMPANY_ID, TRANSACTION_TYPES, INVOICE_TYPES, MONTH_NAMES } from '@/config/constants'
import { TABLE } from '@/config/api'
import { ok, err, type Result } from './index'
import { logAction } from './audit'
import { calculateDistribution, accountLast4 } from './calculations'
import { getEffectiveRate, getRateForQuarter } from './rates'
import { generateAndSaveInvoice } from './invoices'
import { sendTransactionNotification } from './notifications'

// ── Preview ───────────────────────────────────────────────────────────────

export interface DistributionRun {
  month:        number   // 1-12
  year:         number
  monthLabel:   string   // "May 2026"
  rate:         number   // decimal e.g. 0.025
  rateSource:   'quarterly' | 'default'
  ratePct:      number   // for UI, e.g. 2.5
  rateIsSet:    boolean  // true if a quarterly rate row exists (not just default fallback)
  partners:     DistributionPreview[]   // eligible partners only
  ineligible:   IneligiblePartner[]     // active partners still in lock-in / no expiry set
  totals: {
    estTotal:       number
    payoutCount:    number
    reinvestCount:  number
  }
}

export interface IneligiblePartner {
  id:             string
  full_name:      string
  initials:       string
  tier:           string
  lock_in_expiry: string | null
  reason:         'in_lock_in' | 'no_lock_in_set'
}

function isEligibleForPayout(p: Partner, todayISO: string): boolean {
  if (!p.lock_in_expiry) return false
  return p.lock_in_expiry < todayISO
}

export async function getDistributionRun(
  supabase: SupabaseClient,
  month: number,
  year: number,
): Promise<Result<DistributionRun>> {
  const { rate, source } = await getEffectiveRate(supabase, month, year)

  // Also check if a real quarterly_rates row exists for the quarter that
  // contains this month — drives the "no rate set" warning banner.
  const quarter = Math.ceil(month / 3)
  const quarterRes = await getRateForQuarter(supabase, quarter, year)
  const rateIsSet = !!quarterRes.data && quarterRes.data.id !== 'default'

  const { data: partners, error } = await supabase
    .from(TABLE.PARTNERS)
    .select('*')
    .eq('company_id', MOCK_COMPANY_ID)
    .eq('status', 'active')
    .order('full_name')
  if (error) return err(error.message)

  const todayISO = new Date().toISOString().split('T')[0]
  const allActive = (partners ?? []) as Partner[]
  const eligible   = allActive.filter(p => isEligibleForPayout(p, todayISO))
  const ineligiblePartners = allActive.filter(p => !isEligibleForPayout(p, todayISO))

  const previews: DistributionPreview[] = eligible.map(partner => ({
    partner,
    calculatedAmount: calculateDistribution(partner.invested_amount, rate, partner.profit_share_ratio),
    overrideAmount: null,
    status: 'pending',
    bankLast4: accountLast4(partner.bank_account_number),
  }))

  const ineligible: IneligiblePartner[] = ineligiblePartners.map(p => ({
    id:             p.id,
    full_name:      p.full_name,
    initials:       p.initials,
    tier:           p.tier,
    lock_in_expiry: p.lock_in_expiry,
    reason:         p.lock_in_expiry ? 'in_lock_in' : 'no_lock_in_set',
  }))

  const estTotal      = previews.reduce((s, p) => s + p.calculatedAmount, 0)
  const payoutCount   = previews.filter(p => p.partner.payout_preference === 'payout').length
  const reinvestCount = previews.filter(p => p.partner.payout_preference === 'reinvest').length

  const monthLabel = `${MONTH_NAMES[month - 1]} ${year}`

  return ok({
    month,
    year,
    monthLabel,
    rate,
    rateSource: source,
    ratePct:    Number((rate * 100).toFixed(4)),
    rateIsSet,
    partners:   previews,
    ineligible,
    totals: { estTotal, payoutCount, reinvestCount },
  })
}

// ── Process a single partner ──────────────────────────────────────────────

export interface ProcessedDistribution {
  partnerId:        string
  transactionId:    string
  invoiceNumber:    string | null
  invoiceUrl:       string | null
  whatsappUrl:      string | null
  emailSent:        boolean
  emailError:       string | null
  type:             'payout' | 'reinvest'
  amount:           number
  previousCapital:  number
  newCapital:       number
}

export async function processPartnerDistribution(
  supabase: SupabaseClient,
  partnerId: string,
  amount: number,
  month: number,
  year: number,
): Promise<Result<ProcessedDistribution>> {
  if (amount <= 0) return err('Amount must be positive')

  const { data: partnerRow, error: pErr } = await supabase
    .from(TABLE.PARTNERS)
    .select('*')
    .eq('id', partnerId)
    .eq('company_id', MOCK_COMPANY_ID)
    .single()
  if (pErr || !partnerRow) return err(pErr?.message ?? 'Partner not found')

  const partner = partnerRow as Partner
  if (!partner.lock_in_expiry || partner.lock_in_expiry >= new Date().toISOString().split('T')[0]) {
    return err('Partner is still in lock-in')
  }

  const isReinvest = partner.payout_preference === 'reinvest'
  const txType = isReinvest ? TRANSACTION_TYPES.REINVEST : TRANSACTION_TYPES.DISTRIBUTION

  const { data: { user } } = await supabase.auth.getUser()
  const txDate = new Date().toISOString().split('T')[0]
  const monthName = MONTH_NAMES[month - 1]
  const quarter = Math.ceil(month / 3)

  // 1. Insert transaction
  const { data: txRow, error: txErr } = await supabase
    .from(TABLE.TRANSACTIONS)
    .insert({
      company_id: MOCK_COMPANY_ID,
      partner_id: partnerId,
      date:       txDate,
      type:       txType,
      amount,
      status:     'completed',
      notes:      isReinvest
        ? `Monthly reinvestment — ${monthName} ${year}`
        : `Monthly payout — ${monthName} ${year}`,
      created_by: user?.id ?? null,
    })
    .select()
    .single()
  if (txErr || !txRow) return err(txErr?.message ?? 'Failed to insert transaction')

  const transaction = txRow as { id: string }
  const previousCapital = partner.invested_amount
  const newCapital = isReinvest ? previousCapital + amount : previousCapital

  // 2. Update partner.invested_amount if reinvest
  if (isReinvest) {
    const { error: updErr } = await supabase
      .from(TABLE.PARTNERS)
      .update({ invested_amount: newCapital, updated_at: new Date().toISOString() })
      .eq('id', partnerId)
    if (updErr) return err(updErr.message)
  }

  // 3. Generate invoice — invoice numbering is keyed by quarter, so derive
  const rateResult = await getRateForQuarter(supabase, quarter, year)
  const rate = rateResult.error ? null : rateResult.data
  const invoiceType = isReinvest ? INVOICE_TYPES.REINVESTMENT : INVOICE_TYPES.DISTRIBUTION
  const invoice = await generateAndSaveInvoice(supabase, transaction.id, invoiceType, {
    quarter,
    year,
    rate: rate ?? undefined,
    previousCapital,
    newCapital,
  })
  const invoiceNumber = invoice.data?.invoiceNumber ?? null
  const invoiceUrl    = invoice.data?.url ?? null

  // 4. Email + return WhatsApp URL
  const notif = await sendTransactionNotification(supabase, transaction.id, {
    quarter,
    year,
    previousCapital,
    newCapital,
  })
  const whatsappUrl = notif.data?.whatsappUrl ?? null
  const emailSent   = notif.data?.emailSent ?? false
  const emailError  = notif.error ?? notif.data?.emailError ?? null

  await logAction(supabase, 'distribution.partner.process', 'transaction', transaction.id, {
    after: { partner_id: partnerId, amount, type: txType, month, year, isReinvest },
  })

  return ok({
    partnerId,
    transactionId:   transaction.id,
    invoiceNumber,
    invoiceUrl,
    whatsappUrl,
    emailSent,
    emailError,
    type: isReinvest ? 'reinvest' : 'payout',
    amount,
    previousCapital,
    newCapital,
  })
}

// ── Confirm all (batch) ───────────────────────────────────────────────────

export interface DistributionOverride {
  partnerId: string
  amount:    number
}

export interface ConfirmDistributionResult {
  processed: ProcessedDistribution[]
  failed:    { partnerId: string; error: string }[]
}

export async function confirmDistribution(
  supabase: SupabaseClient,
  month: number,
  year: number,
  overrides: DistributionOverride[],
): Promise<Result<ConfirmDistributionResult>> {
  if (overrides.length === 0) return err('No partners to process')

  const processed: ProcessedDistribution[] = []
  const failed: { partnerId: string; error: string }[] = []

  for (const o of overrides) {
    const result = await processPartnerDistribution(supabase, o.partnerId, o.amount, month, year)
    if (result.data) processed.push(result.data)
    else failed.push({ partnerId: o.partnerId, error: result.error ?? 'Failed' })
  }

  await logAction(supabase, 'distribution.run_confirmed', 'distribution_run', null, {
    after: { month, year, processed: processed.length, failed: failed.length },
  })

  return ok({ processed, failed })
}

// Legacy helpers retained for the existing PnL-report flow ────────────────
export { markPartnerPaid, confirmDistributionRun, getDistributionRunLegacy } from './distributions.legacy'
