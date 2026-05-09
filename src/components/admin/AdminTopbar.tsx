'use client'

import { usePathname } from 'next/navigation'
import { Bell } from 'lucide-react'
import { ROUTES } from '@/config/routes'
import { CONTENT } from '@/config/content'

const C = CONTENT.admin

const PAGE_TITLES: Record<string, string> = {
  [ROUTES.ADMIN.ROOT]:          C.nav.overview,
  [ROUTES.ADMIN.PARTNERS]:      C.nav.partners,
  [ROUTES.ADMIN.PIPELINE]:      C.nav.pipeline,
  [ROUTES.ADMIN.FINANCIALS]:    C.nav.financials,
  [ROUTES.ADMIN.DISTRIBUTIONS]: C.nav.distributions,
  [ROUTES.ADMIN.TEAM]:          C.nav.team,
  [ROUTES.ADMIN.PNL_ENTRY]:     C.nav.pnlEntry,
  [ROUTES.ADMIN.STRATEGIES]:    C.nav.strategies,
  [ROUTES.ADMIN.ALLOCATION]:    C.nav.allocation,
  [ROUTES.ADMIN.USERS]:         C.nav.users,
  [ROUTES.ADMIN.DOCUMENTS]:     C.nav.documents,
  [ROUTES.ADMIN.CONTENT]:       C.nav.content,
  [ROUTES.ADMIN.NOTIFICATIONS]: C.nav.notifications,
  [ROUTES.ADMIN.SYSTEM]:        C.nav.system,
}

interface AdminTopbarProps {
  adminName: string
}

export function AdminTopbar({ adminName }: AdminTopbarProps) {
  const pathname = usePathname()

  const title = Object.entries(PAGE_TITLES).find(([route]) =>
    pathname === route || (route !== ROUTES.ADMIN.ROOT && pathname.startsWith(route))
  )?.[1] ?? 'Admin'

  return (
    <header
      className="h-14 flex items-center justify-between px-6 flex-shrink-0"
      style={{ borderBottom: '0.5px solid rgba(245,166,35,0.08)', background: '#080808' }}
    >
      <h1 className="font-serif text-[22px] text-[#F0EDE6]">{title}</h1>

      <div className="flex items-center gap-3">
        <button
          className="w-8 h-8 flex items-center justify-center rounded-[4px] text-[#9A9080] hover:text-[#F0EDE6] hover:bg-[rgba(255,255,255,0.06)] transition-colors cursor-pointer bg-transparent border-none"
        >
          <Bell size={16} />
        </button>

        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-sans font-medium"
            style={{ background: 'rgba(245,166,35,0.12)', color: '#F5A623' }}
          >
            {adminName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div className="hidden sm:block">
            <p className="text-[13px] font-sans text-[#F0EDE6]">{adminName}</p>
          </div>
          <span
            className="text-[10px] font-sans px-1.5 py-0.5 rounded-[3px]"
            style={{ background: 'rgba(245,166,35,0.12)', color: '#F5A623' }}
          >
            {C.badge}
          </span>
        </div>
      </div>
    </header>
  )
}
