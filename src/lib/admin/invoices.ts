import type { SupabaseClient } from '@supabase/supabase-js'
import type { Partner, Transaction, QuarterlyRate, InvoiceData } from '@/types/database'
import { jsPDF } from 'jspdf'
import { TABLE } from '@/config/api'
import { INVOICE_TYPES, COMPANY_NAME, COMPANY_EMAIL, COMPANY_WEBSITE, type InvoiceTypeKey } from '@/config/constants'
import { formatINR } from '@/lib/utils'
import { ok, err, type Result } from './index'
import { logAction } from './audit'

const BUCKET = 'invoices'
const SIGNED_URL_TTL_SECONDS = 7 * 24 * 60 * 60 // 7 days

// ── Invoice numbering ──────────────────────────────────────────────────────

const TYPE_CODE: Record<InvoiceTypeKey, string> = {
  capital_receipt:        'CR',
  distribution_invoice:   'DI',
  reinvestment_statement: 'RI',
  annual_statement:       'AS',
}

export async function generateInvoiceNumber(
  supabase: SupabaseClient,
  type: InvoiceTypeKey,
  year: number,
  quarter?: number,
): Promise<string> {
  const code = TYPE_CODE[type]
  const prefix = quarter
    ? `WCV-${code}-${year}-Q${quarter}-`
    : `WCV-${code}-${year}-`

  const { count } = await supabase
    .from(TABLE.TRANSACTIONS)
    .select('invoice_number', { count: 'exact', head: true })
    .like('invoice_number', `${prefix}%`)

  const next = String((count ?? 0) + 1).padStart(3, '0')
  return `${prefix}${next}`
}

// ── PDF rendering primitives ──────────────────────────────────────────────

const GOLD: [number, number, number]  = [245, 166, 35]
const DARK: [number, number, number]  = [8, 8, 8]
const GREY: [number, number, number]  = [120, 120, 120]
const SUBTLE: [number, number, number] = [200, 200, 200]

function header(doc: jsPDF): number {
  // Brand block
  doc.setFontSize(18)
  doc.setTextColor(...DARK)
  doc.setFont('helvetica', 'bold')
  doc.text(COMPANY_NAME.toUpperCase(), 20, 22)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...GREY)
  doc.text('Proprietary Trading · Capital Partnerships', 20, 28)
  doc.text(COMPANY_WEBSITE, 20, 33)

  // Gold separator
  doc.setDrawColor(...GOLD)
  doc.setLineWidth(0.6)
  doc.line(20, 40, 190, 40)

  return 50 // y after header
}

function docMeta(doc: jsPDF, title: string, invoiceNumber: string, date: string, y: number): number {
  doc.setFontSize(18)
  doc.setTextColor(...DARK)
  doc.setFont('helvetica', 'bold')
  doc.text(title, 20, y)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...GREY)
  doc.text(`Ref: ${invoiceNumber}`, 190, y - 5, { align: 'right' })
  doc.text(`Date: ${date}`, 190, y, { align: 'right' })

  return y + 12
}

function partnerBlock(doc: jsPDF, partner: Partner, y: number): number {
  doc.setFontSize(9)
  doc.setTextColor(...GREY)
  doc.setFont('helvetica', 'bold')
  doc.text('PARTNER', 20, y)

  doc.setFontSize(11)
  doc.setTextColor(...DARK)
  doc.setFont('helvetica', 'normal')
  doc.text(partner.full_name, 20, y + 6)

  doc.setFontSize(9)
  doc.setTextColor(...GREY)
  if (partner.pan_number) doc.text(`PAN: ${partner.pan_number}`, 20, y + 12)

  const addrLines: string[] = []
  if (partner.residential_address) addrLines.push(partner.residential_address)
  const cityLine = [partner.city, partner.state, partner.pin_code].filter(Boolean).join(', ')
  if (cityLine) addrLines.push(cityLine)
  let ay = y + 18
  for (const line of addrLines) {
    const wrapped = doc.splitTextToSize(line, 90)
    doc.text(wrapped, 20, ay)
    ay += wrapped.length * 4
  }
  return Math.max(ay, y + 30)
}

