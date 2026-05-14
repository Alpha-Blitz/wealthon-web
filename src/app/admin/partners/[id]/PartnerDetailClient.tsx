'use client'

import { useState } from 'react'
import { Pencil, Mail, Phone, MessageSquare, Plus, Trash2, Briefcase, TrendingUp, Gift, Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { updatePartner, type PartnerInput } from '@/lib/admin/partners'
import { addTransaction, updateTransaction, deleteTransaction } from '@/lib/admin/transactions'
import { addPnLReport } from '@/lib/admin/pnl'
import { CONTENT } from '@/config/content'
import { PARTNER_TIERS, TRANSACTION_TYPES, TRANSACTION_TYPE_LABELS, TRANSACTION_STATUSES, PAISE_PER_RUPEE, MONTH_NAMES } from '@/config/constants'
import { formatINR } from '@/lib/utils'
import { Modal } from '@/components/admin/Modal'
import { ConfirmModal } from '@/components/admin/ConfirmModal'
import { DataTable, type Column } from '@/components/admin/DataTable'
import { FormField, inputStyle, selectStyle, textareaStyle } from '@/components/admin/FormField'
import { AdminMetricCard } from '@/components/admin/AdminMetricCard'
import { StatusPill } from '@/components/shared/StatusPill'
import { OverviewTab } from './tabs/OverviewTab'
import { TransactionsTab } from './tabs/TransactionsTab'
import { PnLReportsTab } from './tabs/PnLReportsTab'
import { DocumentsTab } from './tabs/DocumentsTab'
import { NotesTab } from './tabs/NotesTab'
import type { Partner, Transaction, PnLReport, PnLMonthly } from '@/types/database'

const C = CONTENT.admin.partnerDetail

const TABS = [C.tabs.overview, C.tabs.transactions, C.tabs.pnlReports, C.tabs.documents, C.tabs.notes] as const
type Tab = typeof TABS[number]

interface Props {
  partner:      Partner
  transactions: Transaction[]
  pnlReports:   PnLReport[]
  monthlyPnL:   PnLMonthly[]
}

export function PartnerDetailClient({ partner: initPartner, transactions: initTx, pnlReports: initReports, monthlyPnL }: Props) {
  const [partner, setPartner]       = useState(initPartner)
  const [transactions, setTx]       = useState(initTx)
  const [pnlReports, setReports]    = useState(initReports)
  const [tab, setTab]               = useState<Tab>(C.tabs.overview)

  const [editOpen, setEditOpen]     = useState(false)
  const [editForm, setEditForm]     = useState<PartnerInput>({
    full_name: partner.full_name, email: partner.email,
    phone: partner.phone ?? '', tier: partner.tier,
    entry_date: partner.entry_date, status: partner.status, notes: partner.notes ?? '',
  })
  const [editSaving, setEditSaving] = useState(false)

  const [txOpen, setTxOpen]         = useState(false)
  const [txEdit, setTxEdit]         = useState<Transaction | null>(null)
  const [txDel, setTxDel]           = useState<Transaction | null>(null)
  const [txForm, setTxForm]         = useState({ date: new Date().toISOString().split('T')[0], type: 'investment' as Transaction['type'], amount: '', status: 'pending' as Transaction['status'], notes: '' })
  const [txSaving, setTxSaving]     = useState(false)

  const [rptOpen, setRptOpen]       = useState(false)
  const [rptForm, setRptForm]       = useState({ quarter: '1', year: String(new Date().getFullYear()), gross_profit: '', realized_pnl: '', unrealized_pnl: '', distribution_amount: '', win_rate: '', notes: '' })
  const [rptSaving, setRptSaving]   = useState(false)

  const [noteText, setNoteText]     = useState('')

  const barData    = monthlyPnL.map(m => ({ month: MONTH_NAMES[(m.month ?? 1) - 1], profit: m.profit }))
  const latestPnL  = pnlReports[0]
  const totalDist  = pnlReports.reduce((s, r) => s + r.distribution_amount, 0)

  async function saveEditPartner() {
    setEditSaving(true)
    const supabase = createClient()
    const res = await updatePartner(supabase, partner.id, editForm)
    if (res.data) setPartner(res.data)
    setEditSaving(false); setEditOpen(false)
  }

  function openTxAdd() {
    setTxEdit(null)
    setTxForm({ date: new Date().toISOString().split('T')[0], type: 'investment', amount: '', status: 'pending', notes: '' })
    setTxOpen(true)
  }

  function openTxEdit(tx: Transaction) {
    setTxEdit(tx)
    setTxForm({ date: tx.date, type: tx.type, amount: String(tx.amount / PAISE_PER_RUPEE), status: tx.status, notes: tx.notes ?? '' })
    setTxOpen(true)
  }

  async function saveTx() {
    setTxSaving(true)
    const supabase = createClient()
    const amountPaise = Math.round(parseFloat(txForm.amount) * PAISE_PER_RUPEE)
    if (txEdit) {
      const res = await updateTransaction(supabase, txEdit.id, { ...txForm, amount: amountPaise })
      if (res.data) setTx(ts => ts.map(t => t.id === txEdit.id ? res.data : t))
    } else {
      const res = await addTransaction(supabase, { partner_id: partner.id, ...txForm, amount: amountPaise })
      if (res.data) setTx(ts => [res.data, ...ts])
    }
    setTxSaving(false); setTxOpen(false); setTxEdit(null)
  }

  async function deleteTx() {
    if (!txDel) return
    const supabase = createClient()
    await deleteTransaction(supabase, txDel.id)
    setTx(ts => ts.filter(t => t.id !== txDel.id))
    setTxDel(null)
  }

  async function saveReport() {
    setRptSaving(true)
    const supabase = createClient()
    const r = rptForm
    const res = await addPnLReport(supabase, {
      partner_id: partner.id, quarter: parseInt(r.quarter) as 1|2|3|4, year: parseInt(r.year),
      opening_balance: 0, closing_balance: 0,
      gross_profit:        Math.round(parseFloat(r.gross_profit        || '0') * PAISE_PER_RUPEE),
      realized_pnl:        Math.round(parseFloat(r.realized_pnl        || '0') * PAISE_PER_RUPEE),
      unrealized_pnl:      Math.round(parseFloat(r.unrealized_pnl      || '0') * PAISE_PER_RUPEE),
      distribution_amount: Math.round(parseFloat(r.distribution_amount || '0') * PAISE_PER_RUPEE),
      distribution_date: null, distribution_status: 'pending',
      win_rate: parseFloat(r.win_rate || '0'),
      best_month: null, best_month_amount: null, worst_month: null, worst_month_amount: null,
      avg_monthly_pnl: null, positive_months: null, total_months: null, notes: r.notes,
    })
    if (res.data) setReports(rs => [res.data, ...rs])
    setRptSaving(false); setRptOpen(false)
  }

  const txColumns: Column<Transaction>[] = [
    { key: 'date',   label: 'DATE',   sortable: true },
    { key: 'type',   label: 'TYPE',   render: t => <StatusPill status={t.type} /> },
    { key: 'amount', label: 'AMOUNT', render: t => <span className="tabular-nums" style={{ color: t.amount >= 0 ? '#22C55E' : '#EF4444' }}>{t.amount >= 0 ? '+' : ''}{formatINR(t.amount)}</span> },
    { key: 'status', label: 'STATUS', render: t => <StatusPill status={t.status} /> },
    { key: 'notes',  label: 'NOTES',  render: t => <span className="text-[#9A9080] truncate max-w-[200px] block">{t.notes ?? '—'}</span> },
    {
      key: 'actions', label: '',
      render: t => (
        <div className="flex gap-2" onClick={e => e.stopPropagation()}>
          <button onClick={() => openTxEdit(t)} className="p-1.5 text-[#9A9080] hover:text-[#F5A623] cursor-pointer bg-transparent border-none transition-colors"><Pencil size={13} /></button>
          <button onClick={() => setTxDel(t)} className="p-1.5 text-[#9A9080] hover:text-[#EF4444] cursor-pointer bg-transparent border-none transition-colors"><Trash2 size={13} /></button>
        </div>
      ),
    },
  ]

  const rptColumns: Column<PnLReport & { id: string }>[] = [
    { key: 'quarter', label: 'QTR', render: r => `Q${r.quarter}` },
    { key: 'year',    label: 'YEAR' },
    { key: 'gross_profit',        label: 'GROSS P&L',  render: r => <span className="tabular-nums text-[#22C55E]">+{formatINR(r.gross_profit)}</span> },
    { key: 'distribution_amount', label: 'DISTRIBUTED', render: r => <span className="tabular-nums">{formatINR(r.distribution_amount)}</span> },
    { key: 'win_rate',            label: 'WIN RATE',   render: r => `${r.win_rate ?? 0}%` },
    { key: 'distribution_status', label: 'STATUS',     render: r => <StatusPill status={r.distribution_status} /> },
  ]

  return (
    <>
      {/* Profile header */}
      <div className="rounded-[8px] p-6 mb-5"
        style={{ background: '#111111', border: '0.5px solid rgba(245,166,35,0.15)' }}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-[22px] font-serif font-medium flex-shrink-0"
              style={{ background: 'rgba(245,166,35,0.12)', color: '#F5A623', border: '1px solid rgba(245,166,35,0.3)' }}>
              {partner.initials}
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="font-serif text-[28px] text-[#F0EDE6]">{partner.full_name}</h2>
                {partner.username && (
                  <span className="text-[12px] font-sans font-light text-[#F5A623] self-end mb-1">
                    @{partner.username}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <StatusPill status={partner.tier} />
                <StatusPill status={partner.status} />
                <span className="text-[12px] font-sans text-[#9A9080]">Since {partner.entry_date}</span>
              </div>
              <div className="flex items-center gap-3 mt-2">
                {partner.email && (
                  <a href={`mailto:${partner.email}`} className="flex items-center gap-1.5 text-[12px] font-sans text-[#9A9080] hover:text-[#F5A623] transition-colors">
                    <Mail size={13} />{partner.email}
                  </a>
                )}
                {partner.phone && (
                  <>
                    <a href={`tel:${partner.phone}`} className="flex items-center gap-1.5 text-[12px] font-sans text-[#9A9080] hover:text-[#F5A623] transition-colors">
                      <Phone size={13} />{partner.phone}
                    </a>
                    <a href={`https://wa.me/${partner.phone.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[12px] font-sans text-[#9A9080] hover:text-[#22C55E] transition-colors">
                      <MessageSquare size={13} />WhatsApp
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>
          <button onClick={() => setEditOpen(true)}
            className="text-[13px] font-sans px-4 py-2 rounded-[4px] transition-colors cursor-pointer"
            style={{ border: '1px solid rgba(245,166,35,0.4)', color: '#F5A623', background: 'transparent' }}>
            <Pencil size={13} className="inline mr-1.5" />{C.edit}
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
        <AdminMetricCard icon={Briefcase}  label={C.metrics.invested}    value={formatINR(partner.invested_amount)} />
        <AdminMetricCard icon={TrendingUp} label={C.metrics.pnl}         value={latestPnL ? `+${formatINR(latestPnL.gross_profit)}` : '—'} valueColor="#22C55E" />
        <AdminMetricCard icon={Gift}       label={C.metrics.distributed} value={formatINR(totalDist)} />
        <AdminMetricCard icon={Calendar}   label={C.metrics.nextPayout}  value="End of Q" valueColor="#F0EDE6" />
      </div>

      {/* Tabs */}
      <div className="flex gap-0 mb-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-4 py-2.5 text-[13px] font-sans transition-colors cursor-pointer bg-transparent border-none"
            style={{
              color: tab === t ? '#F5A623' : '#9A9080',
              borderBottom: tab === t ? '2px solid #F5A623' : '2px solid transparent',
              marginBottom: -1,
            }}>
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === C.tabs.overview     && <OverviewTab barData={barData} transactions={transactions} txColumns={txColumns} />}
      {tab === C.tabs.transactions && (
        <TransactionsTab
          partner={partner}
          transactions={transactions}
          onAdd={openTxAdd}
          onEdit={openTxEdit}
          onDelete={t => setTxDel(t)}
          onTxUpdated={t => setTx(ts => ts.map(x => x.id === t.id ? t : x))}
        />
      )}
      {tab === C.tabs.pnlReports   && <PnLReportsTab pnlReports={pnlReports as (PnLReport & { id: string })[]} rptColumns={rptColumns} onAdd={() => setRptOpen(true)} />}
      {tab === C.tabs.documents    && <DocumentsTab partnerId={partner.id} />}
      {tab === C.tabs.notes        && <NotesTab noteText={noteText} setNoteText={setNoteText} partnerNotes={partner.notes} />}

      {/* Edit Partner Modal */}
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title={C.edit} size="sm" compact>
        <div className="flex flex-col gap-3">
          <FormField label="Full Name">
            <input type="text" style={inputStyle} value={editForm.full_name}
              onChange={e => setEditForm(ef => ({ ...ef, full_name: e.target.value }))} />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Email">
              <input type="email" style={inputStyle} value={editForm.email ?? ''}
                onChange={e => setEditForm(ef => ({ ...ef, email: e.target.value }))} />
            </FormField>
            <FormField label="Phone">
              <input type="text" style={inputStyle} value={editForm.phone ?? ''}
                onChange={e => setEditForm(ef => ({ ...ef, phone: e.target.value }))} />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Tier">
              <select style={selectStyle} value={editForm.tier}
                onChange={e => setEditForm(ef => ({ ...ef, tier: e.target.value as Partner['tier'] }))}>
                {(Object.keys(PARTNER_TIERS) as Array<keyof typeof PARTNER_TIERS>).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </FormField>
            <FormField label="Status">
              <select style={selectStyle} value={editForm.status ?? 'active'}
                onChange={e => setEditForm(ef => ({ ...ef, status: e.target.value as Partner['status'] }))}>
                {['active','paused','exited'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </FormField>
          </div>
          <FormField label="Entry Date">
            <input type="date" style={inputStyle} value={editForm.entry_date}
              onChange={e => setEditForm(ef => ({ ...ef, entry_date: e.target.value }))} />
          </FormField>
          <FormField label="Notes">
            <textarea style={{ ...textareaStyle, minHeight: 64 }}
              value={editForm.notes ?? ''}
              onChange={e => setEditForm(ef => ({ ...ef, notes: e.target.value }))} />
          </FormField>
          <button onClick={saveEditPartner} disabled={editSaving}
            className="w-full py-3 rounded-[4px] text-[14px] font-sans cursor-pointer border-none mt-1 disabled:opacity-60"
            style={{ background: '#F5A623', color: '#080808' }}>
            {editSaving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </Modal>

      {/* Transaction Modal */}
      <Modal isOpen={txOpen} onClose={() => { setTxOpen(false); setTxEdit(null) }} title={txEdit ? 'Edit Transaction' : 'Add Transaction'} size="sm" compact>
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Date">
              <input type="date" style={inputStyle} value={txForm.date} onChange={e => setTxForm(f => ({ ...f, date: e.target.value }))} />
            </FormField>
            <FormField label="Type">
              <select style={selectStyle} value={txForm.type} onChange={e => setTxForm(f => ({ ...f, type: e.target.value as Transaction['type'] }))}>
                {Object.values(TRANSACTION_TYPES).map(t => <option key={t} value={t}>{TRANSACTION_TYPE_LABELS[t]}</option>)}
              </select>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Amount (₹)">
              <input type="number" style={inputStyle} value={txForm.amount} onChange={e => setTxForm(f => ({ ...f, amount: e.target.value }))} placeholder="In rupees" />
            </FormField>
            <FormField label="Status">
              <select style={selectStyle} value={txForm.status} onChange={e => setTxForm(f => ({ ...f, status: e.target.value as Transaction['status'] }))}>
                {TRANSACTION_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </FormField>
          </div>
          <FormField label="Notes">
            <textarea style={{ ...textareaStyle, minHeight: 56 }} value={txForm.notes} onChange={e => setTxForm(f => ({ ...f, notes: e.target.value }))} />
          </FormField>
          <button onClick={saveTx} disabled={txSaving}
            className="w-full py-3 rounded-[4px] text-[14px] font-sans cursor-pointer border-none mt-1 disabled:opacity-60"
            style={{ background: '#F5A623', color: '#080808' }}>
            {txSaving ? 'Saving…' : 'Save Transaction'}
          </button>
        </div>
      </Modal>

      {/* PnL Report Modal */}
      <Modal isOpen={rptOpen} onClose={() => setRptOpen(false)} title="Add P&L Report" size="md">
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Quarter">
              <select style={selectStyle} value={rptForm.quarter} onChange={e => setRptForm(f => ({ ...f, quarter: e.target.value }))}>
                {['1','2','3','4'].map(q => <option key={q} value={q}>Q{q}</option>)}
              </select>
            </FormField>
            <FormField label="Year">
              <input type="number" style={inputStyle} value={rptForm.year} onChange={e => setRptForm(f => ({ ...f, year: e.target.value }))} />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Gross Profit (₹)">
              <input type="number" style={inputStyle} value={rptForm.gross_profit} onChange={e => setRptForm(r => ({ ...r, gross_profit: e.target.value }))} />
            </FormField>
            <FormField label="Realized P&L (₹)">
              <input type="number" style={inputStyle} value={rptForm.realized_pnl} onChange={e => setRptForm(r => ({ ...r, realized_pnl: e.target.value }))} />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Unrealized P&L (₹)">
              <input type="number" style={inputStyle} value={rptForm.unrealized_pnl} onChange={e => setRptForm(r => ({ ...r, unrealized_pnl: e.target.value }))} />
            </FormField>
            <FormField label="Win Rate (%)">
              <input type="number" style={inputStyle} value={rptForm.win_rate} onChange={e => setRptForm(r => ({ ...r, win_rate: e.target.value }))} />
            </FormField>
          </div>
          <FormField label="Distribution Amount (₹)">
            <input type="number" style={inputStyle} value={rptForm.distribution_amount} onChange={e => setRptForm(r => ({ ...r, distribution_amount: e.target.value }))} />
          </FormField>
          <FormField label="Notes">
            <textarea style={{ ...textareaStyle, minHeight: 56 }} value={rptForm.notes} onChange={e => setRptForm(f => ({ ...f, notes: e.target.value }))} />
          </FormField>
          <button onClick={saveReport} disabled={rptSaving}
            className="w-full py-3 rounded-[4px] text-[14px] font-sans cursor-pointer border-none mt-1 disabled:opacity-60"
            style={{ background: '#F5A623', color: '#080808' }}>
            {rptSaving ? 'Saving…' : 'Save Report'}
          </button>
        </div>
      </Modal>

      {/* Delete tx confirm */}
      <ConfirmModal
        isOpen={!!txDel}
        onClose={() => setTxDel(null)}
        onConfirm={deleteTx}
        title="Delete Transaction"
        description="This will permanently remove this transaction."
        confirmLabel="Delete"
      />
    </>
  )
}
