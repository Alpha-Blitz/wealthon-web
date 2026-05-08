'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X, LogIn } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { label: 'Home',     href: '/'         },
  { label: 'Services', href: '#what'     },
  { label: 'Process',  href: '#how'      },
  { label: 'Partners', href: '#who'      },
  { label: 'Insights', href: '/insights' },
  { label: 'Contact',  href: '#contact'  },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 80)
    handler()
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const handleNavClick = (href: string) => {
    setMenuOpen(false)
    if (!href.startsWith('#')) return
    if (pathname === '/') {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
    } else {
      router.push('/' + href)
    }
  }

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-[rgba(8,8,8,0.95)] backdrop-blur-[20px] border-b border-[rgba(245,166,35,0.1)]'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-[1200px] mx-auto px-5 lg:px-10 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <Image
            src="/navlogo.png"
            alt="Wealthon Capital Ventures"
            width={160}
            height={36}
            className="h-9 w-auto"
            priority
          />
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) =>
            link.href.startsWith('/') ? (
              <Link
                key={link.label}
                href={link.href}
                className="text-[#9A9080] text-sm font-sans font-normal tracking-[0.02em] hover:text-[#F0EDE6] transition-colors"
              >
                {link.label}
              </Link>
            ) : (
              <button
                key={link.label}
                onClick={() => handleNavClick(link.href)}
                className="text-[#9A9080] text-sm font-sans font-normal tracking-[0.02em] hover:text-[#F0EDE6] transition-colors cursor-pointer bg-transparent border-none p-0"
              >
                {link.label}
              </button>
            )
          )}
        </div>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            title="Partner Login"
            className="w-9 h-9 flex items-center justify-center rounded-[4px] text-[#9A9080] hover:text-[#F5A623] hover:bg-[rgba(245,166,35,0.08)] transition-colors border border-transparent hover:border-[rgba(245,166,35,0.2)]"
          >
            <LogIn size={18} />
          </Link>
          <button
            onClick={() => handleNavClick('#contact')}
            className="border border-gold text-gold text-[14px] font-sans tracking-[0.04em] px-5 py-2 rounded-[4px] hover:bg-[rgba(245,166,35,0.08)] transition-colors cursor-pointer bg-transparent"
          >
            Apply to Partner →
          </button>
        </div>

        {/* Hamburger */}
        <button
          className="md:hidden text-[#F0EDE6] p-1 cursor-pointer bg-transparent border-none"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[rgba(8,8,8,0.98)] border-t border-[rgba(245,166,35,0.08)] px-6 pt-5 pb-7 flex flex-col gap-5">
          {NAV_LINKS.map((link) =>
            link.href.startsWith('/') ? (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="text-[#F0EDE6] text-[15px] font-sans font-normal"
              >
                {link.label}
              </Link>
            ) : (
              <button
                key={link.label}
                onClick={() => handleNavClick(link.href)}
                className="text-[#F0EDE6] text-[15px] font-sans font-normal text-left cursor-pointer bg-transparent border-none p-0"
              >
                {link.label}
              </button>
            )
          )}
          <Link
            href="/login"
            onClick={() => setMenuOpen(false)}
            className="text-[#F0EDE6] text-[15px] font-sans font-normal"
          >
            Partner Login
          </Link>
          <button
            onClick={() => handleNavClick('#contact')}
            className="mt-2 border border-gold text-gold text-sm px-6 py-3 rounded-[4px] hover:bg-[rgba(245,166,35,0.08)] transition-colors w-full cursor-pointer bg-transparent"
          >
            Apply to Partner →
          </button>
        </div>
      )}
    </nav>
  )
}
