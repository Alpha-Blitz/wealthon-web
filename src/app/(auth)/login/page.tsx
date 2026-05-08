'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Shield, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { ROUTES } from '@/config/routes'
import { CONTENT } from '@/config/content'

const INPUT_STYLE = { borderBottom: '1px solid rgba(255,255,255,0.15)' }
const INPUT_FOCUS_STYLE = { borderBottom: '1px solid #F5A623' }
const INPUT_CLASS =
  'w-full bg-transparent text-[#F0EDE6] text-[14px] font-sans font-light py-3 outline-none placeholder:text-[#6B6152]'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [focusedEmail, setFocusedEmail]     = useState(false)
  const [focusedPassword, setFocusedPassword] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError(CONTENT.errors.authFailed)
      setLoading(false)
      return
    }

    router.push(ROUTES.DASHBOARD)
  }

  return (
    <div className="min-h-screen flex bg-[#080808]">
      {/* Left panel — image */}
      <div className="hidden lg:flex w-[45%] relative flex-shrink-0">
        <Image src="/banner.png" alt="" fill className="object-cover" priority />
        <div className="absolute inset-0" style={{ background: 'rgba(8,8,8,0.7)' }} />

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Image src="/compass.png" alt="" width={480} height={480} className="opacity-[0.06] select-none" />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center w-full">
          <Image src="/navlogo.png" alt="Wealthon Capital Ventures" width={160} height={36} className="h-9 w-auto mb-4" />
          <p className="text-[#6B6152] text-[13px] font-sans font-light italic">
            Where capital finds direction.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none lg:hidden">
          <Image src="/compass.png" alt="" width={400} height={400} className="opacity-[0.04] select-none" />
        </div>

        <div
          className="w-full max-w-[400px] relative z-10 rounded-[8px] p-8"
          style={{ background: '#111111', border: '0.5px solid rgba(245,166,35,0.2)' }}
        >
          {/* Logo (mobile) */}
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

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Email */}
            <div style={focusedEmail ? INPUT_FOCUS_STYLE : INPUT_STYLE}>
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
            <div>
              <div className="relative" style={focusedPassword ? INPUT_FOCUS_STYLE : INPUT_STYLE}>
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder={CONTENT.login.passwordPlaceholder}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocusedPassword(true)}
                  onBlur={() => setFocusedPassword(false)}
                  className={`${INPUT_CLASS} pr-8`}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-[#6B6152] hover:text-[#9A9080] transition-colors cursor-pointer bg-transparent border-none"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {/* Inline error */}
              {error && (
                <p className="mt-2 text-[13px] font-sans font-light" style={{ color: '#EF4444' }}>
                  {error}
                </p>
              )}
            </div>

            {/* Forgot password */}
            <div className="flex justify-end -mt-2">
              <button
                type="button"
                className="text-[#6B6152] text-[12px] font-sans hover:text-[#9A9080] transition-colors cursor-pointer bg-transparent border-none"
              >
                {CONTENT.login.forgotPassword}
              </button>
            </div>

            {/* Sign in */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold text-[#080808] text-[14px] font-sans tracking-[0.05em] py-3.5 rounded-[4px] hover:bg-gold-secondary transition-colors cursor-pointer border-none disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {loading ? CONTENT.login.signingIn : CONTENT.login.signIn}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-[rgba(255,255,255,0.06)]" />
            <p className="text-[#6B6152] text-[11px] font-sans">OR</p>
            <div className="flex-1 h-px bg-[rgba(255,255,255,0.06)]" />
          </div>

          <Link
            href={ROUTES.CONTACT}
            className="block w-full text-center text-gold text-[13px] font-sans border border-[rgba(245,166,35,0.3)] rounded-[4px] py-3 hover:bg-[rgba(245,166,35,0.06)] transition-colors"
          >
            {CONTENT.login.notPartner}
          </Link>

          <div className="flex items-start gap-2 mt-6">
            <Shield size={13} className="text-[#6B6152] flex-shrink-0 mt-0.5" />
            <p className="text-[#6B6152] text-[11px] font-sans font-light leading-[1.6]">
              {CONTENT.login.securityNote}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
