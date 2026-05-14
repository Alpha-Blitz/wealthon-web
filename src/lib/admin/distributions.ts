import type { SupabaseClient } from '@supabase/supabase-js'
import type { Partner, Transaction, DistributionPreview, QuarterlyRate } from '@/types/database'
import { MOCK_COMPANY_ID, TRANSACTION_TYPES, INVOICE_TYPES } from '@/config/constants'
import { TABLE } from '@/config/api'
import { ok, err, type Result } from './index'
import { logAction } from './audit'
import { calculateDistribution, accountLast4 } from './calculations'
import { getRateForQuarter } from './rates'
import { generateAndSaveInvoice } from './invoices'
import { sendTransactionNotification } from './notifications'

// ── Preview ───────────────────────────────────────────────────────────────

export interface DistributionRun {
  quarter:   number
  year:      number
  rate:      QuarterlyRate
  rateIsSet: boolean
  partners:  DistributionPreview[]
  totals: {
    estTotal:    number
    payoutCount:    number
    reinvestCount:  number
  }
}

export async function getDistributionRun(
  supabase: SupabaseClient,
  quarter: number,
  year: number,
): Promise<Result<DistributionRun>> {
  const rateResult = await getRateForQuarter(supabase, quarter, year)
  if (rateResult.error || !rateResult.data) return err(rateResult.error ?? 'No rate')
  const rate: QuarterlyRate = rateResult.data
  const rateIsSet = rate.id !== 'default'

  const { data: partners, error } = await supabase
    .from(TABLE.PARTNERS)
    .select('*')
    .eq('company_id', MOCK_COMPANY_ID)
    .eq('status', 'active')
    .order('full_name')
  if (error) return err(error.message)

  const previews: DistributionPreview[] = (partners ?? []).map((p) => {
    const partner = p as Partner
    const calculatedAmount = calculateDistribution(
      partner.invested_amount,
      rate.monthly_rate,
      partner.profit_share_ratio,
    )
    return {
      partner,
      calculatedAmount,
      overrideAmount: null,
      status: 'pending',
      bankLast4: accountLast4(partner.bank_account_number),
    }
  })

  const estTotal       = previews.reduce((s, p) => s + p.calculatedAmount, 0)
  const payoutCount    = previews.filter(p => p.partner.payout_preference === 'payout').length
  const reinvestCount  = previews.filter(p => p.partner.payout_preference === 'reinvest').length

  return ok({
    quarter,
    year,
    rate,
    rateIsSet,
    partners: previews,
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
  quarter: number,
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
  const isReinvest = partner.payout_preference === 'reinvest'
  const txType = isReinvest ? TRANSACTION_TYPES.REINVEST : TRANSACTION_TYPES.DISTRIBUTION

  const { data: { user } } = await supabase.auth.getUser()
  const txDate = new Date().toISOString().split('T')[0]

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
        ? `Q${quarter} ${year} profit reinvested`
        : `Q${quarter} ${year} profit distribution`,
      created_by: user?.id ?? null,
    })
    .select()
    .single()
  if (txErr || !txRow) return err(txErr?.message ?? 'Failed to insert transaction')

  const transaction = txRow as Transaction
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

  // 3. Generate invoice
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
    after: { partner_id: partnerId, amount, type: txType, quarter, year, isReinvest },
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
  quarter: number,
  year: number,
  overrides: DistributionOverride[],
): Promise<Result<ConfirmDistributionResult>> {
  if (overrides.length === 0) return err('No partners to process')

  const processed: ProcessedDistribution[] = []
  const failed: { partnerId: string; error: string }[] = []

  for (const o of overrides) {
    const result = await processPartnerDistribution(supabase, o.partnerId, o.amount, quarter, year)
    if (result.data) processed.push(result.data)
    else failed.push({ partnerId: o.partnerId, error: result.error ?? 'Failed' })
  }

  await logAction(supabase, 'distribution.run_confirmed', 'distribution_run', null, {
    after: { quarter, year, processed: processed.length, failed: failed.length },
  })

  return ok({ processed, failed })
}

// Legacy helpers retained for the existing PnL-report flow ────────────────
export { markPartnerPaid, confirmDistributionRun, getDistributionRunLegacy } from './distributions.legacy'
