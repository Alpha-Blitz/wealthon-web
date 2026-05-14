'use client'

import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { addLead, updateLead, updateLeadStage, deleteLead, type LeadInput, type EnrichedLead } from '@/lib/admin/leads'
import { LEAD_STAGE_TO_DB, type PipelineStage } from '@/config/constants'
import { KanbanBoard } from '@/components/admin/KanbanBoard'
import { Modal } from '@/components/admin/Modal'
import { AddLeadModal } from '@/components/admin/AddLeadModal'
import { ConfirmModal } from '@/components/admin/ConfirmModal'
import { FunnelStrip } from '@/components/admin/FunnelStrip'
import { LeadForm } from '@/components/admin/LeadForm'
import { SendApplyTokenModal } from '@/components/admin/SendApplyTokenModal'
import { ActivatePartnerModal } from '@/components/admin/ActivatePartnerModal'
import type { Lead, Partner } from '@/types/database'

const DB_STAGES: Lead['stage'][] = ['new', 'contacted', 'qualified', 'proposal', 'converted']

const EMPTY_FORM: LeadInput = { name: '', email: '', phone: '', source: 'organic', stage: 'new', notes: '' }

interface Props {
  initialLeads:    EnrichedLead[]
  partners:        Partner[]
  applyExpiryDays: number
  lockInMonths:    number
}

export function PipelineClient({ initialLeads, partners: _, applyExpiryDays, lockInMonths }: Props) {
  const [leads, setLeads]           = useState<EnrichedLead[]>(initialLeads)
  const [search, setSearch]         = useState('')

  const [addOpen, setAddOpen]       = useState(false)
  const [addStage, setAddStage]     = useState<PipelineStage>('new')

  const [slideOpen, setSlideOpen]   = useState(false)
  const [selectedLead, setSelected] = useState<EnrichedLead | null>(null)
  const [delLead, setDelLead]       = useState<EnrichedLead | null>(null)

  const [tokenModalLead, setTokenLead] = useState<EnrichedLead | null>(null)
  const [activateLead, setActivateLead] = useState<EnrichedLead | null>(null)

  const [form, setForm]             = useState<LeadInput>(EMPTY_FORM)
  const [saving, setSaving]         = useState(false)
  const [error, setError]           = useState<string | null>(null)

  void DB_STAGES
  const funnelOrder: EnrichedLead['uiStage'][] = ['new', 'contacted', 'terms_discussed', 'agreement_signed', 'application_submitted', 'active_partner']
  const stageCounts = funnelOrder.map(s => leads.filter(l => l.uiStage === s).length)

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

  function openCard(lead: EnrichedLead) {
    setSelected(lead)
    setForm({ name: lead.name, email: lead.email ?? '', phone: lead.phone ?? '', source: lead.source ?? 'organic', stage: lead.stage, notes: lead.notes ?? '' })
    setError(null)
    setSlideOpen(true)
  }

  function deriveUiStage(stage: Lead['stage'], hasToken: boolean): EnrichedLead['uiStage'] {
    switch (stage) {
      case 'new':       return 'new'
      case 'contacted': return 'contacted'
      case 'qualified': return 'terms_discussed'
      case 'proposal':  return hasToken ? 'application_submitted' : 'agreement_signed'
      case 'converted': return 'active_partner'
      default:          return 'new'
    }
  }

  async function handleAdd() {
    if (!form.name.trim()) { setError('Name is required.'); return }
    setSaving(true); setError(null)
    const supabase = createClient()
    const res = await addLead(supabase, form)
    setSaving(false)
    if (res.error || !res.data) { setError(res.error ?? 'Failed'); return }
    const added: EnrichedLead = {
      ...res.data,
      uiStage: deriveUiStage(res.data.stage, false),
      tokenId: null, tokenUrl: null, tokenUsedAt: null,
      pendingPartnerId: null, intendedCapital: null, monthlyPayout: null,
    }
    setLeads(ls => [added, ...ls])
    setAddOpen(false)
  }

  async function handleUpdate() {
    if (!selectedLead) return
    if (!form.name.trim()) { setError('Name is required.'); return }
    setSaving(true); setError(null)
    const supabase = createClient()
    const res = await updateLead(supabase, selectedLead.id, form)
    setSaving(false)
    if (res.error || !res.data) { setError(res.error ?? 'Failed'); return }
    const updated: EnrichedLead = {
      ...res.data,
      uiStage: deriveUiStage(res.data.stage, !!selectedLead.tokenId),
      tokenId: selectedLead.tokenId,
      tokenUrl: selectedLead.tokenUrl,
      tokenUsedAt: selectedLead.tokenUsedAt,
      pendingPartnerId: selectedLead.pendingPartnerId,
      intendedCapital: selectedLead.intendedCapital,
      monthlyPayout: selectedLead.monthlyPayout,
    }
    setLeads(ls => ls.map(l => l.id === selectedLead.id ? updated : l))
    setSlideOpen(false)
  }

  async function handleStageChange(leadId: string, stage: PipelineStage) {
    // Dragging into 'application_submitted' or 'active_partner' is gated by the
    // dedicated buttons. Reject those drops here.
    if (stage === 'application_submitted' || stage === 'active_partner') return
    const dbStage = LEAD_STAGE_TO_DB[stage]
    const supabase = createClient()
    const res = await updateLeadStage(supabase, leadId, dbStage)
    if (res.data) {
      setLeads(ls => ls.map(l => l.id === leadId ? {
        ...l,
        ...res.data!,
        uiStage: deriveUiStage(res.data!.stage, !!l.tokenId),
      } : l))
    }
  }

  function handleTokenGenerated(lead: EnrichedLead, token: { tokenId: string; url: string; expiresAt: string }) {
    setLeads(ls => ls.map(l => l.id === lead.id
      ? { ...l, tokenId: token.tokenId, tokenUrl: token.url, uiStage: l.uiStage }
      : l))
  }

  function handlePartnerActivated(lead: EnrichedLead, result: { partner: { id: string }; invoiceNumber: string | null; invoiceUrl: string | null; lockInExpiry: string | null }) {
    setLeads(ls => ls.map(l => l.id === lead.id
      ? { ...l, stage: 'converted', uiStage: 'active_partner', tokenUsedAt: l.tokenUsedAt ?? new Date().toISOString() }
      : l))
    void result
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
        onSendOnboarding={lead => setTokenLead(lead)}
        onActivate={lead => setActivateLead(lead)}
      />

      <SendApplyTokenModal
        isOpen={!!tokenModalLead}
        onClose={() => setTokenLead(null)}
        lead={tokenModalLead}
        defaultExpiryDays={applyExpiryDays}
        onGenerated={handleTokenGenerated}
      />

      <ActivatePartnerModal
        isOpen={!!activateLead}
        onClose={() => setActivateLead(null)}
        lead={activateLead}
        lockInMonths={lockInMonths}
        onActivated={handlePartnerActivated}
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
