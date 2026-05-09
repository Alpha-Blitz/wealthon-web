'use client'

import { Mail, Phone } from 'lucide-react'
import type { Lead } from '@/types/database'

interface KanbanCardProps {
  lead:    Lead
  onClick: (lead: Lead) => void
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

export function KanbanCard({ lead, onClick }: KanbanCardProps) {
  const days   = daysAgo(lead.updated_at ?? lead.created_at)
  const src    = lead.source ?? 'other'
  const srcClr = SOURCE_COLORS[src] ?? SOURCE_COLORS.other
  const ageClr = days > 14 ? '#EF4444' : days > 7 ? '#F59E0B' : '#68625A'

  return (
    <div
      onClick={() => onClick(lead)}
      className="rounded-[8px] p-3 cursor-pointer select-none"
      style={{
        background:   '#161616',
        border:       '0.5px solid rgba(255,255,255,0.07)',
        transition:   'border-color 0.15s, transform 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.borderColor = 'rgba(245,166,35,0.35)'
        el.style.transform   = 'translateY(-1px)'
        el.style.boxShadow   = '0 4px 16px rgba(0,0,0,0.3)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.borderColor = 'rgba(255,255,255,0.07)'
        el.style.transform   = 'translateY(0)'
        el.style.boxShadow   = 'none'
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
