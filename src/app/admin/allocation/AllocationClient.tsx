'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getAllocations, saveAllocations } from '@/lib/admin/allocation'
import { STRATEGY_MARKETS } from '@/config/constants'
import { selectStyle, inputStyle } from '@/components/admin/FormField'
import { formatINR } from '@/lib/utils'
import { CONTENT } from '@/config/content'
import type { Partner, Allocation } from '@/types/database'

const C = CONTENT.admin.allocation

interface AllocationRow { asset_class: string; percentage: number; amount: number }

interface Props { partners: Partner[] }

export function AllocationClient({ partners }: Props) {
  const [partnerId, setPartnerId] = useState('')
  const [rows, setRows]           = useState<AllocationRow[]>([])
  const [loading, setLoading]     = useState(false)
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [saved, setSaved]         = useState(false)

  const partner = partners.find(p => p.id === partnerId)
  const investedAmount = partner?.invested_amount ?? 0

  const loadAllocations = useCallback(async (id: string) => {
    setLoading(true)
    const supabase = createClient()
    const res = await getAllocations(supabase, id)
    setLoading(false)
    if (res.data) {
      setRows(res.data.map((a: Allocation) => ({ asset_class: a.asset_class, percentage: a.percentage, amount: a.amount })))
    }
  }, [])

  useEffect(() => {
    if (partnerId) loadAllocations(partnerId)
    else setRows([])
  }, [partnerId, loadAllocations])

  function addRow() {
    setRows(r => [...r, { asset_class: STRATEGY_MARKETS[0], percentage: 0, amount: 0 }])
  }

  function removeRow(i: number) {
    setRows(r => r.filter((_, idx) => idx !== i))
  }

  function updateRow(i: number, field: keyof AllocationRow, value: string | number) {
    setRows(r => r.map((row, idx) => {
      if (idx !== i) return row
      const updated = { ...row, [field]: value }
      if (field === 'percentage') {
        updated.amount = Math.round((Number(value) / 100) * investedAmount)
      } else if (field === 'amount') {
        updated.percentage = investedAmount > 0 ? Number(((Number(value) / investedAmount) * 100).toFixed(1)) : 0
      }
      return updated
    }))
  }

  const totalPct = rows.reduce((s, r) => s + r.percentage, 0)
  const valid    = Math.abs(totalPct - 100) < 0.1

  async function handleSave() {
    if (!partnerId) { setError('Select a partner first.'); return }
    if (!valid) { setError(C.mustSum); return }
    setSaving(true); setError(null); setSaved(false)
    const supabase = createClient()
    const res = await saveAllocations(supabase, partnerId, rows)
    setSaving(false)
    if (res.error) { setError(res.error); return }
    setSaved(true)
  }

  return (
    <div className="max-w-[700px]">
      <div className="rounded-[8px] p-6 flex flex-col gap-5"
        style={{ background: '#111111', border: '0.5px solid rgba(245,166,35,0.15)' }}>
        <h3 className="font-serif text-[20px] text-[#F0EDE6]">{C.title}</h3>

        <div className="form-field flex flex-col gap-1.5">
          <label className="text-[11px] font-sans font-normal uppercase tracking-[0.12em] text-[#F5A623]">Partner</label>
          <select
            value={partnerId}
            onChange={e => setPartnerId(e.target.value)}
            style={selectStyle}>
            <option value="">{C.selectPartner}</option>
            {partners.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
          </select>
        </div>

        {partnerId && (
          <>
            {loading ? (
              <p className="text-[13px] font-sans text-[#9A9080]">Loading…</p>
            ) : (
              <>
                {/* Table header */}
                <div className="grid grid-cols-[1fr_100px_120px_32px] gap-3 text-[11px] font-sans uppercase tracking-[0.08em] text-[#9A9080]">
                  <span>{C.asset}</span>
                  <span>{C.percent}</span>
                  <span>{C.amount}</span>
                  <span />
                </div>

                {/* Rows */}
                {rows.map((row, i) => (
                  <div key={i} className="grid grid-cols-[1fr_100px_120px_32px] gap-3 items-center">
                    <select
                      value={row.asset_class}
                      onChange={e => updateRow(i, 'asset_class', e.target.value)}
                      style={selectStyle}>
                      {STRATEGY_MARKETS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <input
                      type="number" step="0.1" min="0" max="100"
                      value={row.percentage}
                      onChange={e => updateRow(i, 'percentage', Number(e.target.value))}
                      style={{ ...inputStyle, textAlign: 'right' }}
                    />
                    <span className="text-[12px] font-sans text-[#9A9080] tabular-nums">
                      {formatINR(row.amount)}
                    </span>
                    <button onClick={() => removeRow(i)}
                      className="p-1 text-[#68625A] hover:text-[#EF4444] transition-colors cursor-pointer bg-transparent border-none">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}

                {/* Total row */}
                <div className="grid grid-cols-[1fr_100px_120px_32px] gap-3 items-center pt-2"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <span className="text-[12px] font-sans text-[#9A9080] uppercase tracking-[0.08em]">{C.total}</span>
                  <span className="text-[13px] font-sans tabular-nums text-right"
                    style={{ color: valid ? '#22C55E' : '#EF4444' }}>
                    {totalPct.toFixed(1)}%
                  </span>
                  <span className="text-[12px] font-sans tabular-nums text-[#9A9080]">
                    {formatINR(rows.reduce((s, r) => s + r.amount, 0))}
                  </span>
                  <span />
                </div>

                <button onClick={addRow}
                  className="self-start flex items-center gap-2 text-[13px] font-sans cursor-pointer bg-transparent border-none"
                  style={{ color: '#F5A623' }}>
                  <Plus size={14} /> Add row
                </button>
              </>
            )}
          </>
        )}

        {error  && <p className="text-[12px] font-sans" style={{ color: '#EF4444' }}>{error}</p>}
        {saved  && <p className="text-[12px] font-sans" style={{ color: '#22C55E' }}>Allocation saved.</p>}

        <button onClick={handleSave} disabled={saving || !partnerId}
          className="w-full py-3 rounded-[4px] text-[14px] font-sans cursor-pointer border-none disabled:opacity-60"
          style={{ background: '#F5A623', color: '#080808' }}>
          {saving ? 'Saving…' : C.save}
        </button>
      </div>
    </div>
  )
}
