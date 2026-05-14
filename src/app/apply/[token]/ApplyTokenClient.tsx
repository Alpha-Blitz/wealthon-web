'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useMemo } from 'react'
import { AlertCircle, ArrowRight, CheckCircle2, Loader2, MessageCircle, Shield } from 'lucide-react'
import { StepIndicator } from '@/components/admin/StepIndicator'
import { ReturnCalculator } from '@/components/shared/ReturnCalculator'
import {
  INDIAN_STATES, PAN_REGEX, PIN_REGEX, IFSC_REGEX,
  TIER_THRESHOLDS, getTierForAmount, PAYOUT_OPTIONS,
} from '@/config/constants'
import { formatINR } from '@/lib/utils'
import type { ApplyToken } from '@/lib/admin/applyTokens'

const STEPS = ['Your details', 'Your investment', 'Banking', 'Confirm'] as const

interface Props {
  token:          ApplyToken
  monthlyRatePct: number   // percentage e.g. 2.5
  profitShare:    number   // percentage e.g. 75
  minInvestment:  number   // paise
  maxInvestment:  number   // paise
  lockInMonths:   number
}

interface IfscDetails { BANK: string; BRANCH: string }

interface FormState {
  full_name:           string
  date_of_birth:       string
  pan_number:          string
  whatsapp:            string
  email:               string
  residential_address: string
  city:                string
  state:               string
  pin_code:            string
  capitalPaise:        number
  payout_preference:   'payout' | 'reinvest'
  lockInAck:           boolean
  account_holder_name: string
  bank_account_number: string
  bank_account_confirm:string
  bank_ifsc:           string
  bank_name:           string
  marketRiskAck:       boolean
  agreementAck:        boolean
}

