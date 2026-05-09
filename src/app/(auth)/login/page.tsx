'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Eye, EyeOff, Shield, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { ROUTES } from '@/config/routes'
import { CONTENT } from '@/config/content'

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

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [redirecting, setRedirecting] = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [focusedEmail, setFocusedEmail]         = useState(false)
  const [focusedPassword, setFocusedPassword]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const supabase = createClient()
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
      if (authError) {
        setError(CONTENT.errors.authFailed)
        setLoading(false)
        return
      }
      // Ask the server (service role) whether this user is an admin — avoids RLS issues
      const res = await fetch('/api/auth/is-admin')
      const { isAdmin } = await res.json()
      setRedirecting(true)
      window.location.href = isAdmin ? ROUTES.ADMIN.ROOT : ROUTES.DASHBOARD
    } catch {
      setError(CONTENT.errors.generic)
      setLoading(false)
    }
  }

  if (redirecting) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#080808] gap-5">
        <Image src="/navlogo.png" alt="Wealthon" width={140} height={32} className="h-8 w-auto opacity-70" />
        <Loader2 size={22} className="animate-spin text-gold" />
        <p className="text-[#7F7566] text-[13px] font-sans">Signing you in…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-[#080808]">

      {/* Left panel — image only, no logo */}
      <div className="hidden lg:block w-[45%] relative flex-shrink-0">
        <Image src="/login-image.png" alt="" fill className="object-cover object-center" priority />
        {/* Lighter overlay to let image show through */}
        <div className="absolute inset-0" style={{ background: 'rgba(8,8,8,0.42)' }} />
        {/* Gold outline on the right edge */}
        <div
          className="absolute top-0 right-0 w-px h-full"
          style={{ background: 'linear-gradient(to bottom, transparent 0%, rgba(245,166,35,0.7) 20%, #F5A623 50%, rgba(245,166,35,0.7) 80%, transparent 100%)' }}
        />
      </div>

      {/* Right panel — dot grid bg */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative overflow-hidden">
        {/* Dot grid */}
        <div className="absolute inset-0 pointer-events-none" style={DOT_PATTERN} />
        {/* Radial vignette that fades the dots away from edges */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 70% 70% at 50% 50%, rgba(8,8,8,0) 30%, rgba(8,8,8,0.85) 100%)' }}
        />
        {/* Subtle gold glow behind card */}
        <div
          className="absolute pointer-events-none"
          style={{
            width: 480, height: 480,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(245,166,35,0.05) 0%, transparent 70%)',
            top: '50%', left: '50%',
            transform: 'translate(-50%,-50%)',
          }}
        />

        <div
          className="w-full max-w-[400px] relative z-10 rounded-[10px] p-8"
          style={{ background: '#111111', border: '0.5px solid rgba(245,166,35,0.2)' }}
        >
          {/* Logo (mobile only) */}
          <div className="flex justify-center mb-6 lg:hidden">
            <Image src="/navlogo.png" alt="Wealthon Capital Ventures" width={140} height={32} className="h-8 w-auto" />
          </div>

          <p className="text-gold text-[10px] font-sans uppercase tracking-[0.2em] mb-3 text-center">
            {CONTENT.login.eyebrow}
          </p>
          <h1 className="font-serif text-[36px] font-bold text-[#F0EDE6] text-center mb-2">
            {CONTENT.login.heading}
          </h1>
          <p className="text-[#9A9080] text-[14px] font-sans font-light text-center mb-8">
            {CONTENT.login.subheading}
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Email */}
            <div className="relative rounded-[8px] overflow-hidden" style={focusedEmail ? INPUT_FOCUS : INPUT_BASE}>
              <input
                type="email"
                placeholder={CONTENT.login.emailPlaceholder}
                value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={() => setFocusedEmail(true)}
                onBlur={() => setFocusedEmail(false)}
                className={INPUT_CLASS}
                required
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <div className="relative rounded-[8px] overflow-hidden" style={focusedPassword ? INPUT_FOCUS : INPUT_BASE}>
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder={CONTENT.login.passwordPlaceholder}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocusedPassword(true)}
                  onBlur={() => setFocusedPassword(false)}
                  className={`${INPUT_CLASS} pr-12`}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7F7566] hover:text-[#9A9080] transition-colors cursor-pointer bg-transparent border-none"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {error && (
                <p className="text-[12px] font-sans font-light px-1" style={{ color: '#EF4444' }}>
                  {error}
                </p>
              )}
            </div>

            {/* Forgot */}
            <div className="flex justify-end -mt-1">
              <Link
                href="/forgot-password"
                className="text-[#7F7566] text-[12px] font-sans hover:text-[#9A9080] transition-colors"
              >
                {CONTENT.login.forgotPassword}
              </Link>
            </div>

            {/* Sign in */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold text-[#080808] text-[14px] font-sans tracking-[0.05em] py-3.5 rounded-[6px] hover:bg-gold-secondary transition-colors cursor-pointer border-none disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {loading ? CONTENT.login.signingIn : CONTENT.login.signIn}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-[rgba(255,255,255,0.06)]" />
            <p className="text-[#7F7566] text-[11px] font-sans">OR</p>
            <div className="flex-1 h-px bg-[rgba(255,255,255,0.06)]" />
          </div>

          <Link
            href={ROUTES.CONTACT}
            className="block w-full text-center text-gold text-[13px] font-sans border border-[rgba(245,166,35,0.3)] rounded-[6px] py-3 hover:bg-[rgba(245,166,35,0.06)] transition-colors"
          >
            {CONTENT.login.notPartner}
          </Link>

          <div className="flex items-start gap-2 mt-6">
            <Shield size={13} className="text-[#7F7566] flex-shrink-0 mt-0.5" />
            <p className="text-[#7F7566] text-[11px] font-sans font-light leading-[1.6]">
              {CONTENT.login.securityNote}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
