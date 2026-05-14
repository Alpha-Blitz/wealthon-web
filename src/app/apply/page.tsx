import Link from 'next/link'
import Image from 'next/image'
import { ApplyPublicClient } from './ApplyPublicClient'

export const metadata = {
  title: 'Apply to Partner | Wealthon Capital Ventures',
  description: 'Tell us about yourself and we will be in touch within 24 hours.',
}

export default function ApplyPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#080808' }}>
      {/* Slim header */}
      <header
        className="flex items-center justify-between px-5 lg:px-10 h-16 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(245,166,35,0.08)' }}
      >
        <Link href="/" className="flex-shrink-0">
          <Image src="/navlogo.png" alt="Wealthon" width={140} height={32} className="h-7 w-auto" priority />
        </Link>
        <Link
          href="/login"
          className="text-[12px] font-sans text-gold hover:text-gold-secondary transition-colors"
        >
          Partner Portal →
        </Link>
      </header>

      <main className="flex-1 px-5 lg:px-10 pt-12 pb-20">
        <div className="max-w-[720px] mx-auto">
          <ApplyPublicClient />
        </div>
      </main>
    </div>
  )
}
