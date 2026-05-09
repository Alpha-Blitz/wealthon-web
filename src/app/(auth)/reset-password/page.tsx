'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
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

export default function ResetPasswordPage() {
  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [showPass, setShowPass]   = useState(false)
  const [focused1, setFocused1]   = useState(false)
  const [focused2, setFocused2]   = useState(false)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords do not match.'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    setError(null)
    setLoading(true)
    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (updateError) { setError(updateError.message); return }
    window.location.href = '/dashboard'
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
            New password.
          </h1>
          <p className="text-[#9A9080] text-[14px] font-sans font-light text-center mb-8">
            Choose a strong password for your account.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* New password */}
            <div className="relative rounded-[8px] overflow-hidden" style={focused1 ? INPUT_FOCUS : INPUT_BASE}>
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="New password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={() => setFocused1(true)}
                onBlur={() => setFocused1(false)}
                className={`${INPUT_CLASS} pr-12`}
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7F7566] hover:text-[#9A9080] transition-colors cursor-pointer bg-transparent border-none"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Confirm password */}
            <div>
              <div className="relative rounded-[8px] overflow-hidden" style={focused2 ? INPUT_FOCUS : INPUT_BASE}>
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Confirm password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  onFocus={() => setFocused2(true)}
                  onBlur={() => setFocused2(false)}
                  className={INPUT_CLASS}
                  required
                  autoComplete="new-password"
                />
              </div>
              {error && (
                <p className="text-[12px] font-sans font-light mt-1.5 px-1" style={{ color: '#EF4444' }}>
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold text-[#080808] text-[14px] font-sans tracking-[0.05em] py-3.5 rounded-[6px] hover:bg-gold-secondary transition-colors cursor-pointer border-none disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {loading ? 'Updating…' : 'Set new password →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
