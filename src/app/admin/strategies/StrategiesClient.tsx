'use client'

import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { createStrategy, updateStrategy, deleteStrategy, type StrategyInput } from '@/lib/admin/strategies'
import { STRATEGY_MARKETS, RISK_LEVELS } from '@/config/constants'
import { SlideOver } from '@/components/admin/SlideOver'
import { ConfirmModal } from '@/components/admin/ConfirmModal'
import { DataTable, type Column } from '@/components/admin/DataTable'
import { FormField, inputStyle, selectStyle } from '@/components/admin/FormField'
import { StatusPill } from '@/components/shared/StatusPill'
import { CONTENT } from '@/config/content'
import type { Strategy } from '@/types/database'

const C = CONTENT.admin.strategies

const EMPTY_FORM: StrategyInput = {
  name: '', market: null, description: null, risk_level: 'medium',
  status: 'active', allocation_pct: null, win_rate: null, monthly_return: null, notes: null,
}

interface Props { initialStrategies: Strategy[] }

export function StrategiesClient({ initialStrategies }: Props) {
  const [strategies, setStrategies] = useState(initialStrategies)
  const [slideOpen, setSlideOpen]   = useState(false)
  const [editItem, setEditItem]     = useState<Strategy | null>(null)
  const [delItem, setDelItem]       = useState<Strategy | null>(null)
  const [form, setForm]             = useState<StrategyInput>(EMPTY_FORM)
  const [saving, setSaving]         = useState(false)
  const [deleting, setDeleting]     = useState(false)
  const [error, setError]           = useState<string | null>(null)

  function openAdd() {
    setEditItem(null); setForm(EMPTY_FORM); setError(null); setSlideOpen(true)
  }

  function openEdit(s: Strategy) {
    setEditItem(s)
    setForm({
      name: s.name, market: s.market, description: s.description,
      risk_level: s.risk_level, status: s.status, allocation_pct: s.allocation_pct,
      win_rate: s.win_rate, monthly_return: s.monthly_return, notes: s.notes,
    })
    setError(null); setSlideOpen(true)
  }

  async function handleSave() {
    if (!form.name) { setError('Name is required.'); return }
    setSaving(true); setError(null)
    const supabase = createClient()
    if (editItem) {
      const res = await updateStrategy(supabase, editItem.id, form)
      if (res.error) { setError(res.error); setSaving(false); return }
      setStrategies(ss => ss.map(s => s.id === editItem.id ? res.data! : s))
    } else {
      const res = await createStrategy(supabase, form)
      if (res.error) { setError(res.error); setSaving(false); return }
      setStrategies(ss => [res.data!, ...ss])
    }
    setSaving(false); setSlideOpen(false)
  }

  async function handleDelete() {
    if (!delItem) return
    setDeleting(true)
    const supabase = createClient()
    const res = await deleteStrategy(supabase, delItem.id)
    if (!res.error) setStrategies(ss => ss.filter(s => s.id !== delItem.id))
    setDeleting(false); setDelItem(null)
  }

  const columns: Column<Strategy>[] = [
    { key: 'name', label: C.columns.name,
      render: s => <span className="text-[13px] font-sans text-[#F0EDE6]">{s.name}</span> },
    { key: 'market', label: C.columns.market,
      render: s => <span className="text-[12px] font-sans text-[#9A9080]">{s.market ?? '—'}</span> },
    { key: 'monthly_return', label: C.columns.return, sortable: true,
      render: s => s.monthly_return != null
        ? <span className="tabular-nums text-[13px] font-sans" style={{ color: '#22C55E' }}>{s.monthly_return.toFixed(1)}%</span>
        : <span className="text-[#68625A]">—</span> },
    { key: 'win_rate', label: C.columns.winRate, sortable: true,
      render: s => s.win_rate != null
        ? <span className="tabular-nums text-[13px] font-sans text-[#F0EDE6]">{s.win_rate.toFixed(1)}%</span>
        : <span className="text-[#68625A]">—</span> },
    { key: 'risk_level', label: C.columns.risk,
      render: s => s.risk_level ? <StatusPill status={s.risk_level} /> : <span className="text-[#68625A]">—</span> },
    { key: 'status', label: C.columns.status,
      render: s => <StatusPill status={s.status ?? 'inactive'} /> },
    {
      key: 'actions' as keyof Strategy, label: C.columns.actions,
      render: s => (
        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
          <button onClick={() => openEdit(s)}
            className="p-1.5 text-[#9A9080] hover:text-[#F5A623] transition-colors cursor-pointer bg-transparent border-none">
            <Pencil size={14} />
          </button>
          <button onClick={() => setDelItem(s)}
            className="p-1.5 text-[#9A9080] hover:text-[#EF4444] transition-colors cursor-pointer bg-transparent border-none">
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <>
      <div className="flex justify-end mb-5">
        <button onClick={openAdd}
          className="text-[14px] font-sans px-4 py-2.5 rounded-[4px] cursor-pointer border-none"
          style={{ background: '#F5A623', color: '#080808' }}>
          {C.addButton}
        </button>
      </div>

      <DataTable columns={columns} data={strategies} />

      <SlideOver isOpen={slideOpen} onClose={() => setSlideOpen(false)}
        title={editItem ? C.form.editTitle : C.form.title}>
        <div className="flex flex-col gap-4">
          <FormField label={C.form.name} required>
            <input style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </FormField>
          <FormField label={C.form.market}>
            <select style={selectStyle} value={form.market ?? ''} onChange={e => setForm(f => ({ ...f, market: e.target.value || null }))}>
              <option value="">—</option>
              {STRATEGY_MARKETS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </FormField>
          <FormField label={C.form.status}>
            <select style={selectStyle} value={form.status ?? 'active'} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </FormField>
          <FormField label={C.form.monthlyRet}>
            <input type="number" step="0.1" style={inputStyle} value={form.monthly_return ?? ''} onChange={e => setForm(f => ({ ...f, monthly_return: e.target.value ? Number(e.target.value) : null }))} placeholder="0.0" />
          </FormField>
          <FormField label={C.form.winRate}>
            <input type="number" step="0.1" style={inputStyle} value={form.win_rate ?? ''} onChange={e => setForm(f => ({ ...f, win_rate: e.target.value ? Number(e.target.value) : null }))} placeholder="0.0" />
          </FormField>
          <FormField label={C.form.riskLevel}>
            <select style={selectStyle} value={form.risk_level ?? 'medium'} onChange={e => setForm(f => ({ ...f, risk_level: e.target.value as Strategy['risk_level'] }))}>
              {RISK_LEVELS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </FormField>
          <FormField label={C.form.notes}>
            <textarea style={{ ...inputStyle, minHeight: 72, resize: 'vertical' }} value={form.notes ?? ''}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value || null }))} />
          </FormField>
          {error && <p className="text-[12px] font-sans" style={{ color: '#EF4444' }}>{error}</p>}
          <button onClick={handleSave} disabled={saving}
            className="w-full py-3 rounded-[4px] text-[14px] font-sans cursor-pointer border-none disabled:opacity-60"
            style={{ background: '#F5A623', color: '#080808' }}>
            {saving ? 'Saving…' : C.form.save}
          </button>
        </div>
      </SlideOver>

      <ConfirmModal isOpen={!!delItem} onClose={() => setDelItem(null)} onConfirm={handleDelete}
        title="Delete Strategy" description="This will permanently delete this strategy."
        confirmLabel="Delete" loading={deleting} />
    </>
  )
}
