'use client'

import { Bell } from 'lucide-react'
import { usePartner } from '@/context/PartnerContext'
import { CONTENT } from '@/config/content'

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return CONTENT.dashboard.greeting.morning
  if (h < 17) return CONTENT.dashboard.greeting.afternoon
  return CONTENT.dashboard.greeting.evening
}

export function Topbar() {
  const partner   = usePartner()
  const firstName = partner.full_name.split(' ')[0]

  return (
    <header
      className="h-[64px] flex items-center justify-between px-6 flex-shrink-0"
      style={{ borderBottom: '1px solid rgba(245,166,35,0.08)' }}
    >
      <div>
        <p className="font-serif text-[22px] font-normal text-[#F0EDE6] leading-tight">
          {getGreeting()}, {firstName}.
        </p>
        <p className="text-[13px] font-sans font-light text-[#8A8070]">
          {CONTENT.dashboard.subtitle}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          className="w-8 h-8 flex items-center justify-center rounded-full transition-colors cursor-pointer bg-transparent border-none"
          style={{ color: '#8A8070' }}
          aria-label="Notifications"
        >
          <Bell size={18} />
        </button>
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-sans font-medium"
          style={{
            background: 'rgba(245,166,35,0.1)',
            border: '1px solid rgba(245,166,35,0.4)',
            color: '#F5A623',
          }}
        >
          {partner.initials}
        </div>
      </div>
    </header>
  )
}
