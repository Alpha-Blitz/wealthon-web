'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Users, GitBranch, DollarSign, FileText,
  Send, BarChart2, UserCog, FolderOpen,
  Newspaper, Bell, Settings, LogOut, Shield, TrendingUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ROUTES } from '@/config/routes'
import { CONTENT } from '@/config/content'
import { createClient } from '@/lib/supabase/client'

const C = CONTENT.admin

interface NavItem {
  label: string
  href:  string
  icon:  React.ElementType
}

const OPERATIONS: NavItem[] = [
  { label: C.nav.overview,      href: ROUTES.ADMIN.ROOT,          icon: LayoutDashboard },
  { label: C.nav.partners,      href: ROUTES.ADMIN.PARTNERS,      icon: Users           },
  { label: C.nav.pipeline,      href: ROUTES.ADMIN.PIPELINE,      icon: GitBranch       },
  { label: C.nav.distributions, href: ROUTES.ADMIN.DISTRIBUTIONS, icon: Send            },
]

const FINANCE: NavItem[] = [
  { label: C.nav.financials,  href: ROUTES.ADMIN.FINANCIALS,  icon: DollarSign },
  { label: C.nav.rates,       href: ROUTES.ADMIN.RATES,       icon: TrendingUp },
  { label: C.nav.pnlEntry,    href: ROUTES.ADMIN.PNL_ENTRY,   icon: BarChart2  },
]

const CONTENT_ITEMS: NavItem[] = [
  { label: C.nav.content,       href: ROUTES.ADMIN.CONTENT,       icon: Newspaper  },
  { label: C.nav.notifications, href: ROUTES.ADMIN.NOTIFICATIONS, icon: Bell       },
  { label: C.nav.documents,     href: ROUTES.ADMIN.DOCUMENTS,     icon: FolderOpen },
]

const SYSTEM_ITEMS: NavItem[] = [
  { label: C.nav.users,  href: ROUTES.ADMIN.USERS,  icon: UserCog  },
  { label: C.nav.team,   href: ROUTES.ADMIN.TEAM,   icon: Shield   },
  { label: C.nav.system, href: ROUTES.ADMIN.SYSTEM, icon: Settings },
]

interface AdminSidebarProps {
  adminName: string
}

export function AdminSidebar({ adminName }: AdminSidebarProps) {
  const pathname = usePathname()
  const router   = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  function NavLink({ item }: { item: NavItem }) {
    const active = pathname === item.href || (item.href !== ROUTES.ADMIN.ROOT && pathname.startsWith(item.href))
    return (
      <Link
        href={item.href}
        className={cn(
          'flex items-center gap-3 px-4 h-[44px] text-[14px] font-sans transition-colors rounded-[4px] mx-1',
          active
            ? 'text-[#F5A623] bg-[rgba(245,166,35,0.08)]'
            : 'text-[#8A8070] hover:text-[#F0EDE6] hover:bg-[rgba(255,255,255,0.04)]'
        )}
        style={active ? { borderLeft: '2px solid #F5A623', borderRadius: '0 4px 4px 0', marginLeft: 0, paddingLeft: '14px' } : {}}
      >
        <item.icon size={17} />
        {item.label}
      </Link>
    )
  }

  function Section({ label, items }: { label: string; items: NavItem[] }) {
    return (
      <div>
        <p className="px-5 mb-1 text-[10px] font-sans uppercase tracking-[0.1em] text-[#4A4438]">{label}</p>
        {items.map(item => <NavLink key={item.href} item={item} />)}
      </div>
    )
  }

  return (
    <aside
      className="hidden md:flex flex-col w-[220px] flex-shrink-0 h-full"
      style={{ background: '#080808', borderRight: '1px solid rgba(245,166,35,0.1)' }}
    >
      {/* Logo */}
      <div className="px-5 py-5 flex-shrink-0" style={{ borderBottom: '1px solid rgba(245,166,35,0.06)' }}>
        <Image src="/navlogo.png" alt="Wealthon" width={130} height={28} className="h-7 w-auto" priority />
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 flex flex-col gap-5">
        <Section label={C.sections.operations} items={OPERATIONS} />
        <div style={{ height: 1, background: 'rgba(255,255,255,0.04)', margin: '0 16px' }} />
        <Section label={C.sections.finance}    items={FINANCE} />
        <div style={{ height: 1, background: 'rgba(255,255,255,0.04)', margin: '0 16px' }} />
        <Section label={C.sections.content}    items={CONTENT_ITEMS} />
        <div style={{ height: 1, background: 'rgba(255,255,255,0.04)', margin: '0 16px' }} />
        <Section label={C.sections.system}     items={SYSTEM_ITEMS} />
      </nav>

      {/* Bottom — admin info + logout */}
      <div className="px-4 py-4 flex-shrink-0" style={{ borderTop: '1px solid rgba(245,166,35,0.08)' }}>
        <div className="flex items-center gap-2.5 mb-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-sans font-medium flex-shrink-0"
            style={{ background: 'rgba(245,166,35,0.12)', color: '#F5A623' }}
          >
            {adminName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-sans text-[#F0EDE6] truncate">{adminName}</p>
            <span
              className="text-[10px] font-sans px-1.5 py-0.5 rounded-[3px]"
              style={{ background: 'rgba(245,166,35,0.12)', color: '#F5A623' }}
            >
              {C.badge}
            </span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-[13px] font-sans text-[#9A9080] hover:text-[#EF4444] transition-colors cursor-pointer bg-transparent border-none p-0 w-full"
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
