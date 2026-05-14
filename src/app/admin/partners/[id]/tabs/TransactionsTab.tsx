'use client'

import { useMemo, useState } from 'react'
import { Plus, FileText, Loader2, Send, Pencil, Trash2 } from 'lucide-react'
import { DataTable, type Column } from '@/components/admin/DataTable'
import { AdminMetricCard } from '@/components/admin/AdminMetricCard'
import { Modal } from '@/components/admin/Modal'
import { StatusPill } from '@/components/shared/StatusPill'
import { createClient } from '@/lib/supabase/client'
import { generateAndSaveInvoice } from '@/lib/admin/invoices'
import { sendTransactionNotification, markWhatsappSent } from '@/lib/admin/notifications'
import {
  calculateRunningBalance, sumByType, effectiveReturnPct,
} from '@/lib/admin/calculations'
import { INVOICE_TYPES, TRANSACTION_TYPE_LABELS, type TransactionTypeKey } from '@/config/constants'
import { CONTENT } from '@/config/content'
import { formatINR, formatINRCompact } from '@/lib/utils'
import { Briefcase, TrendingUp, Repeat, Percent } from 'lucide-react'
import type { Partner, Transaction } from '@/types/database'

const C = CONTENT.admin.partnerDetail

interface Props {
  partner:        Partner
  transactions:   Transaction[]
  onAdd:          () => void
  onEdit:         (t: Transaction) => void
  onDelete:       (t: Transaction) => void
  onTxUpdated:    (t: Transaction) => void
}

