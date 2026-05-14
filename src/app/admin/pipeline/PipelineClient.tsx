'use client'

import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { addLead, updateLead, updateLeadStage, deleteLead, type LeadInput } from '@/lib/admin/leads'
import { PIPELINE_STAGES, LEAD_STAGE_TO_DB, type PipelineStage } from '@/config/constants'
import { CONTENT } from '@/config/content'
import { KanbanBoard } from '@/components/admin/KanbanBoard'
import { Modal } from '@/components/admin/Modal'
import { AddLeadModal } from '@/components/admin/AddLeadModal'
import { ConfirmModal } from '@/components/admin/ConfirmModal'
import { FunnelStrip } from '@/components/admin/FunnelStrip'
import { LeadForm } from '@/components/admin/LeadForm'
import type { Lead, Partner } from '@/types/database'

const C = CONTENT.admin.pipeline

const DB_STAGES: Lead['stage'][] = ['new', 'contacted', 'qualified', 'proposal', 'converted']

const EMPTY_FORM: LeadInput = { name: '', email: '', phone: '', source: 'organic', stage: 'new', notes: '' }

interface Props { initialLeads: Lead[]; partners: Partner[] }

export function PipelineClient({ initialLeads, partners: _ }: Props) {
  const [leads, setLeads]           = useState(initialLeads)
  const [search, setSearch]         = useState('')

  const [addOpen, setAddOpen]       = useState(false)
  const [addStage, setAddStage]     = useState<PipelineStage>('new')

  const [slideOpen, setSlideOpen]   = useState(false)
  const [selectedLead, setSelected] = useState<Lead | null>(null)
  const [delLead, setDelLead]       = useState<Lead | null>(null)

  const [form, setForm]             = useState<LeadInput>(EMPTY_FORM)
  const [saving, setSaving]         = useState(false)
  const [error, setError]           = useState<string | null>(null)

  const stageCounts = DB_STAGES.map(s => leads.filter(l => l.stage === s).length)

  const filteredLeads = useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return leads
    return leads.filter(l =>
      l.name.toLowerCase().includes(q) ||
      (l.email ?? '').toLowerCase().includes(q) ||
      (l.phone ?? '').toLowerCase().includes(q)
    )
  }, [leads, search])

  function openAdd(stage: PipelineStage) {
    setAddStage(stage)
    setForm({ ...EMPTY_FORM, stage: LEAD_STAGE_TO_DB[stage] })
    setError(null)
    setAddOpen(true)
  }

  function openCard(lead: Lead) {
    setSelected(lead)
    setForm({ name: lead.name, email: lead.email ?? '', phone: lead.phone ?? '', source: lead.source ?? 'organic', stage: lead.stage, notes: lead.notes ?? '' })
    setError(null)
    setSlideOpen(true)
  }

  async function handleAdd() {
    if (!form.name.trim()) { setError('Name is required.'); return }
    setSaving(true); setError(null)
    const supabase = createClient()
    const res = await addLead(supabase, form)
    setSaving(false)
    if (res.error) { setError(res.error); return }
    setLeads(ls => [res.data!, ...ls])
    setAddOpen(false)
  }

  async function handleUpdate() {
    if (!selectedLead) return
    if (!form.name.trim()) { setError('Name is required.'); return }
    setSaving(true); setError(null)
    const supabase = createClient()
    const res = await updateLead(supabase, selectedLead.id, form)
    setSaving(false)
    if (res.error) { setError(res.error); return }
    setLeads(ls => ls.map(l => l.id === selectedLead.id ? res.data! : l))
    setSlideOpen(false)
  }

  async function handleStageChange(leadId: string, stage: PipelineStage) {
    const dbStage = LEAD_STAGE_TO_DB[stage]
    const supabase = createClient()
    const res = await updateLeadStage(supabase, leadId, dbStage)
    if (res.data) setLeads(ls => ls.map(l => l.id === leadId ? res.data! : l))
  }

  async function handleDelete() {
    if (!delLead) return
    const supabase = createClient()
    const res = await deleteLead(supabase, delLead.id)
    if (res.error) { setDelLead(null); return }
    setLeads(ls => ls.filter(l => l.id !== delLead.id))
    setDelLead(null); setSlideOpen(false); setSelected(null)
  }

  return (
    <>
      <FunnelStrip stageCounts={stageCounts} totalLeads={leads.length} />

      <div className="mb-4 flex items-center gap-3">
        <div className="relative flex-1 max-w-[280px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9A9080]" />
          <input
            type="text"
            placeholder="Search leads…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full text-[13px] font-sans text-[#F0EDE6] pl-8 pr-3 py-2 rounded-[6px] outline-none"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          />
        </div>
        <span className="text-[12px] font-sans text-[#9A9080]">{filteredLeads.length} lead{filteredLeads.length !== 1 ? 's' : ''}</span>
      </div>

      <KanbanBoard
        leads={filteredLeads}
        onCardClick={openCard}
        onAddLead={openAdd}
        onStageChange={handleStageChange}
      />

      <AddLeadModal
        isOpen={addOpen}
        stage={addStage}
        form={form}
        saving={saving}
        error={error}
        onChange={setForm}
        onSave={handleAdd}
        onClose={() => setAddOpen(false)}
      />

      <Modal isOpen={slideOpen} onClose={() => setSlideOpen(false)} title={selectedLead?.name ?? ''} size="sm">
        {selectedLead && (
          <LeadForm
            lead={selectedLead}
            form={form}
            saving={saving}
            error={error}
            onChange={setForm}
            onSave={handleUpdate}
            onDelete={() => setDelLead(selectedLead)}
          />
        )}
      </Modal>

      <ConfirmModal
        isOpen={!!delLead}
        onClose={() => setDelLead(null)}
        onConfirm={handleDelete}
        title="Delete Lead"
        description="This will permanently remove this lead from the pipeline."
        confirmLabel="Delete"
      />
    </>
  )
}
