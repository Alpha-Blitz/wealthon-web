'use client'

import { Mail, Phone, Send, CheckCircle2, ExternalLink } from 'lucide-react'
import type { EnrichedLead } from '@/lib/admin/leads'
import { formatINR } from '@/lib/utils'

interface KanbanCardProps {
  lead:             EnrichedLead
  onClick:          (lead: EnrichedLead) => void
  onSendOnboarding?:(lead: EnrichedLead) => void
  onActivate?:      (lead: EnrichedLead) => void
}

const SOURCE_COLORS: Record<string, { bg: string; text: string }> = {
  referral: { bg: 'rgba(245,166,35,0.12)',  text: '#F5A623' },
  organic:  { bg: 'rgba(34,197,94,0.1)',    text: '#22C55E' },
  social:   { bg: 'rgba(99,102,241,0.12)',  text: '#818CF8' },
  event:    { bg: 'rgba(6,182,212,0.1)',    text: '#22D3EE' },
  other:    { bg: 'rgba(255,255,255,0.06)', text: '#9A9080' },
}

function daysAgo(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export function KanbanCard({ lead, onClick, onSendOnboarding, onActivate }: KanbanCardProps) {
  const days   = daysAgo(lead.updated_at ?? lead.created_at)
  const src    = lead.source ?? 'other'
  const srcClr = SOURCE_COLORS[src] ?? SOURCE_COLORS.other
  const ageClr = days > 14 ? '#EF4444' : days > 7 ? '#F59E0B' : '#68625A'

  const showSendOnboarding = lead.uiStage === 'agreement_signed' && !lead.tokenId
  const showActivate       = lead.uiStage === 'application_submitted'
  const isPriority         = lead.uiStage === 'application_submitted'

  return (
    <div
      onClick={() => onClick(lead)}
      className="rounded-[8px] p-3 cursor-pointer select-none"
      style={{
        background:   '#161616',
        border:       isPriority ? '1px solid rgba(245,166,35,0.6)' : '0.5px solid rgba(255,255,255,0.07)',
        transition:   'border-color 0.15s, transform 0.15s, box-shadow 0.15s',
        boxShadow:    isPriority ? '0 0 12px rgba(245,166,35,0.12)' : 'none',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLDivElement
        if (!isPriority) {
          el.style.borderColor = 'rgba(245,166,35,0.35)'
          el.style.boxShadow   = '0 4px 16px rgba(0,0,0,0.3)'
        }
        el.style.transform = 'translateY(-1px)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLDivElement
        if (!isPriority) {
          el.style.borderColor = 'rgba(255,255,255,0.07)'
          el.style.boxShadow   = 'none'
        }
        el.style.transform = 'translateY(0)'
      }}
    >
      {/* Top row: avatar + name + source */}
      <div className="flex items-start gap-2.5 mb-2.5">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-sans font-medium flex-shrink-0 mt-0.5"
          style={{ background: 'rgba(245,166,35,0.1)', color: '#F5A623' }}
        >
          {getInitials(lead.name)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-sans font-medium text-[#F0EDE6] truncate leading-tight">{lead.name}</p>
          {lead.source && (
            <span
              className="inline-block text-[10px] font-sans px-1.5 py-0.5 rounded-[3px] mt-0.5"
              style={{ background: srcClr.bg, color: srcClr.text }}
            >
              {src}
            </span>
          )}
        </div>
      </div>

      {/* Contact info */}
      {lead.email && (
        <div className="flex items-center gap-1.5 mb-1">
          <Mail size={10} className="text-[#68625A] flex-shrink-0" />
          <span className="text-[11px] font-sans text-[#9A9080] truncate">{lead.email}</span>
        </div>
      )}
      {lead.phone && (
        <div className="flex items-center gap-1.5 mb-1">
          <Phone size={10} className="text-[#68625A] flex-shrink-0" />
          <span className="text-[11px] font-sans text-[#9A9080] truncate">{lead.phone}</span>
        </div>
      )}

      {/* Application Submitted extras */}
      {lead.uiStage === 'application_submitted' && (
        <div className="mt-2 pt-2 flex flex-col gap-1.5" style={{ borderTop: '0.5px solid rgba(245,166,35,0.18)' }}>
          <span className="inline-flex items-center gap-1 text-[10px] font-sans px-1.5 py-0.5 rounded-[3px] self-start"
            style={{ background: 'rgba(34,197,94,0.1)', color: '#22C55E' }}>
            <CheckCircle2 size={9} /> Form completed
          </span>
          {lead.intendedCapital && (
            <p className="text-[11px] font-sans text-[#9A9080]">
              Intended: <span className="text-gold">{formatINR(lead.intendedCapital)}</span>
              {lead.monthlyPayout && <> · ~{formatINR(lead.monthlyPayout)}/mo</>}
            </p>
          )}
        </div>
      )}

      {/* Token already sent indicator */}
      {lead.uiStage === 'agreement_signed' && lead.tokenId && lead.tokenUrl && (
        <a
          href={lead.tokenUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          className="mt-2 pt-2 flex items-center gap-1.5 text-[11px] font-sans text-gold hover:text-gold-secondary"
          style={{ borderTop: '0.5px solid rgba(255,255,255,0.05)' }}
        >
          <ExternalLink size={10} /> Onboarding link sent · open
        </a>
      )}

      {/* Action buttons */}
      {(showSendOnboarding || showActivate) && (
        <div className="mt-2 pt-2 flex gap-1.5" style={{ borderTop: '0.5px solid rgba(255,255,255,0.05)' }} onClick={e => e.stopPropagation()}>
          {showSendOnboarding && onSendOnboarding && (
            <button
              onClick={() => onSendOnboarding(lead)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 text-[11px] font-sans py-1.5 rounded-[3px] cursor-pointer border-none"
              style={{ background: 'rgba(245,166,35,0.12)', color: '#F5A623' }}
            >
              <Send size={10} />
              Send Onboarding Form
            </button>
          )}
          {showActivate && onActivate && (
            <button
              onClick={() => onActivate(lead)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 text-[11px] font-sans py-1.5 rounded-[3px] cursor-pointer border-none"
              style={{ background: '#F5A623', color: '#080808' }}
            >
              <CheckCircle2 size={10} />
              Capital Received — Activate
            </button>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-2.5 pt-2" style={{ borderTop: '0.5px solid rgba(255,255,255,0.05)' }}>
        <span className="text-[10px] font-sans text-[#68625A]">
          {new Date(lead.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
        </span>
        <span className="text-[10px] font-sans tabular-nums" style={{ color: ageClr }}>
          {days === 0 ? 'Today' : `${days}d`}
        </span>
      </div>
    </div>
  )
}
