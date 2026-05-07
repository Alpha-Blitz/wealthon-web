'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Eye, EyeOff, Shield } from 'lucide-react'

const INPUT_STYLE = { borderBottom: '1px solid rgba(255,255,255,0.15)' }
const INPUT_CLASS =
  'w-full bg-transparent text-[#F0EDE6] text-[14px] font-sans font-light py-3 outline-none placeholder:text-[#4A4438]'

export default function LoginPage() {
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Auth coming soon. Partner portal launches in Phase 2.')
  }

  return (
    <div className="min-h-screen flex bg-[#080808]">
      {/* Left panel — image */}
      <div className="hidden lg:flex w-[45%] relative flex-shrink-0">
        <Image src="/banner.png" alt="" fill className="object-cover" priority />
        <div className="absolute inset-0" style={{ background: 'rgba(8,8,8,0.7)' }} />

        {/* Compass watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Image
            src="/compass.png"
            alt=""
            width={480}
            height={480}
            className="opacity-[0.06] select-none"
          />
        </div>

        {/* Logo + tagline */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full">
          <Image
            src="/navlogo.png"
            alt="Wealthon Capital Ventures"
            width={160}
            height={36}
            className="h-9 w-auto mb-4"
          />
          <p className="text-[#4A4438] text-[13px] font-sans font-light italic">
            Where capital finds direction.
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
        {/* Compass watermark mobile */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none lg:hidden">
          <Image
            src="/compass.png"
            alt=""
            width={400}
            height={400}
            className="opacity-[0.04] select-none"
          />
        </div>

        <div
          className="w-full max-w-[400px] relative z-10 rounded-[8px] p-8 md:p-6"
          style={{ background: '#111111', border: '0.5px solid rgba(245,166,35,0.2)' }}
        >
          {/* Logo (mobile only) */}
          <div className="flex justify-center mb-6 lg:hidden">
            <Image
              src="/navlogo.png"
              alt="Wealthon Capital Ventures"
              width={140}
              height={32}
              className="h-8 w-auto"
            />
          </div>

          {/* Header */}
          <p className="text-gold text-[10px] font-sans uppercase tracking-[0.2em] mb-3 text-center">
            Partner Portal
          </p>
          <h1 className="font-serif text-[36px] font-bold text-[#F0EDE6] text-center mb-2">
            Welcome back.
          </h1>
          <p className="text-[#8A8070] text-[14px] font-sans font-light text-center mb-8">
            Sign in to access your partner dashboard.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Email */}
            <div style={INPUT_STYLE}>
              <input
                type="email"
                placeholder="Email address"
                className={INPUT_CLASS}
                required
              />
            </div>

            {/* Password */}
            <div className="relative" style={INPUT_STYLE}>
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Password"
                className={`${INPUT_CLASS} pr-8`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-[#4A4438] hover:text-[#8A8070] transition-colors cursor-pointer bg-transparent border-none"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Forgot password */}
            <div className="flex justify-end -mt-2">
              <button
                type="button"
                className="text-[#4A4438] text-[12px] font-sans hover:text-[#8A8070] transition-colors cursor-pointer bg-transparent border-none"
              >
                Forgot password? →
              </button>
            </div>

            {/* Sign in */}
            <button
              type="submit"
              className="w-full bg-gold text-[#080808] text-[14px] font-sans tracking-[0.05em] py-3.5 rounded-[4px] hover:bg-gold-secondary transition-colors cursor-pointer border-none"
            >
              Sign in →
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-[rgba(255,255,255,0.06)]" />
            <p className="text-[#4A4438] text-[11px] font-sans">OR</p>
            <div className="flex-1 h-px bg-[rgba(255,255,255,0.06)]" />
          </div>

          {/* Not a partner */}
          <Link
            href="/#contact"
            className="block w-full text-center text-gold text-[13px] font-sans border border-[rgba(245,166,35,0.3)] rounded-[4px] py-3 hover:bg-[rgba(245,166,35,0.06)] transition-colors"
          >
            Not a partner yet? Start a conversation →
          </Link>

          {/* Security footer */}
          <div className="flex items-start gap-2 mt-6">
            <Shield size={13} className="text-[#4A4438] flex-shrink-0 mt-0.5" />
            <p className="text-[#4A4438] text-[11px] font-sans font-light leading-[1.6]">
              Secure access. All data is encrypted and protected with bank-grade security.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
