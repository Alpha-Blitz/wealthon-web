'use client'

import { useState } from 'react'
import { Modal } from './Modal'
import { FormField, inputStyle, selectStyle } from './FormField'
import { createClient } from '@/lib/supabase/client'
import { setRate } from '@/lib/admin/rates'
import { getCurrentQuarter } from '@/config/constants'
import type { QuarterlyRate } from '@/types/database'

interface Props {
  isOpen:   boolean
  onClose:  () => void
  onSaved:  (rate: QuarterlyRate) => void
  initial?: QuarterlyRate | null
}

export function RateModal({ isOpen, onClose, onSaved, initial }: Props) {
  const now = new Date()
  const [quarter, setQuarter] = useState<number>(initial?.quarter ?? getCurrentQuarter())
  const [year, setYear]       = useState<number>(initial?.year ?? now.getFullYear())
  const [monthlyPct, setMonthlyPct] = useState<string>(
    initial ? (initial.monthly_rate * 100).toString() : '2.5',
  )
  const [notes, setNotes]     = useState<string>(initial?.notes ?? '')
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState<string | null>(null)

  async function handleSave() {
    setSaving(true); setError(null)
    const monthlyRate = Number(monthlyPct) / 100
    if (!isFinite(monthlyRate) || monthlyRate <= 0 || monthlyRate > 0.2) {
      setError('Monthly rate must be between 0% and 20%')
      setSaving(false)
      return
    }
    const supabase = createClient()
    const res = await setRate(supabase, quarter, year, monthlyRate, notes || null)
    setSaving(false)
    if (res.data) {
      onSaved(res.data)
      onClose()
    } else if (res.error) {
      setError(res.error)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Set Rate for Q${quarter} ${year}`} size="sm" compact>
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Quarter">
            <select style={selectStyle} value={quarter} onChange={e => setQuarter(Number(e.target.value))}>
              {[1, 2, 3, 4].map(q => <option key={q} value={q}>Q{q}</option>)}
            </select>
          </FormField>
          <FormField label="Year">
            <input
              type="number"
              min={2024}
              max={2100}
              style={inputStyle}
              value={year}
              onChange={e => setYear(Number(e.target.value))}
            />
          </FormField>
        </div>

        <FormField label="Monthly Rate (%)">
          <input
            type="number"
            step="0.01"
            min="0"
            max="20"
            style={inputStyle}
            value={monthlyPct}
            onChange={e => setMonthlyPct(e.target.value)}
            placeholder="e.g. 2.5"
          />
        </FormField>

        <p className="text-[11px] font-sans text-[#7F7566] -mt-1">
          Annual equivalent: {(Number(monthlyPct || 0) * 12).toFixed(1)}% per year
        </p>

        <FormField label="Notes (optional)">
          <input
            type="text"
            style={inputStyle}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="e.g. Strong quarter"
          />
        </FormField>

        {error && <p className="text-[12px] text-[#EF4444] font-sans">{error}</p>}

        <div className="flex justify-end gap-2 mt-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[13px] font-sans rounded-[4px] cursor-pointer bg-transparent"
            style={{ border: '1px solid rgba(255,255,255,0.1)', color: '#9A9080' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-[13px] font-sans rounded-[4px] cursor-pointer border-none disabled:opacity-50"
            style={{ background: '#F5A623', color: '#080808' }}
          >
            {saving ? 'Saving…' : 'Save Rate'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
