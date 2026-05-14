import type { SupabaseClient } from '@supabase/supabase-js'
import type { Notification, Partner, Transaction } from '@/types/database'
import { MOCK_COMPANY_ID } from '@/config/constants'
import { TABLE } from '@/config/api'
import { ok, err, type Result } from './index'
import { logAction } from './audit'
import { getFirstPayoutDate } from './calculations'
import { sendEmail } from '@/lib/email/resend'
import {
  capitalReceiptEmail,
  distributionEmail,
  reinvestEmail,
} from '@/lib/email/templates'
import {
  capitalReceivedMessage,
  distributionPaidMessage,
  reinvestConfirmedMessage,
  whatsappLink,
} from '@/lib/notifications/templates'

export interface NotificationInput {
  partner_id: string | null
  title:      string
  body:       string
  type:       'update' | 'distribution' | 'alert' | 'announcement'
}

export async function getNotifications(
  supabase: SupabaseClient,
  limit = 50
): Promise<Result<Notification[]>> {
  const { data, error } = await supabase
    .from(TABLE.NOTIFICATIONS)
    .select('*')
    .eq('company_id', MOCK_COMPANY_ID)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) return err(error.message)
  return ok(data as Notification[])
}

export async function sendNotification(
  supabase: SupabaseClient,
  input: NotificationInput
): Promise<Result<Notification>> {
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from(TABLE.NOTIFICATIONS)
    .insert({
      company_id: MOCK_COMPANY_ID,
      partner_id: input.partner_id,
      title:      input.title,
      body:       input.body,
      type:       input.type,
      is_sent:    true,
      sent_at:    new Date().toISOString(),
      created_by: user?.id ?? null,
    })
    .select()
    .single()

  if (error || !data) return err(error?.message ?? 'Failed to send notification')

  await logAction(supabase, 'notification.send', 'notification', data.id, {
    after: { type: input.type, partner_id: input.partner_id, title: input.title },
  })

  return ok(data as Notification)
}

// ── Transaction-aware notification orchestration ──────────────────────────

export interface TransactionNotificationOptions {
  quarter?:         number
  year?:            number
  previousCapital?: number
  newCapital?:      number
  sendEmailNow?:    boolean   // default true
}

export interface TransactionNotificationResult {
  whatsappUrl: string | null
  message:     string
  emailSent:   boolean
  emailError:  string | null
}

/**
 * Builds + sends notification for a single transaction. Email goes via Resend
 * (logs only if RESEND_API_KEY is unset). WhatsApp returns a wa.me URL the
 * admin must click — automated WhatsApp Business API is a future phase.
 * TODO: Replace WhatsApp URL flow with WhatsApp Business API.
 */
export async function sendTransactionNotification(
  supabase: SupabaseClient,
  transactionId: string,
  options: TransactionNotificationOptions = {},
): Promise<Result<TransactionNotificationResult>> {
  const { data: tx, error: txErr } = await supabase
    .from(TABLE.TRANSACTIONS)
    .select('*, partners(*)')
    .eq('id', transactionId)
    .single()
  if (txErr || !tx) return err(txErr?.message ?? 'Transaction not found')

  const transaction = tx as Transaction & { partners: Partner }
  const partner = transaction.partners

  const sendEmailNow = options.sendEmailNow ?? true

  const year    = options.year    ?? new Date(transaction.date).getFullYear()
  const quarter = options.quarter ?? Math.ceil((new Date(transaction.date).getMonth() + 1) / 3)
  const bankLast4 = partner.bank_account_number?.slice(-4) ?? '----'

  let message: string
  let subject: string
  let html:    string

  switch (transaction.type) {
    case 'capital_in':
    case 'investment': {
      const firstPayout = getFirstPayoutDate(new Date(transaction.date))
        .toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      message = capitalReceivedMessage(partner.full_name, transaction.amount, firstPayout)
      const built = capitalReceiptEmail(partner, transaction, transaction.invoice_url)
      subject = built.subject
      html    = built.html
      break
    }
    case 'distribution': {
      message = distributionPaidMessage(partner.full_name, transaction.amount, quarter, year, bankLast4)
      const built = distributionEmail(partner, transaction, quarter, year, transaction.invoice_url)
      subject = built.subject
      html    = built.html
      break
    }
    case 'reinvest':
    case 'pnl_update': {
      const prev = options.previousCapital ?? Math.max(0, partner.invested_amount - transaction.amount)
      const next = options.newCapital ?? partner.invested_amount
      message = reinvestConfirmedMessage(partner.full_name, transaction.amount, next)
      const built = reinvestEmail(partner, transaction, prev, next, quarter, year, transaction.invoice_url)
      subject = built.subject
      html    = built.html
      break
    }
    default:
      return err(`Notifications are not configured for transaction type "${transaction.type}".`)
  }

  // Email send
  let emailSent = false
  let emailError: string | null = null
  if (sendEmailNow && partner.email) {
    const result = await sendEmail({ to: partner.email, subject, html })
    if (result.error) {
      emailError = result.error
    } else {
      emailSent = true
    }
  }

  // Update transaction sent state on email success
  if (emailSent) {
    const existing = transaction.invoice_sent_via ?? []
    const via = existing.includes('email') ? existing : [...existing, 'email']
    await supabase
      .from(TABLE.TRANSACTIONS)
      .update({ invoice_sent_at: new Date().toISOString(), invoice_sent_via: via })
      .eq('id', transactionId)
  }

  const whatsappUrl = partner.phone ? whatsappLink(partner.phone, message) : null

  await logAction(supabase, 'notification.transaction.send', 'transaction', transactionId, {
    after: { emailSent, type: transaction.type },
  })

  return ok({ whatsappUrl, message, emailSent, emailError })
}

/**
 * Called after admin clicks the WhatsApp link in the UI — mark transaction
 * as also delivered via WhatsApp.
 */
export async function markWhatsappSent(
  supabase: SupabaseClient,
  transactionId: string,
): Promise<Result<void>> {
  const { data: existing } = await supabase
    .from(TABLE.TRANSACTIONS)
    .select('invoice_sent_via')
    .eq('id', transactionId)
    .single()
  const current: string[] = (existing as { invoice_sent_via: string[] | null } | null)?.invoice_sent_via ?? []
  const via = current.includes('whatsapp') ? current : [...current, 'whatsapp']
  const { error } = await supabase
    .from(TABLE.TRANSACTIONS)
    .update({ invoice_sent_via: via, invoice_sent_at: new Date().toISOString() })
    .eq('id', transactionId)
  if (error) return err(error.message)
  await logAction(supabase, 'notification.whatsapp.click', 'transaction', transactionId, {
    after: { via: 'whatsapp' },
  })
  return ok(undefined)
}
