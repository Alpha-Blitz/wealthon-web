'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ArrowLeftRight, TrendingUp, Shield, User } from 'lucide-react'
import { ROUTES } from '@/config/routes'

const TABS = [
  { href: ROUTES.DASHBOARD,   icon: LayoutDashboard },
  { href: ROUTES.TRANSACTIONS, icon: ArrowLeftRight },
  { href: ROUTES.PNL,         icon: TrendingUp },
  { href: ROUTES.SECURITIES,  icon: Shield },
  { href: ROUTES.PROFILE,     icon: User },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around h-[60px]"
      style={{ background: '#080808', borderTop: '1px solid rgba(245,166,35,0.1)' }}
    >
      {TABS.map(({ href, icon: Icon }) => {
        const active = pathname === href
        return (
          <Link
            key={href}
            href={href}
            className="flex items-center justify-center w-12 h-12"
            style={{ color: active ? '#F5A623' : '#4A4438' }}
          >
            <Icon size={20} />
          </Link>
        )
      })}
    </nav>
  )
}
