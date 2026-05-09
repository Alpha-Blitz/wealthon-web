'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Shield, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const INPUT_BASE: React.CSSProperties = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px',
  overflow: 'hidden',
}
const INPUT_FOCUS: React.CSSProperties = {
  background: 'rgba(245,166,35,0.04)',
  border: '1px solid rgba(245,166,35,0.5)',
  borderRadius: '8px',
  overflow: 'hidden',
}
const INPUT_CLASS =
  'w-full bg-transparent text-[#F0EDE6] text-[14px] font-sans font-light px-4 py-3 outline-none placeholder:text-[#7F7566]'

const DOT_PATTERN: React.CSSProperties = {
  backgroundImage: 'radial-gradient(rgba(245,166,35,0.32) 1.5px, transparent 1.5px)',
  backgroundSize: '28px 28px',
}

export default function ForgotPasswordPage() {
  const [email, setEmail]       = useState('')
  const [focused, setFocused]   = useState(false)
  const [loading, setLoading]   = useState(false)
  const [sent, setSent]         = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    })
    setLoading(false)
    setSent(true)
  }

  return (
    <div className="min-h-screen flex bg-[#080808]">
      {/* Left panel */}
      <div className="hidden lg:block w-[45%] relative flex-shrink-0">
        <Image src="/login-image.png" alt="" fill className="object-cover object-center" priority />
        <div className="absolute inset-0" style={{ background: 'rgba(8,8,8,0.42)' }} />
        <div
          className="absolute top-0 right-0 w-px h-full"
          style={{ background: 'linear-gradient(to bottom, transparent 0%, rgba(245,166,35,0.7) 20%, #F5A623 50%, rgba(245,166,35,0.7) 80%, transparent 100%)' }}
        />
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={DOT_PATTERN} />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 70% 70% at 50% 50%, rgba(8,8,8,0) 30%, rgba(8,8,8,0.85) 100%)' }}
        />

        <div
          className="w-full max-w-[400px] relative z-10 rounded-[10px] p-8"
          style={{ background: '#111111', border: '0.5px solid rgba(245,166,35,0.2)' }}
        >
          <div className="flex justify-center mb-6 lg:hidden">
            <Image src="/navlogo.png" alt="Wealthon Capital Ventures" width={140} height={32} className="h-8 w-auto" />
          </div>

          <p className="text-gold text-[10px] font-sans uppercase tracking-[0.2em] mb-3 text-center">
            Partner Portal
          </p>
          <h1 className="font-serif text-[32px] font-bold text-[#F0EDE6] text-center mb-2">
            Reset your password.
          </h1>
          <p className="text-[#9A9080] text-[14px] font-sans font-light text-center mb-8">
            Enter your email and we&apos;ll send you a reset link.
          </p>

          {sent ? (
            <div className="flex flex-col items-center gap-4 py-4">
              <Shield size={32} className="text-gold" />
              <p className="text-[#F0EDE6] text-[15px] font-sans text-center leading-[1.6]">
                Check your inbox. A reset link has been sent to{' '}
                <span className="text-gold">{email}</span>.
              </p>
              <p className="text-[#9A9080] text-[12px] font-sans text-center">
                If that address is registered, you&apos;ll receive an email within a few minutes.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="relative rounded-[8px] overflow-hidden" style={focused ? INPUT_FOCUS : INPUT_BASE}>
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  className={INPUT_CLASS}
                  required
                  autoComplete="email"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gold text-[#080808] text-[14px] font-sans tracking-[0.05em] py-3.5 rounded-[6px] hover:bg-gold-secondary transition-colors cursor-pointer border-none disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 size={14} className="animate-spin" />}
                {loading ? 'Sending…' : 'Send reset link →'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-[#7F7566] text-[13px] font-sans hover:text-[#9A9080] transition-colors"
            >
              ← Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