export function TransactionsTab({ partner, transactions, onAdd, onEdit, onDelete, onTxUpdated }: Props) {
  const [generating, setGenerating] = useState<Set<string>>(new Set())
  const [sending, setSending]       = useState<Transaction | null>(null)
  const [sendingState, setSendingState] = useState<{
    message?: string; emailSent?: boolean; emailError?: string | null; whatsappUrl?: string | null
    loading?: boolean
  }>({})

  const txWithBalance = useMemo(
    () => calculateRunningBalance(transactions, partner.payout_preference),
    [transactions, partner.payout_preference],
  )

  const totalInvested = sumByType(transactions, ['capital_in', 'investment'])
  const totalDistributed = sumByType(transactions, ['distribution'])
  const totalReinvested = sumByType(transactions, ['reinvest', 'pnl_update'])
  const initialCapital = partner.invested_amount - totalReinvested
  const returnPct = effectiveReturnPct(totalDistributed, totalReinvested, Math.max(initialCapital, 1))

  async function handleGenerate(tx: Transaction) {
    setGenerating(s => new Set(s).add(tx.id))
    const supabase = createClient()
    const type =
      tx.type === 'distribution'
        ? INVOICE_TYPES.DISTRIBUTION
        : tx.type === 'reinvest' || tx.type === 'pnl_update'
        ? INVOICE_TYPES.REINVESTMENT
        : INVOICE_TYPES.CAPITAL_RECEIPT
    const res = await generateAndSaveInvoice(supabase, tx.id, type)
    setGenerating(s => { const next = new Set(s); next.delete(tx.id); return next })
    if (res.data) {
      onTxUpdated({
        ...tx,
        invoice_url: res.data.url,
        invoice_number: res.data.invoiceNumber,
        invoice_generated_at: res.data.generatedAt,
      })
    }
  }

  async function openSend(tx: Transaction) {
    setSending(tx)
    setSendingState({ loading: true })
    const supabase = createClient()
    // Dry build: send notification (will email) and capture wa.me URL
    const res = await sendTransactionNotification(supabase, tx.id, { sendEmailNow: false })
    setSendingState({
      message: res.data?.message,
      whatsappUrl: res.data?.whatsappUrl ?? null,
      loading: false,
    })
  }

  async function handleSendEmail() {
    if (!sending) return
    setSendingState(s => ({ ...s, loading: true }))
    const supabase = createClient()
    const res = await sendTransactionNotification(supabase, sending.id, { sendEmailNow: true })
    setSendingState(s => ({
      ...s,
      emailSent: res.data?.emailSent ?? false,
      emailError: res.error ?? res.data?.emailError ?? null,
      loading: false,
    }))
    if (res.data?.emailSent) {
      onTxUpdated({ ...sending, invoice_sent_at: new Date().toISOString() })
    }
  }

  async function handleOpenWhatsapp() {
    if (!sending || !sendingState.whatsappUrl) return
    window.open(sendingState.whatsappUrl, '_blank')
    const supabase = createClient()
    await markWhatsappSent(supabase, sending.id)
  }

  const columns: Column<Transaction>[] = [
    {
      key: 'date', label: 'DATE', sortable: true,
      render: t => <span className="text-[12px] font-sans text-[#9A9080]">
        {new Date(t.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
      </span>,
    },
    {
      key: 'type', label: 'TYPE',
      render: t => {
        const key = (t.type as TransactionTypeKey)
        const label = TRANSACTION_TYPE_LABELS[key] ?? t.type
        return <StatusPill status={label} />
      },
    },
    {
      key: 'notes', label: 'DESCRIPTION',
      render: t => <span className="text-[12px] font-sans text-[#F0EDE6] line-clamp-1">{t.notes ?? '—'}</span>,
    },
    {
      key: 'amount', label: 'AMOUNT',
      render: t => (
        <span className="tabular-nums text-[13px] font-sans" style={{ color: t.amount >= 0 ? '#F0EDE6' : '#EF4444' }}>
          {t.amount >= 0 ? '+' : ''}{formatINR(t.amount)}
        </span>
      ),
    },
    {
      key: 'running_balance', label: 'BALANCE',
      render: t => (
        <span className="tabular-nums text-[12px] font-sans text-gold">
          {t.running_balance !== null ? formatINRCompact(t.running_balance) : '—'}
        </span>
      ),
    },
    {
      key: 'invoice_url', label: 'INVOICE',
      render: t => t.invoice_url ? (
        <a
          href={t.invoice_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[12px] font-sans text-gold hover:text-gold-secondary"
        >
          <FileText size={12} />
          {t.invoice_number}
        </a>
      ) : (
        <button
          onClick={(e) => { e.stopPropagation(); handleGenerate(t) }}
          disabled={generating.has(t.id)}
          className="inline-flex items-center gap-1 text-[11px] font-sans px-2 py-1 rounded-[3px] cursor-pointer bg-transparent disabled:opacity-50"
          style={{ border: '1px solid rgba(245,166,35,0.3)', color: '#F5A623' }}
        >
          {generating.has(t.id) ? <Loader2 size={11} className="animate-spin" /> : <FileText size={11} />}
          Generate
        </button>
      ),
    },
    {
      key: 'invoice_sent_at', label: 'ACTIONS',
      render: t => (
        <div className="flex gap-1.5" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => openSend(t)}
            className="inline-flex items-center gap-1 text-[11px] font-sans px-2 py-1 rounded-[3px] cursor-pointer bg-transparent"
            style={{ border: '1px solid rgba(245,166,35,0.3)', color: '#F5A623' }}
          >
            <Send size={11} />
            Send
          </button>
          <button onClick={() => onEdit(t)} className="p-1 text-[#9A9080] hover:text-[#F5A623] cursor-pointer bg-transparent border-none">
            <Pencil size={12} />
          </button>
          <button onClick={() => onDelete(t)} className="p-1 text-[#9A9080] hover:text-[#EF4444] cursor-pointer bg-transparent border-none">
            <Trash2 size={12} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-5">
      {/* Summary strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <AdminMetricCard icon={Briefcase}  label="Total Invested"   value={formatINRCompact(totalInvested)} />
        <AdminMetricCard icon={TrendingUp} label="Total Distributed" value={formatINRCompact(totalDistributed)} />
        <AdminMetricCard icon={Repeat}     label="Total Reinvested"  value={formatINRCompact(totalReinvested)} />
        <AdminMetricCard icon={Percent}    label="Effective Return"  value={`${returnPct.toFixed(1)}%`} />
      </div>

      <div className="flex justify-end">
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-2 text-[13px] font-sans px-4 py-2 rounded-[4px] cursor-pointer border-none"
          style={{ background: '#F5A623', color: '#080808' }}
        >
          <Plus size={13} />
          {C.addTransaction}
        </button>
      </div>

      <DataTable columns={columns} data={txWithBalance} />

      {/* Send modal */}
      <Modal
        isOpen={!!sending}
        onClose={() => { setSending(null); setSendingState({}) }}
        title={sending ? `Send notification — ${TRANSACTION_TYPE_LABELS[sending.type as TransactionTypeKey] ?? sending.type}` : 'Send'}
        size="md"
        compact
      >
        {sending && (
          <div className="flex flex-col gap-4">
            <div
              className="rounded-[6px] p-3 text-[12px] font-sans text-[#F0EDE6] leading-relaxed"
              style={{ background: '#0F0F0F', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              {sendingState.loading ? 'Building message…' : sendingState.message ?? '—'}
            </div>

            {sendingState.emailSent && (
              <p className="text-[12px] font-sans text-[#22C55E]">✓ Email sent to {partner.email}</p>
            )}
            {sendingState.emailError && (
              <p className="text-[12px] font-sans text-[#EF4444]">Email failed: {sendingState.emailError}</p>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={handleSendEmail}
                disabled={!partner.email || sendingState.loading}
                className="px-4 py-2 text-[13px] font-sans rounded-[4px] cursor-pointer border-none disabled:opacity-50"
                style={{ background: 'rgba(245,166,35,0.12)', color: '#F5A623' }}
              >
                Send Email
              </button>
              <button
                onClick={handleOpenWhatsapp}
                disabled={!sendingState.whatsappUrl}
                className="px-4 py-2 text-[13px] font-sans rounded-[4px] cursor-pointer border-none disabled:opacity-50"
                style={{ background: '#F5A623', color: '#080808' }}
              >
                Open WhatsApp
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
