'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { PIPELINE_STAGES, PIPELINE_STAGE_LABELS, type PipelineStage } from '@/config/constants'
import type { Lead } from '@/types/database'
import { KanbanCard } from './KanbanCard'

interface KanbanBoardProps {
  leads:         Lead[]
  onCardClick:   (lead: Lead) => void
  onAddLead:     (stage: PipelineStage) => void
  onStageChange: (leadId: string, stage: PipelineStage) => void
}

// DB stage → UI stage. DB-level 'proposal' collapses both UI stages
// 'agreement_signed' and 'application_submitted'. The UI distinguishes
// them via a separate flag set when the apply token is generated /
// the private onboarding form is submitted.
const STAGE_MAP: Record<string, PipelineStage> = {
  new:       'new',
  contacted: 'contacted',
  qualified: 'terms_discussed',
  proposal:  'agreement_signed',
  converted: 'active_partner',
}

const REVERSE_STAGE_MAP: Record<PipelineStage, Lead['stage']> = {
  new:                   'new',
  contacted:             'contacted',
  terms_discussed:       'qualified',
  agreement_signed:      'proposal',
  application_submitted: 'proposal',
  active_partner:        'converted',
}

// Color accent per stage
const STAGE_ACCENT: Record<PipelineStage, string> = {
  new:                   'rgba(245,166,35,0.6)',
  contacted:             'rgba(99,102,241,0.6)',
  terms_discussed:       'rgba(6,182,212,0.6)',
  agreement_signed:      'rgba(245,158,11,0.6)',
  application_submitted: 'rgba(245,166,35,1)', // gold border — needs Prathik's action
  active_partner:        'rgba(34,197,94,0.6)',
}

export function KanbanBoard({ leads, onCardClick, onAddLead, onStageChange }: KanbanBoardProps) {
  const [dragOverStage, setDragOverStage] = useState<PipelineStage | null>(null)

  function handleDragOver(e: React.DragEvent, stage: PipelineStage) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverStage(stage)
  }

  function handleDrop(e: React.DragEvent, stage: PipelineStage) {
    e.preventDefault()
    const leadId = e.dataTransfer.getData('text/plain')
    if (leadId) onStageChange(leadId, stage)
    setDragOverStage(null)
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-4" style={{ minHeight: 520 }}>
      {PIPELINE_STAGES.map(stage => {
        const columnLeads = leads.filter(l => STAGE_MAP[l.stage] === stage)
        const isDragOver  = dragOverStage === stage
        const accent      = STAGE_ACCENT[stage]

        return (
          <div
            key={stage}
            className="flex flex-col flex-shrink-0 rounded-[10px] transition-all duration-150"
            style={{
              width: 256,
              background: isDragOver ? 'rgba(245,166,35,0.04)' : '#0C0C0C',
              border: isDragOver
                ? `1px solid ${accent}`
                : '0.5px solid rgba(255,255,255,0.07)',
            }}
            onDragOver={e => handleDragOver(e, stage)}
            onDragLeave={() => setDragOverStage(null)}
            onDrop={e => handleDrop(e, stage)}
          >
            {/* Column header */}
            <div className="px-3.5 pt-3.5 pb-3 flex-shrink-0">
              {/* Accent line */}
              <div className="h-[2px] rounded-full mb-3" style={{ background: accent, width: 28 }} />
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-sans font-medium text-[#F0EDE6]">
                  {PIPELINE_STAGE_LABELS[stage]}
                </span>
                <span
                  className="text-[11px] font-sans min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(245,166,35,0.1)', color: '#F5A623' }}
                >
                  {columnLeads.length}
                </span>
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: '0.5px', background: 'rgba(255,255,255,0.05)', marginBottom: 8 }} />

            {/* Cards */}
            <div className="flex flex-col gap-2 px-2 flex-1 overflow-y-auto" style={{ paddingBottom: 4 }}>
              {columnLeads.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-[11px] font-sans text-[#68625A] text-center py-6">Drop a lead here</p>
                </div>
              ) : (
                columnLeads.map(lead => (
                  <div
                    key={lead.id}
                    draggable
                    onDragStart={e => {
                      e.dataTransfer.setData('text/plain', lead.id)
                      e.dataTransfer.effectAllowed = 'move'
                    }}
                  >
                    <KanbanCard lead={lead} onClick={onCardClick} />
                  </div>
                ))
              )}
            </div>

            {/* Add lead */}
            <button
              onClick={() => onAddLead(stage)}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-[12px] font-sans text-[#9A9080] hover:text-[#F5A623] transition-colors cursor-pointer bg-transparent border-none w-full rounded-b-[10px] flex-shrink-0"
              style={{ borderTop: '0.5px solid rgba(255,255,255,0.05)' }}
            >
              <Plus size={12} />
              Add lead
            </button>
          </div>
        )
      })}
    </div>
  )
}