export function ApplyTokenClient({ token, monthlyRatePct, profitShare, minInvestment, maxInvestment, lockInMonths }: Props) {
  const [step, setStep]   = useState(0)
  const [form, setForm]   = useState<FormState>({
    full_name:    token.prospect_name ?? '',
    date_of_birth: '',
    pan_number:   '',
    whatsapp:     token.prospect_whatsapp ?? '',
    email:        token.prospect_email ?? '',
    residential_address: '',
    city: '',
    state: 'Karnataka',
    pin_code: '',
    capitalPaise: Math.max(minInvestment, Math.min(maxInvestment, 500000)),
    payout_preference: 'payout',
    lockInAck: false,
    account_holder_name: token.prospect_name ?? '',
    bank_account_number: '',
    bank_account_confirm: '',
    bank_ifsc: '',
    bank_name: '',
    marketRiskAck: false,
    agreementAck: false,
  })
  const [error, setError]   = useState<string | null>(null)
  const [submitting, setSub]= useState(false)
  const [ifsc, setIfsc]     = useState<{ status: 'idle' | 'loading' | 'ok' | 'fail'; details?: IfscDetails }>({ status: 'idle' })
  const [done, setDone]     = useState<{ monthlyPayout: number; firstPayoutDate: string } | null>(null)

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(p => ({ ...p, [key]: value }))
  }

  const tier = getTierForAmount(form.capitalPaise)
  const rateDec  = monthlyRatePct / 100
  const shareDec = profitShare / 100
  const monthlyPayout = Math.round(form.capitalPaise * rateDec * shareDec)
  const firstPayoutDate = useMemo(() => {
    const d = new Date()
    d.setMonth(d.getMonth() + lockInMonths + 1)
    d.setDate(0) // last day of previous month — i.e. end of lock-in month + 1
    return d
  }, [lockInMonths])

  function validate(s: number): string | null {
    if (s === 0) {
      if (!form.full_name.trim()) return 'Full legal name required'
      if (!form.date_of_birth) return 'Date of birth required'
      if (!PAN_REGEX.test(form.pan_number.toUpperCase())) return 'PAN must match AAAAA9999A'
      if (!form.residential_address.trim()) return 'Address required'
      if (!form.city.trim()) return 'City required'
      if (!form.state) return 'State required'
      if (!PIN_REGEX.test(form.pin_code)) return 'PIN must be 6 digits'
    }
    if (s === 1) {
      if (form.capitalPaise < minInvestment) return `Minimum capital is ${formatINR(minInvestment)}`
      if (form.capitalPaise > maxInvestment) return `Maximum capital is ${formatINR(maxInvestment)}`
      if (!form.lockInAck) return `Please acknowledge the ${lockInMonths}-month lock-in`
    }
    if (s === 2) {
      if (!form.account_holder_name.trim()) return 'Account holder required'
      if (!form.bank_account_number || form.bank_account_number.length < 6) return 'Account number required'
      if (form.bank_account_number !== form.bank_account_confirm) return 'Account numbers do not match'
      if (!IFSC_REGEX.test(form.bank_ifsc.toUpperCase())) return 'IFSC must match AAAA0XXXXXX'
    }
    if (s === 3) {
      if (!form.marketRiskAck) return 'Please acknowledge the market risk disclosure'
      if (!form.agreementAck)  return 'Please confirm agreement with the Capital Partnership terms'
    }
    return null
  }

  function next() {
    const e = validate(step)
    if (e) { setError(e); return }
    setError(null)
    setStep(s => Math.min(s + 1, STEPS.length - 1))
  }
  function back() {
    setError(null)
    setStep(s => Math.max(s - 1, 0))
  }

  async function lookupIfsc(code: string) {
    if (!IFSC_REGEX.test(code.toUpperCase())) { setIfsc({ status: 'idle' }); return }
    setIfsc({ status: 'loading' })
    try {
      const res = await fetch(`https://ifsc.razorpay.com/${code.toUpperCase()}`)
      if (!res.ok) throw new Error()
      const data = (await res.json()) as IfscDetails
      setIfsc({ status: 'ok', details: data })
      set('bank_name', data.BANK ?? '')
    } catch {
      setIfsc({ status: 'fail' })
    }
  }

  async function handleSubmit() {
    const e = validate(3)
    if (e) { setError(e); return }
    setSub(true); setError(null)
    try {
      const res = await fetch('/api/public/apply-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token.token, form }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.success) {
        setError(data.error ?? 'Could not submit. Please try again.')
        setSub(false)
        return
      }
      setDone({
        monthlyPayout: data.monthlyPayout ?? monthlyPayout,
        firstPayoutDate: data.firstPayoutDate ?? firstPayoutDate.toISOString(),
      })
    } catch {
      setError('Network error — please try again.')
      setSub(false)
    }
  }

  if (done) {
    return <SuccessView form={form} monthlyPayout={done.monthlyPayout} firstPayoutDate={new Date(done.firstPayoutDate)} lockInMonths={lockInMonths} rateLabel={`${monthlyRatePct.toFixed(2)}%/month`} />
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-center text-center gap-3">
        <Image src="/compass.png" alt="" width={56} height={56} className="opacity-70" />
        <p className="text-gold text-[11px] font-sans uppercase tracking-[0.25em]">Partner Onboarding</p>
        <h1 className="font-serif text-[28px] sm:text-[32px] text-[#F0EDE6] leading-tight">
          Complete your application<span className="text-gold">.</span>
        </h1>
      </div>

      <div className="overflow-x-auto pb-2">
        <StepIndicator steps={STEPS} currentStep={step} />
      </div>

      {error && (
        <div
          className="rounded-[6px] p-3 flex items-start gap-2"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)' }}
        >
          <AlertCircle size={14} className="text-[#EF4444] flex-shrink-0 mt-0.5" />
          <p className="text-[12px] font-sans text-[#F0EDE6]">{error}</p>
        </div>
      )}

      {step === 0 && (
        <div className="flex flex-col gap-4">
          <Field label="Full legal name" required>
            <input className={INPUT} value={form.full_name} onChange={e => set('full_name', e.target.value)} placeholder="As per PAN" />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Date of birth" required>
              <input type="date" className={INPUT} value={form.date_of_birth} onChange={e => set('date_of_birth', e.target.value)} />
            </Field>
            <Field label="PAN number" required>
              <input className={INPUT} value={form.pan_number} maxLength={10} onChange={e => set('pan_number', e.target.value.toUpperCase())} placeholder="ABCDE1234F" />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="WhatsApp">
              <input className={INPUT_READONLY} value={form.whatsapp} readOnly />
            </Field>
            <Field label="Email">
              <input className={INPUT_READONLY} value={form.email} readOnly />
            </Field>
          </div>
          <Field label="Residential address" required>
            <textarea className={`${INPUT} resize-none`} rows={2} value={form.residential_address} onChange={e => set('residential_address', e.target.value)} />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="City" required>
              <input className={INPUT} value={form.city} onChange={e => set('city', e.target.value)} />
            </Field>
            <Field label="State" required>
              <select className={SELECT} value={form.state} onChange={e => set('state', e.target.value)}>
                {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="PIN" required>
              <input className={INPUT} value={form.pin_code} maxLength={6} onChange={e => set('pin_code', e.target.value.replace(/[^0-9]/g, ''))} />
            </Field>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="flex flex-col gap-5">
          <ReturnCalculator
            mode="apply"
            initialAmount={form.capitalPaise}
            monthlyRate={rateDec}
            profitShare={profitShare}
            onAmountChange={paise => set('capitalPaise', paise)}
          />
          <div
            className="rounded-[8px] p-4"
            style={{ background: 'rgba(245,166,35,0.04)', border: '1px solid rgba(245,166,35,0.15)' }}
          >
            <p className="text-[12px] font-sans text-[#9A9080]">
              You&apos;ll be assigned <span className="text-gold font-medium">Tier {tier}</span> for this capital.
            </p>
            <p className="text-[12px] font-sans text-[#9A9080] mt-1">
              Tiers — L1: {formatINR(TIER_THRESHOLDS[0].min)} to {formatINR(TIER_THRESHOLDS[0].max)} ·
              L2: {formatINR(TIER_THRESHOLDS[1].min)} to {formatINR(TIER_THRESHOLDS[1].max)} ·
              L3: above {formatINR(TIER_THRESHOLDS[2].min)}
            </p>
          </div>

          <Field label="Payout preference" required>
            <div className="flex gap-2 pt-1">
              {PAYOUT_OPTIONS.map(o => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => set('payout_preference', o.value)}
                  className="flex-1 px-4 py-3 rounded-[4px] text-[13px] font-sans cursor-pointer bg-transparent text-left"
                  style={{
                    border: `1px solid ${form.payout_preference === o.value ? '#F5A623' : 'rgba(255,255,255,0.1)'}`,
                    color:       form.payout_preference === o.value ? '#F5A623' : '#9A9080',
                    background:  form.payout_preference === o.value ? 'rgba(245,166,35,0.08)' : 'transparent',
                  }}
                >
                  <span className="block text-[13px]">{o.label}</span>
                  <span className="block text-[11px] text-[#7F7566] mt-0.5">
                    {o.value === 'payout' ? 'Receive every month end' : 'Compound your capital'}
                  </span>
                </button>
              ))}
            </div>
          </Field>

          <label className="flex items-start gap-2.5 cursor-pointer">
            <input type="checkbox" checked={form.lockInAck} onChange={e => set('lockInAck', e.target.checked)} className="mt-0.5" />
            <span className="text-[12px] font-sans text-[#9A9080] leading-relaxed">
              I understand there is a <span className="text-[#F0EDE6]">{lockInMonths}-month minimum lock-in</span> before my first payout.
            </span>
          </label>

          <div
            className="rounded-[6px] p-3"
            style={{ background: '#0F0F0F', border: '1px solid rgba(255,255,255,0.05)' }}
          >
            <p className="text-[11px] font-sans text-[#7F7566]">
              Based on today, your first payout would be around{' '}
              <span className="text-gold">
                {firstPayoutDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
              </span>.
            </p>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-4">
          <Field label="Account holder name" required>
            <input className={INPUT} value={form.account_holder_name} onChange={e => set('account_holder_name', e.target.value)} />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Bank account number" required>
              <input className={INPUT} value={form.bank_account_number} onChange={e => set('bank_account_number', e.target.value.replace(/[^0-9]/g, ''))} />
            </Field>
            <Field label="Confirm account number" required>
              <input className={INPUT} value={form.bank_account_confirm} onChange={e => set('bank_account_confirm', e.target.value.replace(/[^0-9]/g, ''))} />
            </Field>
          </div>
          <Field label="IFSC code" required>
            <input
              className={INPUT}
              value={form.bank_ifsc}
              maxLength={11}
              onChange={e => {
                const v = e.target.value.toUpperCase()
                set('bank_ifsc', v)
                if (v.length === 11) lookupIfsc(v); else setIfsc({ status: 'idle' })
              }}
              placeholder="HDFC0001234"
            />
          </Field>
          {ifsc.status === 'loading' && <p className="text-[11px] font-sans text-[#9A9080] flex items-center gap-2 -mt-2"><Loader2 size={11} className="animate-spin" /> Looking up bank…</p>}
          {ifsc.status === 'ok' && ifsc.details && <p className="text-[11px] font-sans text-[#22C55E] -mt-2">✓ {ifsc.details.BANK} — {ifsc.details.BRANCH}</p>}
          {ifsc.status === 'fail' && <p className="text-[11px] font-sans text-[#EF4444] -mt-2">Could not verify IFSC. Double-check the code.</p>}

          <p className="text-[11px] font-sans text-[#7F7566] leading-relaxed mt-2"
             style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 10 }}>
            <Shield size={11} className="inline mr-1 align-baseline" />
            Your banking details are encrypted and used solely for processing your monthly profit distributions.
          </p>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-5">
          <div
            className="rounded-[8px] p-5 flex flex-col gap-1.5"
            style={{ background: '#0F0F0F', border: '1px solid rgba(245,166,35,0.2)' }}
          >
            <p className="text-[10px] font-sans uppercase tracking-[0.1em] text-gold mb-2">Summary</p>
            <Row label="Name" value={form.full_name} />
            <Row label="PAN"  value={`${form.pan_number.slice(0,5)}9999${form.pan_number.slice(9)}`} />
            <Row label="Intended capital" value={formatINR(form.capitalPaise)} accent />
            <Row label="Tier" value={tier} />
            <Row label="Monthly payout estimate" value={`~${formatINR(monthlyPayout)}`} accent />
            <Row label="Preference" value={form.payout_preference === 'payout' ? 'Monthly Payout' : 'Reinvest (Compound)'} />
            <Row label="Lock-in" value={`${lockInMonths} months`} />
            <Row
              label="Bank"
              value={`${form.bank_name || 'Pending'} · A/C ••••${form.bank_account_number.slice(-4)}`}
            />
          </div>

          <label className="flex items-start gap-2.5 cursor-pointer">
            <input type="checkbox" checked={form.marketRiskAck} onChange={e => set('marketRiskAck', e.target.checked)} className="mt-0.5" />
            <span className="text-[12px] font-sans text-[#F0EDE6] leading-relaxed">
              I understand that all returns from Wealthon Capital Ventures are market-linked and not guaranteed. No fixed return has been promised to me.
            </span>
          </label>
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input type="checkbox" checked={form.agreementAck} onChange={e => set('agreementAck', e.target.checked)} className="mt-0.5" />
            <span className="text-[12px] font-sans text-[#F0EDE6] leading-relaxed">
              I have read and agree to the terms of the Capital Partnership Agreement as discussed with the Wealthon team.
            </span>
          </label>
        </div>
      )}

      <div className="flex items-center justify-between gap-3 pt-2">
        {step > 0 ? (
          <button
            onClick={back}
            disabled={submitting}
            className="text-[13px] font-sans px-4 py-2.5 rounded-[4px] cursor-pointer bg-transparent border"
            style={{ borderColor: 'rgba(255,255,255,0.1)', color: '#9A9080' }}
          >
            ← Back
          </button>
        ) : <span />}

        {step < STEPS.length - 1 ? (
          <button
            onClick={next}
            className="inline-flex items-center gap-2 text-[14px] font-sans px-5 py-2.5 rounded-[4px] cursor-pointer border-none"
            style={{ background: '#F5A623', color: '#080808' }}
          >
            Continue
            <ArrowRight size={14} />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center gap-2 text-[14px] font-sans px-5 py-2.5 rounded-[4px] cursor-pointer border-none disabled:opacity-50"
            style={{ background: '#F5A623', color: '#080808' }}
          >
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <ArrowRight size={14} />}
            {submitting ? 'Submitting…' : 'Submit Application'}
          </button>
        )}
      </div>

      <p className="flex items-center justify-center gap-2 text-[11px] font-sans text-[#7F7566] mt-2">
        <Shield size={11} className="text-gold" />
        Your information is encrypted and stored securely.
      </p>
    </div>
  )
}