function detailsTable(doc: jsPDF, rows: [string, string][], y: number): number {
  doc.setDrawColor(...SUBTLE)
  doc.setLineWidth(0.2)

  doc.setFontSize(9)
  doc.setTextColor(...GREY)
  doc.setFont('helvetica', 'bold')
  doc.text('TRANSACTION DETAILS', 20, y)
  y += 4
  doc.line(20, y, 190, y)
  y += 8

  doc.setFont('helvetica', 'normal')
  for (const [label, value] of rows) {
    doc.setFontSize(10)
    doc.setTextColor(...GREY)
    doc.text(label, 20, y)
    doc.setTextColor(...DARK)
    doc.text(value, 190, y, { align: 'right' })
    y += 7
  }
  doc.line(20, y, 190, y)
  return y + 8
}

function footer(doc: jsPDF, mou: string | null = null) {
  const pageHeight = doc.internal.pageSize.getHeight()
  doc.setDrawColor(...SUBTLE)
  doc.setLineWidth(0.2)
  doc.line(20, pageHeight - 30, 190, pageHeight - 30)

  doc.setFontSize(8)
  doc.setTextColor(...GREY)
  doc.text(
    'Capital partnerships are profit-sharing arrangements. Past performance does not guarantee future returns.',
    105,
    pageHeight - 24,
    { align: 'center' },
  )
  doc.text(
    `${COMPANY_EMAIL} · ${COMPANY_WEBSITE}${mou ? ` · MoU ${mou}` : ''}`,
    105,
    pageHeight - 19,
    { align: 'center' },
  )
}

function disclaimerBlock(doc: jsPDF, body: string, y: number): number {
  doc.setFontSize(8)
  doc.setTextColor(...GREY)
  const lines = doc.splitTextToSize(body, 170)
  doc.text(lines, 20, y)
  return y + lines.length * 4 + 4
}

// ── Template: Capital Receipt ─────────────────────────────────────────────

export function generateCapitalReceiptPDF(
  partner: Partner,
  transaction: Transaction,
): Buffer {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  let y = header(doc)
  y = docMeta(doc, 'Capital Receipt', transaction.invoice_number ?? '—',
    new Date(transaction.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    y)
  y = partnerBlock(doc, partner, y)
  y += 6
  y = detailsTable(doc, [
    ['Contribution Amount', formatINR(transaction.amount)],
    ['Contribution Date',   new Date(transaction.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })],
    ['Tier',                partner.tier],
    ['Lock-in Period',      partner.lock_in_period.replace('_', ' ')],
    ['Lock-in Expiry',      partner.lock_in_expiry ?? 'Flexible'],
    ['Payout Preference',   partner.payout_preference === 'payout' ? 'Quarterly Payout' : 'Reinvest (Compound)'],
    ['Profit Share',        `${partner.profit_share_ratio}% partner / ${100 - partner.profit_share_ratio}% firm`],
  ], y)
  y = disclaimerBlock(doc, 'This receipt confirms the firm has received your capital contribution and your capital partnership is active under the signed Capital Partnership Agreement and Risk Disclosure Statement.', y)
  footer(doc)
  return Buffer.from(doc.output('arraybuffer'))
}

// ── Template: Distribution Invoice ────────────────────────────────────────

