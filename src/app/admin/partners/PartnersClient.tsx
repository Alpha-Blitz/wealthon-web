'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { createPartner, updatePartner, deletePartner } from '@/lib/admin/partners'
import type { PartnerInput } from '@/lib/admin/partners'
import { ROUTES } from '@/config/routes'
import { CONTENT } from '@/config/content'
import { PARTNER_TIERS } from '@/config/constants'
import { formatINR } from '@/lib/utils'
import { FormModal } from '@/components/admin/FormModal'
import { Modal } from '@/components/admin/Modal'
import { ConfirmModal } from '@/components/admin/ConfirmModal'
import { DataTable, type Column } from '@/components/admin/DataTable'
import { FormField, inputStyle, selectStyle, textareaStyle } from '@/components/admin/FormField'
import { StatusPill } from '@/components/shared/StatusPill'
import type { Partner } from '@/types/database'

const C = CONTENT.admin.partners
const TIERS = Object.keys(PARTNER_TIERS) as Array<keyof typeof PARTNER_TIERS>

interface Props { initialPartners: Partner[] }

function PartnerFormFields({ form, setForm, saving, error, onSave, saveLabel, savingLabel }: {
  form: PartnerInput
  setForm: React.Dispatch<React.SetStateAction<PartnerInput>>
  saving: boolean
  error: string | null
  onSave: () => void
  saveLabel: string
  savingLabel: string
}) {
  return (
    <div className="flex flex-col gap-4">
      <FormField label={C.form.fullName} required>
        <input style={inputStyle} value={form.full_name}
          onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} />
      </FormField>
      <FormField label={C.form.email}>
        <input type="text" style={inputStyle} value={form.email ?? ''}
          onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
      </FormField>
      <FormField label={C.form.phone}>
        <input style={inputStyle} value={form.phone ?? ''}
          onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
      </FormField>
      <FormField label={C.form.tier}>
        <select style={selectStyle} value={form.tier}
          onChange={e => setForm(f => ({ ...f, tier: e.target.value as Partner['tier'] }))}>
          {TIERS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </FormField>
      <FormField label={C.form.investedAmount}>
        <input
          type="number" min="0" step="1" style={inputStyle}
          value={(form.invested_amount ?? 0) / 100 || ''}
          placeholder="0"
          onChange={e => setForm(f => ({ ...f, invested_amount: Math.round(parseFloat(e.target.value || '0') * 100) }))}
        />
      </FormField>
      <FormField label={C.form.entryDate}>
        <input type="date" style={inputStyle} value={form.entry_date}
          onChange={e => setForm(f => ({ ...f, entry_date: e.target.value }))} />
      </FormField>
      <FormField label={C.form.notes}>
        <textarea style={{ ...textareaStyle, minHeight: 80 }}
          value={form.notes ?? ''}
          onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
      </FormField>
      {error && <p className="text-[12px] font-sans" style={{ color: '#EF4444' }}>{error}</p>}
      <button onClick={onSave} disabled={saving}
        className="w-full py-3 rounded-[4px] text-[14px] font-sans transition-colors cursor-pointer border-none mt-2 disabled:opacity-60"
        style={{ background: '#F5A623', color: '#080808' }}>
        {saving ? savingLabel : saveLabel}
      </button>
    </div>
  )
}

const EMPTY_FORM: PartnerInput = {
  full_name: '', email: '', phone: '', tier: 'L1', invested_amount: 0, entry_date: new Date().toISOString().split('T')[0], notes: '',
}

