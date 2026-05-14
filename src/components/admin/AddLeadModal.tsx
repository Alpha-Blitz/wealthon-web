'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import { FormField, inputStyle, selectStyle, textareaStyle } from '@/components/admin/FormField'
import type { LeadInput } from '@/lib/admin/leads'
import type { Lead } from '@/types/database'
import { PIPELINE_STAGE_LABELS, LEAD_STAGE_TO_DB, type PipelineStage } from '@/config/constants'

const SOURCES = ['referral', 'organic', 'social', 'event', 'other'] as const

interface Props {
  isOpen:   boolean
  stage:    PipelineStage
  form:     LeadInput
  saving:   boolean
  error?:   string | null
  onChange: (form: LeadInput) => void
  onSave:   () => void
  onClose:  () => void
}

export function AddLeadModal({ isOpen, stage, form, saving, error, onChange, onSave, onClose }: Props) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (isOpen) document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-[480px] rounded-[12px] p-6 flex flex-col gap-4"
        style={{ background: '#111111', border: '0.5px solid rgba(245,166,35,0.25)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="text-[11px] font-sans uppercase tracking-[0.1em] text-[#F5A623] mb-0.5">
              {PIPELINE_STAGE_LABELS[stage]}
            </p>
            <h2 className="font-serif text-[22px] text-[#F0EDE6]">Add Lead</h2>
          </div>
          <button onClick={onClose}
            className="p-1.5 text-[#9A9080] hover:text-[#F0EDE6] transition-colors cursor-pointer bg-transparent border-none">
            <X size={18} />
          </button>
        </div>

        <FormField label="Name" required>
          <input
            style={inputStyle}
            value={form.name}
            onChange={e => onChange({ ...form, name: e.target.value })}
            placeholder="Full name"
            autoFocus
          />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Email">
            <input
              type="email" style={inputStyle}
              value={form.email ?? ''}
              onChange={e => onChange({ ...form, email: e.target.value })}
              placeholder="email@example.com"
            />
          </FormField>
          <FormField label="Phone">
            <input
              style={inputStyle}
              value={form.phone ?? ''}
              onChange={e => onChange({ ...form, phone: e.target.value })}
              placeholder="+91 …"
            />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Source">
            <select style={selectStyle} value={form.source ?? 'organic'} onChange={e => onChange({ ...form, source: e.target.value as Lead['source'] })}>
              {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </FormField>
          <FormField label="Stage">
            <select style={selectStyle} value={form.stage ?? 'new'} onChange={e => onChange({ ...form, stage: e.target.value as Lead['stage'] })}>
              {(Object.entries(LEAD_STAGE_TO_DB) as [PipelineStage, Lead['stage']][]).map(([ps, db]) => (
                <option key={db} value={db}>{PIPELINE_STAGE_LABELS[ps]}</option>
              ))}
            </select>
          </FormField>
        </div>

        <FormField label="Notes">
          <textarea
            style={{ ...textareaStyle, minHeight: 72 }}
            value={form.notes ?? ''}
            onChange={e => onChange({ ...form, notes: e.target.value })}
            placeholder="Any context…"
          />
        </FormField>

        {error && <p className="text-[12px] font-sans" style={{ color: '#EF4444' }}>{error}</p>}

        <div className="flex gap-3 mt-1">
          <button onClick={onClose}
            className="px-7 py-2.5 rounded-[4px] text-[13px] font-sans cursor-pointer transition-colors"
            style={{ background: 'transparent', border: '1px solid rgba(245,166,35,0.3)', color: '#F5A623' }}>
            Cancel
          </button>
          <button onClick={onSave} disabled={saving || !form.name.trim()}
            className="flex-1 py-2.5 rounded-[4px] text-[14px] font-sans cursor-pointer border-none disabled:opacity-50"
            style={{ background: '#F5A623', color: '#080808' }}>
            {saving ? 'Adding…' : 'Add Lead'}
          </button>
        </div>
      </div>
    </div>
  )
}