export function generateDistributionPDF(
  partner: Partner,
  transaction: Transaction,
  rate: QuarterlyRate,
  quarter: number,
  year: number,
): Buffer {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  let y = header(doc)
  y = docMeta(doc, `Q${quarter} ${year} Distribution`, transaction.invoice_number ?? '—',
    new Date(transaction.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    y)
  y = partnerBlock(doc, partner, y)
  y += 6
  const ratePct = (rate.monthly_rate * 100).toFixed(2)
  const last4 = partner.bank_account_number?.slice(-4) ?? '----'
  y = detailsTable(doc, [
    ['Quarter',              `Q${quarter} ${year}`],
    ['Monthly Rate Applied', `${ratePct}%`],
    ['Capital Base',         formatINR(partner.invested_amount)],
    ['Profit Share',         `${partner.profit_share_ratio}%`],
    ['Distribution Amount',  formatINR(transaction.amount)],
    ['Paid To Account',      `••••${last4}`],
    ['IFSC',                 partner.bank_ifsc ?? '—'],
  ], y)
  y = disclaimerBlock(doc, `Profit distribution for Q${quarter} ${year}, calculated as Capital × ${ratePct}% × 3 months × ${partner.profit_share_ratio}% partner share. Distributions are market-linked and reflect realised performance for the quarter.`, y)
  footer(doc)
  return Buffer.from(doc.output('arraybuffer'))
}

// ── Template: Reinvestment Statement ──────────────────────────────────────

export function generateReinvestmentPDF(
  partner: Partner,
  transaction: Transaction,
  previousCapital: number,
  newCapital: number,
  quarter: number,
  year: number,
): Buffer {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  let y = header(doc)
  y = docMeta(doc, `Q${quarter} ${year} Reinvestment`, transaction.invoice_number ?? '—',
    new Date(transaction.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    y)
  y = partnerBlock(doc, partner, y)
  y += 6
  y = detailsTable(doc, [
    ['Quarter',              `Q${quarter} ${year}`],
    ['Previous Capital',     formatINR(previousCapital)],
    ['Profit Reinvested',    formatINR(transaction.amount)],
    ['New Capital Base',     formatINR(newCapital)],
    ['Profit Share',         `${partner.profit_share_ratio}%`],
  ], y)
  y = disclaimerBlock(doc, 'Profit was reinvested into the capital base, increasing your principal for compounding growth in subsequent quarters. No funds were paid out of the firm account.', y)
  footer(doc)
  return Buffer.from(doc.output('arraybuffer'))
}

// ── Template: Annual Statement ────────────────────────────────────────────

export function generateAnnualStatementPDF(
  partner: Partner,
  transactions: Transaction[],
  year: number,
): Buffer {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  let y = header(doc)
  y = docMeta(doc, `${year} Annual Statement`, `WCV-AS-${year}`,
    new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    y)
  y = partnerBlock(doc, partner, y)
  y += 6

  const yearTx = transactions
    .filter(t => new Date(t.date).getFullYear() === year)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const totalIn = yearTx.filter(t => t.type === 'capital_in' || t.type === 'investment').reduce((s, t) => s + t.amount, 0)
  const totalDist = yearTx.filter(t => t.type === 'distribution').reduce((s, t) => s + t.amount, 0)
  const totalRei = yearTx.filter(t => t.type === 'reinvest' || t.type === 'pnl_update').reduce((s, t) => s + t.amount, 0)
  const totalOut = yearTx.filter(t => t.type === 'capital_out' || t.type === 'withdrawal').reduce((s, t) => s + Math.abs(t.amount), 0)

  y = detailsTable(doc, [
    ['Capital In',     formatINR(totalIn)],
    ['Distributed',    formatINR(totalDist)],
    ['Reinvested',     formatINR(totalRei)],
    ['Capital Out',    formatINR(totalOut)],
    ['Closing Capital', formatINR(partner.invested_amount)],
  ], y)

  // Transaction list table
  doc.setFontSize(9)
  doc.setTextColor(...GREY)
  doc.setFont('helvetica', 'bold')
  doc.text('TRANSACTIONS', 20, y)
  y += 4
  doc.setDrawColor(...SUBTLE)
  doc.line(20, y, 190, y)
  y += 6

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  for (const t of yearTx) {
    if (y > 260) {
      doc.addPage()
      y = 20
    }
    const date = new Date(t.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
    doc.setTextColor(...GREY)
    doc.text(date, 20, y)
    doc.setTextColor(...DARK)
    doc.text(t.type.replace('_', ' '), 50, y)
    doc.text(t.notes ?? '', 90, y)
    doc.text(formatINR(t.amount), 190, y, { align: 'right' })
    y += 6
  }

  footer(doc)
  return Buffer.from(doc.output('arraybuffer'))
}

// ── Storage ────────────────────────────────────────────────────────────────

export async function savePDFToStorage(
  supabase: SupabaseClient,
  buffer: Buffer,
  path: string,
): Promise<Result<string>> {
  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: 'application/pdf', upsert: true })
  if (upErr) return err(upErr.message)

  const { data, error: urlErr } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS)
  if (urlErr || !data) return err(urlErr?.message ?? 'Failed to sign URL')
  return ok(data.signedUrl)
}

