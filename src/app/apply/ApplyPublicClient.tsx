'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { AlertCircle, ArrowRight, CheckCircle2, Loader2, MessageCircle } from 'lucide-react'
import { ReturnCalculator } from '@/components/shared/ReturnCalculator'

const RANGES = ['₹1L – ₹10L', '₹10L – ₹50L', '₹50L+', 'Just exploring'] as const
const SOURCES = ['Referral', 'LinkedIn', 'Instagram', 'Website', 'WhatsApp', 'Other'] as const

interface FormState {
  name:     string
  whatsapp: string
  email:    string
  range:    string
  source:   string
}

const EMPTY: FormState = { name: '', whatsapp: '+91', email: '', range: '', source: '' }

export function ApplyPublicClient() {
  const [form, setForm]       = useState<FormState>(EMPTY)
  const [submitting, setSub]  = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [done, setDone]       = useState(false)

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(p => ({ ...p, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!form.name.trim() || !form.whatsapp.trim() || !form.email.trim() || !form.range) {
      setError('Please fill all required fields.')
      return
    }
    if (!form.email.includes('@')) {
      setError('Please enter a valid email.')
      return
    }
    setSub(true)
    try {
      const res = await fetch('/api/public/apply-interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.success) {
        setError(data.error ?? 'Could not submit. Please try again.')
        setSub(false)
        return
      }
      setDone(true)
    } catch {
      setError('Network error — please try again.')
      setSub(false)
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center text-center gap-5 py-10">
        <Image src="/compass.png" alt="" width={84} height={84} className="opacity-80" />
        <h1 className="font-serif text-[32px] sm:text-[40px] text-[#F0EDE6] leading-tight">
          We&apos;ll be in touch<span className="text-gold">.</span>
        </h1>
        <p className="text-[15px] font-sans font-light text-[#9A9080] max-w-[480px] leading-relaxed">
          Thank you, <span className="text-[#F0EDE6]">{form.name.split(' ')[0]}</span>. Prathik will reach out to
          your WhatsApp within 24 hours to learn more about your goals.
        </p>
        <div className="flex items-center gap-3 mt-3 flex-wrap justify-center">
          <a
            href="https://wa.me/919035373664"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[13px] font-sans px-4 py-2 rounded-[4px]"
            style={{ background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.3)', color: '#F5A623' }}
          >
            <MessageCircle size={13} />
            Message Prathik directly
          </a>
          <Link
            href="/"
            className="text-[13px] font-sans text-[#9A9080] hover:text-[#F0EDE6] transition-colors"
          >
            Back to homepage →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-12">
      {/* Header */}
      <div className="flex flex-col items-center text-center gap-4">
        <Image src="/compass.png" alt="" width={64} height={64} className="opacity-70" />
        <p className="text-gold text-[11px] font-sans uppercase tracking-[0.25em]">Partner Application</p>
        <h1 className="font-serif text-[36px] sm:text-[44px] text-[#F0EDE6] leading-tight">
          Tell us about yourself<span className="text-gold">.</span>
        </h1>
        <p className="text-[15px] font-sans font-light text-[#9A9080] max-w-[480px] leading-relaxed">
          Share your details and we&apos;ll be in touch within 24 hours to learn more about your goals.
        </p>
        <div className="w-12 h-px bg-gold mt-2" />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Field label="Full name" required>
          <input
            value={form.name}
            onChange={e => update('name', e.target.value)}
            placeholder="As you'd like to be addressed"
            className={INPUT}
          />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="WhatsApp number" required>
            <input
              type="tel"
              value={form.whatsapp}
              onChange={e => update('whatsapp', e.target.value)}
              placeholder="+91 9XXXXX XXXXX"
              className={INPUT}
            />
          </Field>
          <Field label="Email address" required>
            <input
              type="email"
              value={form.email}
              onChange={e => update('email', e.target.value)}
              placeholder="you@example.com"
              className={INPUT}
            />
          </Field>
        </div>
        <Field label="Investment range" required>
          <select
            value={form.range}
            onChange={e => update('range', e.target.value)}
            className={SELECT}
          >
            <option value="" disabled>Select range</option>
            {RANGES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </Field>
        <Field label="How did you hear about us">
          <select
            value={form.source}
            onChange={e => update('source', e.target.value)}
            className={SELECT}
          >
            <option value="">Select (optional)</option>
            {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>

        {error && (
          <div
            className="rounded-[6px] p-3 flex items-start gap-2"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)' }}
          >
            <AlertCircle size={14} className="text-[#EF4444] flex-shrink-0 mt-0.5" />
            <p className="text-[12px] font-sans text-[#F0EDE6]">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-[4px] text-[15px] font-sans tracking-[0.04em] cursor-pointer border-none disabled:opacity-50"
          style={{ background: '#F5A623', color: '#080808' }}
        >
          {submitting ? <Loader2 size={14} className="animate-spin" /> : <ArrowRight size={14} />}
          {submitting ? 'Submitting…' : 'Submit Interest'}
        </button>

        <p className="text-[11px] font-sans font-light text-[#7F7566] text-center mt-1">
          By submitting, you agree to be contacted by Wealthon Capital Ventures.
        </p>
      </form>

      {/* Calculator lead magnet */}
      <div>
        <div className="text-center mb-5">
          <p className="text-gold text-[11px] font-sans uppercase tracking-[0.2em] mb-2">Returns Illustration</p>
          <h2 className="font-serif text-[22px] sm:text-[28px] text-[#F0EDE6] leading-tight">
            See what your money could earn<span className="text-gold">.</span>
          </h2>
        </div>
        <ReturnCalculator mode="public" />
      </div>

      <p className="flex items-center justify-center gap-2 text-[11px] font-sans text-[#7F7566] mt-4">
        <CheckCircle2 size={12} className="text-gold" />
        Your information is encrypted and stored securely.
      </p>
    </div>
  )
}

const INPUT =
  'w-full bg-transparent text-[#F0EDE6] text-[14px] font-sans font-light py-2.5 outline-none placeholder:text-[#7F7566] transition-colors'

const SELECT =
  'w-full bg-transparent text-[#F0EDE6] text-[14px] font-sans font-light py-2.5 outline-none cursor-pointer appearance-none'

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[10px] font-sans uppercase tracking-[0.12em] text-gold">
        {label}{required && <span className="text-[#EF4444] ml-0.5">*</span>}
      </span>
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
        {children}
      </div>
    </label>
  )
}
