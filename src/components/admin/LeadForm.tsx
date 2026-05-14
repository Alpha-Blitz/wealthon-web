'use client'

import { StatusPill } from '@/components/shared/StatusPill'
import { FormField, inputStyle, selectStyle, textareaStyle } from '@/components/admin/FormField'
import { ROUTES } from '@/config/routes'
import { CONTENT } from '@/config/content'
import type { Lead } from '@/types/database'
import type { LeadInput } from '@/lib/admin/leads'

const C = CONTENT.admin.pipeline

const SOURCES = ['referral', 'organic', 'social', 'event', 'other'] as const

interface Props {
  lead:      Lead
  form:      LeadInput
  saving:    boolean
  error?:    string | null
  onChange:  (f: LeadInput) => void
  onSave:    () => void
  onDelete:  () => void
}

export function LeadForm({ lead, form, saving, error, onChange, onSave, onDelete }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 flex-wrap mb-1">
        <StatusPill status={lead.stage} />
        <span className="text-[11px] font-sans text-[#9A9080]">
          Added {new Date(lead.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
      </div>

      <FormField label="Name" required>
        <input style={inputStyle} value={form.name} onChange={e => onChange({ ...form, name: e.target.value })} />
      </FormField>
      <FormField label="Email">
        <input type="email" style={inputStyle} value={form.email ?? ''} onChange={e => onChange({ ...form, email: e.target.value })} />
      </FormField>
      <FormField label="Phone">
        <input style={inputStyle} value={form.phone ?? ''} onChange={e => onChange({ ...form, phone: e.target.value })} />
      </FormField>
      <FormField label="Source">
        <select style={selectStyle} value={form.source ?? 'organic'} onChange={e => onChange({ ...form, source: e.target.value as Lead['source'] })}>
          {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </FormField>
      <FormField label="Stage">
        <select style={selectStyle} value={form.stage ?? 'new'} onChange={e => onChange({ ...form, stage: e.target.value as Lead['stage'] })}>
          {(['new','contacted','qualified','proposal','converted','lost'] as Lead['stage'][]).map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </FormField>
      <FormField label="Notes">
        <textarea style={{ ...textareaStyle, minHeight: 80 }}
          value={form.notes ?? ''} onChange={e => onChange({ ...form, notes: e.target.value })} />
      </FormField>

      {error && <p className="text-[12px] font-sans" style={{ color: '#EF4444' }}>{error}</p>}

      <div className="flex gap-3 mt-2">
        <button onClick={onSave} disabled={saving}
          className="flex-1 py-3 rounded-[4px] text-[14px] font-sans cursor-pointer border-none disabled:opacity-60"
          style={{ background: '#F5A623', color: '#080808' }}>
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button onClick={onDelete}
          className="px-4 py-3 rounded-[4px] text-[14px] font-sans cursor-pointer border-none"
          style={{ background: 'rgba(239,68,68,0.12)', color: '#EF4444' }}>
          Delete
        </button>
      </div>

      <a href={ROUTES.ADMIN.PARTNER_NEW_FROM_LEAD(lead.id)}
        className="text-center text-[13px] font-sans text-gold hover:text-gold-secondary transition-colors">
        {C.convert}
      </a>
    </div>
  )
}
