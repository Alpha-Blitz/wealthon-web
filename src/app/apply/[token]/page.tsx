import Link from 'next/link'
import Image from 'next/image'
import { AlertCircle, CheckCircle2, MessageCircle } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { lookupToken } from '@/lib/admin/applyTokens'
import { getFinancialConfig } from '@/lib/admin/settings'
import { ApplyTokenClient } from './ApplyTokenClient'

interface PageProps {
  params: Promise<{ token: string }>
}

export const metadata = {
  title: 'Partner Onboarding | Wealthon Capital Ventures',
  robots: { index: false, follow: false },
}

export default async function ApplyTokenPage({ params }: PageProps) {
  const { token } = await params
  const supabase = createAdminClient()
  const lookup = await lookupToken(supabase, token)
  const config = await getFinancialConfig(supabase)

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#080808' }}>
      <header
        className="flex items-center justify-between px-5 lg:px-10 h-16 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(245,166,35,0.08)' }}
      >
        <Link href="/" className="flex-shrink-0">
          <Image src="/navlogo.png" alt="Wealthon" width={140} height={32} className="h-7 w-auto" priority />
        </Link>
        <span className="text-[11px] font-sans uppercase tracking-[0.18em] text-gold">Secure Onboarding</span>
      </header>

      <main className="flex-1 px-5 lg:px-10 pt-12 pb-20">
        <div className="max-w-[720px] mx-auto">
          {lookup.status === 'invalid' && <InvalidState />}
          {lookup.status === 'expired' && <ExpiredState />}
          {lookup.status === 'used'    && <UsedState />}
          {lookup.status === 'valid'   && (
            <ApplyTokenClient
              token={lookup.token}
              monthlyRatePct={config.defaultMonthlyRate * 100}
              profitShare={config.defaultProfitShare}
              minInvestment={config.minInvestment}
              maxInvestment={config.maxInvestment}
              lockInMonths={config.lockInMonths}
            />
          )}
        </div>
      </main>
    </div>
  )
}

function ErrorScreen({ title, body, ctaHref, ctaLabel }: { title: string; body: string; ctaHref?: string; ctaLabel?: string }) {
  return (
    <div className="flex flex-col items-center text-center gap-5 py-16">
      <AlertCircle size={42} className="text-[#EF4444]" />
      <h1 className="font-serif text-[28px] text-[#F0EDE6]">{title}</h1>
      <p className="text-[14px] font-sans text-[#9A9080] max-w-[440px] leading-relaxed">{body}</p>
      {ctaHref && ctaLabel && (
        <a
          href={ctaHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-[13px] font-sans px-5 py-2.5 rounded-[4px]"
          style={{ background: '#F5A623', color: '#080808' }}
        >
          <MessageCircle size={13} />
          {ctaLabel}
        </a>
      )}
    </div>
  )
}

function InvalidState() {
  return <ErrorScreen title="This link is invalid." body="The onboarding link you used isn't recognised. Please contact Prathik to request a new secure link." ctaHref="https://wa.me/919035373664" ctaLabel="Message Prathik" />
}

function ExpiredState() {
  return <ErrorScreen title="This link has expired." body="Please contact Prathik to receive a new onboarding link." ctaHref="https://wa.me/919035373664" ctaLabel="Message Prathik" />
}

function UsedState() {
  return (
    <div className="flex flex-col items-center text-center gap-5 py-16">
      <CheckCircle2 size={42} className="text-[#22C55E]" />
      <h1 className="font-serif text-[28px] text-[#F0EDE6]">You&apos;ve already submitted your application.</h1>
      <p className="text-[14px] font-sans text-[#9A9080] max-w-[440px] leading-relaxed">Prathik will be in touch shortly.</p>
    </div>
  )
}