export async function refreshSignedUrl(
  supabase: SupabaseClient,
  path: string,
): Promise<Result<string>> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS)
  if (error || !data) return err(error?.message ?? 'Failed to sign URL')
  return ok(data.signedUrl)
}

// ── Orchestrator ──────────────────────────────────────────────────────────

interface InvoiceContext {
  rate?:            QuarterlyRate
  quarter?:         number
  year?:            number
  previousCapital?: number
  newCapital?:      number
  transactions?:    Transaction[]
}

export async function generateAndSaveInvoice(
  supabase: SupabaseClient,
  transactionId: string,
  type: InvoiceTypeKey,
  ctx: InvoiceContext = {},
): Promise<Result<InvoiceData>> {
  // 1. Fetch transaction + partner
  const { data: tx, error: txErr } = await supabase
    .from(TABLE.TRANSACTIONS)
    .select('*, partners(*)')
    .eq('id', transactionId)
    .single()
  if (txErr || !tx) return err(txErr?.message ?? 'Transaction not found')

  const transaction = tx as Transaction & { partners: Partner }
  const partner = transaction.partners

  const year    = ctx.year    ?? new Date(transaction.date).getFullYear()
  const quarter = ctx.quarter ?? Math.ceil((new Date(transaction.date).getMonth() + 1) / 3)

  // 2. Invoice number
  const useQ = type === INVOICE_TYPES.DISTRIBUTION || type === INVOICE_TYPES.REINVESTMENT
  const invoiceNumber = await generateInvoiceNumber(supabase, type, year, useQ ? quarter : undefined)
  const txWithNumber: Transaction = { ...transaction, invoice_number: invoiceNumber }

  // 3. Render PDF
  let buffer: Buffer
  switch (type) {
    case INVOICE_TYPES.CAPITAL_RECEIPT:
      buffer = generateCapitalReceiptPDF(partner, txWithNumber)
      break
    case INVOICE_TYPES.DISTRIBUTION:
      if (!ctx.rate) return err('Rate required for distribution invoice')
      buffer = generateDistributionPDF(partner, txWithNumber, ctx.rate, quarter, year)
      break
    case INVOICE_TYPES.REINVESTMENT:
      if (ctx.previousCapital === undefined || ctx.newCapital === undefined) {
        return err('previousCapital and newCapital required for reinvestment statement')
      }
      buffer = generateReinvestmentPDF(partner, txWithNumber, ctx.previousCapital, ctx.newCapital, quarter, year)
      break
    case INVOICE_TYPES.ANNUAL:
      if (!ctx.transactions) return err('transactions[] required for annual statement')
      buffer = generateAnnualStatementPDF(partner, ctx.transactions, year)
      break
    default:
      return err('Unknown invoice type')
  }

  // 4. Save to storage
  const path = `${partner.id}/${invoiceNumber}.pdf`
  const saved = await savePDFToStorage(supabase, buffer, path)
  if (saved.error || !saved.data) return err(saved.error ?? 'Storage upload failed')
  const url: string = saved.data

  // 5. Update transaction with invoice details
  const now = new Date().toISOString()
  const { error: updErr } = await supabase
    .from(TABLE.TRANSACTIONS)
    .update({
      invoice_url: url,
      invoice_number: invoiceNumber,
      invoice_generated_at: now,
    })
    .eq('id', transactionId)
  if (updErr) return err(updErr.message)

  await logAction(supabase, 'invoice.generate', 'transaction', transactionId, {
    after: { invoice_number: invoiceNumber, type },
  })

  return ok({ invoiceNumber, url, generatedAt: now })
}
