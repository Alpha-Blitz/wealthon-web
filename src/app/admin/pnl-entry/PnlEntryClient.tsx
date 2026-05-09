'use client'

import { useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { upsertMonthlyPnL } from '@/lib/admin/pnl'
import { DataTable, type Column } from '@/components/admin/DataTable'
import { FormField, inputStyle, selectStyle } from '@/components/admin/FormField'
import { formatINR } from '@/lib/utils'
import { CONTENT } from '@/config/content'
import { MONTH_NAMES } from '@/config/constants'
import type { Partner, PnLMonthly } from '@/types/database'

const C = CONTENT.admin.pnlEntry

const CURRENT_YEAR = new Date().getFullYear()

interface Props {
  partners: Partner[]
  recentEntries: PnLMonthly[]
}

const histColumns: Column<PnLMonthly>[] = [
  { key: 'month', label: 'MONTH', render: r => <span className="text-[13px] font-sans text-[#F0EDE6]">{MONTH_NAMES[r.month - 1]} {r.year}</span> },
  { key: 'profit', label: 'TOTAL', sortable: true, render: r => <span className="tabular-nums text-[13px] font-sans" style={{ color: r.profit >= 0 ? '#22C55E' : '#EF4444' }}>{formatINR(r.profit)}</span> },
  { key: 'forex_profit', label: 'FOREX', render: r => <span className="tabular-nums text-[12px] font-sans text-[#9A9080]">{formatINR(r.forex_profit)}</span> },
  { key: 'commodity_profit', label: 'COMMODITIES', render: r => <span className="tabular-nums text-[12px] font-sans text-[#9A9080]">{formatINR(r.commodity_profit)}</span> },
  { key: 'crypto_profit', label: 'CRYPTO', render: r => <span className="tabular-nums text-[12px] font-sans text-[#9A9080]">{formatINR(r.crypto_profit)}</span> },
]

interface FormState { month: number; year: number; forex: string; commodity: string; crypto: string }

export function PnlEntryClient({ partners, recentEntries }: Props) {
  const [partnerId, setPartnerId] = useState('')
  const [form, setForm] = useState<FormState>({
    month: new Date().getMonth() + 1,
    year: CURRENT_YEAR,
    forex: '', commodity: '', crypto: '',
  })
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState<string | null>(null)
  const [saved,  setSaved]  = useState(false)

  const forex     = Number(form.forex)     || 0
  const commodity = Number(form.commodity) || 0
  const crypto    = Number(form.crypto)    || 0
  const total     = forex + commodity + crypto

  const partnerHistory = useMemo(() =>
    recentEntries.filter(e => !partnerId || e.partner_id === partnerId),
    [recentEntries, partnerId]
  )

  async function handleSave() {
    if (!partnerId) { setError('Select a partner first.'); return }
    setSaving(true); setError(null); setSaved(false)
    const supabase = createClient()
    const res = await upsertMonthlyPnL(supabase, {
      partner_id:       partnerId,
      month:            form.month,
      year:             form.year,
      profit:           total,
      forex_profit:     forex,
      commodity_profit: commodity,
      crypto_profit:    crypto,
    })
    setSaving(false)
    if (res.error) { setError(res.error); return }
    setSaved(true)
    setForm(f => ({ ...f, forex: '', commodity: '', crypto: '' }))
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-[1200px]">
      {/* Entry form */}
      <div className="rounded-[8px] p-6 flex flex-col gap-5"
        style={{ background: '#111111', border: '0.5px solid rgba(245,166,35,0.15)' }}>
        <h3 className="font-serif text-[20px] text-[#F0EDE6]">{C.title}</h3>

        <FormField label="Partner" required>
          <select style={selectStyle} value={partnerId} onChange={e => setPartnerId(e.target.value)}>
            <option value="">{C.selectPartner}</option>
            {partners.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
          </select>
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label={C.month}>
            <select style={selectStyle} value={form.month} onChange={e => setForm(f => ({ ...f, month: Number(e.target.value) }))}>
              {MONTH_NAMES.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
            </select>
          </FormField>
          <FormField label={C.year}>
            <select style={selectStyle} value={form.year} onChange={e => setForm(f => ({ ...f, year: Number(e.target.value) }))}>
              {[CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </FormField>
        </div>

        <FormField label={C.forex}>
          <input type="number" style={inputStyle} value={form.forex} onChange={e => setForm(f => ({ ...f, forex: e.target.value }))} placeholder="0" />
        </FormField>
        <FormField label={C.commodities}>
          <input type="number" style={inputStyle} value={form.commodity} onChange={e => setForm(f => ({ ...f, commodity: e.target.value }))} placeholder="0" />
        </FormField>
        <FormField label={C.crypto}>
          <input type="number" style={inputStyle} value={form.crypto} onChange={e => setForm(f => ({ ...f, crypto: e.target.value }))} placeholder="0" />
        </FormField>

        {/* Preview */}
        <div className="rounded-[6px] p-3 flex items-center justify-between"
          style={{ background: 'rgba(245,166,35,0.06)', border: '1px solid rgba(245,166,35,0.15)' }}>
          <span className="text-[12px] font-sans text-[#9A9080] uppercase tracking-[0.08em]">{C.total}</span>
          <span className={`font-dm-serif text-[20px] ${total >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
            {formatINR(total)}
          </span>
        </div>

        {error  && <p className="text-[12px] font-sans" style={{ color: '#EF4444' }}>{error}</p>}
        {saved  && <p className="text-[12px] font-sans" style={{ color: '#22C55E' }}>Entry saved.</p>}

        <button onClick={handleSave} disabled={saving}
          className="w-full py-3 rounded-[4px] text-[14px] font-sans cursor-pointer border-none disabled:opacity-60"
          style={{ background: '#F5A623', color: '#080808' }}>
          {saving ? C.saving : C.save}
        </button>
      </div>

      {/* History */}
      <div className="rounded-[8px] p-5"
        style={{ background: '#111111', border: '0.5px solid rgba(245,166,35,0.15)' }}>
        <h3 className="font-serif text-[18px] text-[#F0EDE6] mb-4">{C.history}</h3>
        <DataTable columns={histColumns} data={partnerHistory} pageSize={10} />
      </div>
    </div>
  )
}
