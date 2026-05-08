import Image from 'next/image'
import Link from 'next/link'

const COL1 = [
  { label: 'What We Do', href: '#what' },
  { label: 'How It Works', href: '#how' },
  { label: 'Who We Work With', href: '#who' },
]
const COL2 = [
  { label: 'Insights', href: '/insights' },
  { label: 'Contact', href: '#contact' },
  { label: 'Partner Portal', href: '/login' },
]

const DISCLAIMER =
  'Wealthon Capital Ventures is a proprietary trading firm. Capital partnerships are profit-sharing arrangements and not fixed deposit schemes or guaranteed return products. All partnerships are governed by signed agreements. Past performance does not guarantee future results. For informational purposes only.'

export function Footer() {
  return (
    <footer style={{ background: '#050505', borderTop: '1px solid rgba(245,166,35,0.15)' }}>
      <div className="max-w-[1200px] mx-auto px-5 lg:px-10 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Logo + tagline */}
          <div>
            <Image
              src="/navlogo.png"
              alt="Wealthon Capital Ventures"
              width={140}
              height={32}
              className="h-8 w-auto mb-4"
            />
            <p className="text-[#7F7566] text-[13px] font-sans font-light italic">
              Where capital finds direction.
            </p>
          </div>

          {/* Quick links */}
          <div className="flex gap-12">
            <div className="flex flex-col gap-3">
              {COL1.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  className="text-[#9A9080] text-[13px] font-sans font-light hover:text-[#F0EDE6] transition-colors"
                >
                  {l.label}
                </Link>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              {COL2.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  className="text-[#9A9080] text-[13px] font-sans font-light hover:text-[#F0EDE6] transition-colors"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div>
            <p className="text-[#7F7566] text-[11px] font-sans font-light leading-[1.7]">
              {DISCLAIMER}
            </p>
          </div>
        </div>

        {/* Bottom strip */}
        <div
          className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 pt-6"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
        >
          <p className="text-[#7F7566] text-[12px] font-sans font-light">
            © 2025 Wealthon Capital Ventures · wealthonventures.com
          </p>

          {/* Social icons */}
          <div className="flex items-center gap-4">
            {/* LinkedIn */}
            <a
              href="#"
              aria-label="LinkedIn"
              className="text-[#7F7566] hover:text-gold transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect x="2" y="9" width="4" height="12" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </a>
            {/* Instagram */}
            <a
              href="#"
              aria-label="Instagram"
              className="text-[#7F7566] hover:text-gold transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
            </a>
            {/* YouTube */}
            <a
              href="#"
              aria-label="YouTube"
              className="text-[#7F7566] hover:text-gold transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
                <polygon points="9.75,15.02 15.5,12 9.75,8.98 9.75,15.02" fill="#050505" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