const INPUT = 'w-full bg-transparent text-[#F0EDE6] text-[14px] font-sans font-light py-2.5 outline-none placeholder:text-[#7F7566]'
const INPUT_READONLY = INPUT + ' opacity-60 cursor-not-allowed'
const SELECT = 'w-full bg-transparent text-[#F0EDE6] text-[14px] font-sans font-light py-2.5 outline-none cursor-pointer appearance-none'

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] font-sans uppercase tracking-[0.12em] text-gold">
        {label}{required && <span className="text-[#EF4444] ml-0.5">*</span>}
      </span>
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
        {children}
      </div>
    </label>
  )
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[12px] font-sans text-[#9A9080]">{label}</span>
      <span className="text-[13px] font-sans tabular-nums" style={{ color: accent ? '#F5A623' : '#F0EDE6', fontWeight: accent ? 500 : 400 }}>{value}</span>
    </div>
  )
}

function SuccessView({ form, monthlyPayout, firstPayoutDate, lockInMonths, rateLabel }: {
  form: FormState; monthlyPayout: number; firstPayoutDate: Date; lockInMonths: number; rateLabel: string
}) {
  return (
    <div className="flex flex-col items-center text-center gap-6 py-8">
      <Image src="/compass.png" alt="" width={84} height={84} className="opacity-80" />
      <h1 className="font-serif text-[32px] sm:text-[40px] text-[#F0EDE6] leading-tight">
        Application submitted<span className="text-gold">.</span>
      </h1>
      <p className="text-[15px] font-sans font-light text-[#9A9080] max-w-[480px]">
        Thank you, <span className="text-[#F0EDE6]">{form.full_name.split(' ')[0]}</span>.
      </p>

      <div
        className="rounded-[10px] p-6 w-full max-w-[460px]"
        style={{ background: 'rgba(245,166,35,0.06)', border: '1px solid rgba(245,166,35,0.3)' }}
      >
        <p className="text-[10px] font-sans uppercase tracking-[0.1em] text-gold mb-2">Your estimated monthly payout</p>
        <p className="font-dm-serif text-[40px] text-gold leading-none mb-3">{formatINR(monthlyPayout)}</p>
        <p className="text-[12px] font-sans text-[#9A9080]">
          Once your <span className="text-[#F0EDE6]">{formatINR(form.capitalPaise)}</span> is confirmed
          and your {lockInMonths}-month lock-in completes.
        </p>
        <p className="text-[11px] font-sans text-[#7F7566] mt-2">Based on {rateLabel} current rate.</p>
      </div>

      <div className="text-left w-full max-w-[460px] flex flex-col gap-3">
        <p className="text-[11px] font-sans uppercase tracking-[0.1em] text-gold">What happens next</p>
        {[
          'Prathik will confirm receipt of your capital — usually within 24 hours.',
          `Your ${lockInMonths}-month lock-in begins on confirmation date.`,
          `Your first payout will be sent on ${firstPayoutDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}.`,
          'You’ll receive login access to your personal dashboard.',
        ].map((s, i) => (
          <p key={i} className="text-[13px] font-sans text-[#9A9080] leading-relaxed flex gap-3">
            <span className="text-gold font-medium flex-shrink-0">{i + 1}.</span>
            <span>{s}</span>
          </p>
        ))}
      </div>

      <div className="flex items-center gap-3 flex-wrap justify-center mt-2">
        <a
          href="https://wa.me/919035373664"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-[13px] font-sans px-4 py-2 rounded-[4px]"
          style={{ background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.3)', color: '#F5A623' }}
        >
          <MessageCircle size={13} />
          Questions? WhatsApp Prathik
        </a>
        <Link href="/" className="text-[13px] font-sans text-[#9A9080] hover:text-[#F0EDE6] transition-colors">
          Back to homepage →
        </Link>
      </div>

      <p className="flex items-center justify-center gap-2 text-[11px] font-sans text-[#7F7566] mt-2">
        <CheckCircle2 size={11} className="text-gold" />
        Reference confirmed
      </p>
    </div>
  )
}
