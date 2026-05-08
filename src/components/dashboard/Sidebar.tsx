'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, ArrowLeftRight, TrendingUp,
  Shield, User, LogOut, ChevronDown,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { ROUTES } from '@/config/routes'
import { CONTENT } from '@/config/content'
import { usePartner } from '@/context/PartnerContext'

const NAV_ITEMS = [
  { label: CONTENT.nav.dashboard,    href: ROUTES.DASHBOARD,    icon: LayoutDashboard },
  { label: CONTENT.nav.transactions, href: ROUTES.TRANSACTIONS,  icon: ArrowLeftRight },
  { label: CONTENT.nav.pnl,          href: ROUTES.PNL,           icon: TrendingUp },
  { label: CONTENT.nav.securities,   href: ROUTES.SECURITIES,    icon: Shield },
  { label: CONTENT.nav.profile,      href: ROUTES.PROFILE,       icon: User },
]

export function Sidebar() {
  const pathname = usePathname()
  const router   = useRouter()
  const partner  = usePartner()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push(ROUTES.LOGIN)
  }

  return (
    <aside
      className="hidden md:flex w-[240px] flex-shrink-0 flex-col h-screen sticky top-0"
      style={{ background: '#080808', borderRight: '1px solid rgba(245,166,35,0.1)' }}
    >
      {/* Logo */}
      <div className="px-6 py-6 flex-shrink-0">
        <Image src="/navlogo.png" alt="Wealthon" width={120} height={32} className="h-8 w-auto" />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 flex flex-col gap-1">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 h-[44px] rounded-[4px] text-[14px] font-sans transition-all"
              style={{
                color:      active ? '#F5A623' : '#9E9484',
                background: active ? 'rgba(245,166,35,0.08)' : 'transparent',
                borderLeft: active ? '2px solid #F5A623' : '2px solid transparent',
              }}
            >
              <Icon size={18} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom — partner info + logout */}
      <div className="mt-auto px-3 pb-6 flex flex-col gap-1">
        {/* Partner info */}
        <div
          className="flex items-center gap-3 px-3 py-3 rounded-[4px]"
          style={{ background: 'rgba(255,255,255,0.02)' }}
        >
          <div
            className="w-8 h-8 rounded-full flex-shrink-0 overflow-hidden relative"
            style={{ border: '1px solid rgba(245,166,35,0.4)' }}
          >
            {partner.avatar_url ? (
              <Image src={partner.avatar_url} alt={partner.initials} fill className="object-cover" />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-[12px] font-sans font-medium"
                style={{ background: 'rgba(245,166,35,0.1)', color: '#F5A623' }}
              >
                {partner.initials}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-sans text-[#F0EDE6] truncate">{partner.full_name}</p>
            <p className="text-[11px] font-sans text-[#68625A]">{CONTENT.nav.partner}</p>
          </div>
          <ChevronDown size={14} className="text-[#68625A] flex-shrink-0" />
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 h-[40px] rounded-[4px] text-[14px] font-sans text-[#9E9484] hover:text-[#F0EDE6] transition-colors cursor-pointer bg-transparent border-none w-full text-left"
        >
          <LogOut size={16} />
          {CONTENT.nav.logout}
        </button>
      </div>
    </aside>
  )
}