export function PartnersClient({ initialPartners }: Props) {
  const router = useRouter()
  const [partners, setPartners]   = useState(initialPartners)
  const [search, setSearch]       = useState('')
  const [tierFilter, setTier]     = useState('')
  const [statusFilter, setStatus] = useState('')
  const [addModalOpen, setAddModal] = useState(false)
  const [slideOpen, setSlideOpen]   = useState(false)
  const [editPartner, setEdit]      = useState<Partner | null>(null)
  const [delPartner, setDel]      = useState<Partner | null>(null)
  const [form, setForm]           = useState<PartnerInput>(EMPTY_FORM)
  const [saving, setSaving]       = useState(false)
  const [deleting, setDeleting]   = useState(false)
  const [error, setError]         = useState<string | null>(null)

  const filtered = useMemo(() => partners.filter(p => {
    const q = search.toLowerCase()
    const matchSearch = !q || p.full_name.toLowerCase().includes(q) || (p.email ?? '').toLowerCase().includes(q)
    const matchTier   = !tierFilter   || p.tier   === tierFilter
    const matchStatus = !statusFilter || p.status === statusFilter
    return matchSearch && matchTier && matchStatus
  }), [partners, search, tierFilter, statusFilter])

  function openAdd() {
    setEdit(null)
    setForm(EMPTY_FORM)
    setError(null)
    setAddModal(true)
  }

  function openEdit(p: Partner) {
    setEdit(p)
    setForm({
      full_name: p.full_name, email: p.email, phone: p.phone ?? '',
      tier: p.tier, invested_amount: p.invested_amount, entry_date: p.entry_date, status: p.status, notes: p.notes ?? '',
    })
    setError(null)
    setSlideOpen(true)
  }

  async function handleSave() {
    if (!form.full_name) { setError('Name is required.'); return }
    setSaving(true); setError(null)
    const supabase = createClient()
    if (editPartner) {
      const res = await updatePartner(supabase, editPartner.id, form)
      if (res.error) { setError(res.error); setSaving(false); return }
      setPartners(ps => ps.map(p => p.id === editPartner.id ? res.data! : p))
    } else {
      const res = await createPartner(supabase, form)
      if (res.error) { setError(res.error); setSaving(false); return }
      setPartners(ps => [res.data!, ...ps])
    }
    setSaving(false)
    setAddModal(false)
    setSlideOpen(false)
  }

  async function handleDelete() {
    if (!delPartner) return
    setDeleting(true)
    const supabase = createClient()
    const res = await deletePartner(supabase, delPartner.id)
    if (!res.error) setPartners(ps => ps.filter(p => p.id !== delPartner.id))
    setDeleting(false); setDel(null)
  }

  const columns: Column<Partner>[] = [
    {
      key: 'full_name', label: C.columns.partner, sortable: true,
      render: p => (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-sans font-medium flex-shrink-0"
            style={{ background: 'rgba(245,166,35,0.12)', color: '#F5A623' }}>
            {p.initials}
          </div>
          <div>
            <p className="text-[13px] font-sans text-[#F0EDE6]">{p.full_name}</p>
            {p.email && <p className="text-[11px] font-sans text-[#9A9080]">{p.email}</p>}
          </div>
        </div>
      ),
    },
    { key: 'tier',            label: C.columns.tier,      sortable: true, render: p => <StatusPill status={p.tier} /> },
    { key: 'invested_amount', label: C.columns.invested,  sortable: true, render: p => <span className="tabular-nums">{formatINR(p.invested_amount)}</span> },
    { key: 'entry_date',      label: C.columns.entryDate, sortable: true, render: p => <span className="text-[#9A9080]">{p.entry_date}</span> },
    { key: 'status',          label: C.columns.status,    sortable: true, render: p => <StatusPill status={p.status} /> },
    {
      key: 'actions', label: '',
      render: p => (
        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
          <button onClick={() => router.push(ROUTES.ADMIN.PARTNER_DETAIL(p.id))}
            className="p-1.5 text-[#9A9080] hover:text-[#F5A623] transition-colors cursor-pointer bg-transparent border-none">
            <Eye size={14} />
          </button>
          <button onClick={() => openEdit(p)}
            className="p-1.5 text-[#9A9080] hover:text-[#F5A623] transition-colors cursor-pointer bg-transparent border-none">
            <Pencil size={14} />
          </button>
          <button onClick={() => setDel(p)}
            className="p-1.5 text-[#9A9080] hover:text-[#EF4444] transition-colors cursor-pointer bg-transparent border-none">
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <input
          type="text" placeholder={C.searchPlaceholder} value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 text-[14px] font-sans text-[#F0EDE6] px-3 py-2.5 rounded-[6px] outline-none"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        />
        <select value={tierFilter} onChange={e => setTier(e.target.value)}
          className="text-[14px] font-sans text-[#F0EDE6] px-3 py-2.5 rounded-[6px] outline-none cursor-pointer"
          style={{ backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.08)', minWidth: 120 }}>
          <option value="">{C.filterTier}</option>
          {TIERS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatus(e.target.value)}
          className="text-[14px] font-sans text-[#F0EDE6] px-3 py-2.5 rounded-[6px] outline-none cursor-pointer"
          style={{ backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.08)', minWidth: 130 }}>
          <option value="">{C.filterStatus}</option>
          {['active','paused','exited'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button onClick={openAdd}
          className="text-[14px] font-sans px-4 py-2.5 rounded-[4px] transition-colors cursor-pointer border-none whitespace-nowrap"
          style={{ background: '#F5A623', color: '#080808' }}>
          {C.addPartner}
        </button>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        onRowClick={p => router.push(ROUTES.ADMIN.PARTNER_DETAIL(p.id))}
      />

      {/* Add Partner — centered modal */}
      <FormModal
        isOpen={addModalOpen}
        onClose={() => setAddModal(false)}
        title={C.form.title}
      >
        <PartnerFormFields
          form={form} setForm={setForm} saving={saving}
          error={error} onSave={handleSave} saveLabel={C.form.save} savingLabel={C.form.saving}
        />
      </FormModal>

      {/* Edit Partner — centered modal */}
      <Modal
        isOpen={slideOpen}
        onClose={() => setSlideOpen(false)}
        title={C.form.editTitle}
        size="sm"
      >
        <PartnerFormFields
          form={form} setForm={setForm} saving={saving}
          error={error} onSave={handleSave} saveLabel={C.form.save} savingLabel={C.form.saving}
        />
      </Modal>

      {/* Delete confirm */}
      <ConfirmModal
        isOpen={!!delPartner}
        onClose={() => setDel(null)}
        onConfirm={handleDelete}
        title={C.deleteTitle}
        description={C.deleteDesc}
        confirmLabel={C.deleteConfirm}
        loading={deleting}
      />
    </>
  )
}
