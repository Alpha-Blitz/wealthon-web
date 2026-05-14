'use client'

import { useState, useMemo } from 'react'
import { Check, Loader2, ExternalLink, AlertCircle, MessageCircle, Mail } from 'lucide-react'
import { Modal } from './Modal'
import { StepIndicator } from './StepIndicator'
import { FormField, inputStyle, selectStyle, textareaStyle } from './FormField'
import { createClient } from '@/lib/supabase/client'
import { onboardPartner, type OnboardResult } from '@/lib/admin/partners'
import { sendTransactionNotification, markWhatsappSent } from '@/lib/admin/notifications'
import { calculateDistribution, calculateLockInExpiry, getFirstPayoutDate } from '@/lib/admin/calculations'
import { getCurrentRate } from '@/lib/admin/rates'
import { formatINR } from '@/lib/utils'
import {
  PARTNER_TIERS,
  LOCK_IN_OPTIONS, PAYOUT_OPTIONS, INDIAN_STATES,
  PAN_REGEX, PIN_REGEX, IFSC_REGEX,
  QUARTERLY_RATE_DEFAULT,
} from '@/config/constants'
import type { LockInPeriodValue, QuarterlyRate } from '@/types/database'

const STEPS = ['Identity', 'Capital', 'Banking', 'Agreement'] as const

interface IfscDetails {
  BANK:   string
  BRANCH: string
  CITY?:  string
  STATE?: string
}

interface FormState {
  // Identity
  full_name:           string
  date_of_birth:       string
  pan_number:          string
  phone:               string
  email:               string
  residential_address: string
  city:                string
  state:               string
  pin_code:            string
  // Capital
  capital_rupees:      string
  contribution_date:   string
  lock_in_period:      LockInPeriodValue
  payout_preference:   'payout' | 'reinvest'
  profit_share_ratio:  string
  // Banking
  account_holder_name: string
  bank_account_number: string
  bank_account_confirm: string
  bank_ifsc:           string
  bank_name:           string
  // Agreement
  agreementConfirmed:  boolean
  capitalConfirmed:    boolean
}

const EMPTY: FormState = {
  full_name: '', date_of_birth: '', pan_number: '', phone: '+91', email: '',
  residential_address: '', city: '', state: 'Karnataka', pin_code: '',
  capital_rupees: '', contribution_date: new Date().toISOString().split('T')[0],
  lock_in_period: '6_months', payout_preference: 'payout', profit_share_ratio: '75',
  account_holder_name: '', bank_account_number: '', bank_account_confirm: '',
  bank_ifsc: '', bank_name: '',
  agreementConfirmed: false, capitalConfirmed: false,
}

function tierForAmount(paise: number): 'L1' | 'L2' | 'L3' | 'L4' {
  let match: 'L1' | 'L2' | 'L3' | 'L4' = 'L1'
  for (const [key, def] of Object.entries(PARTNER_TIERS)) {
    if (paise >= def.minAmount) {
      match = key as 'L1' | 'L2' | 'L3' | 'L4'
    }
  }
  return match
}

interface Props {
  isOpen:  boolean
  onClose: () => void
  onCreated: (result: OnboardResult) => void
  currentRate?: QuarterlyRate | null
}

export function PartnerOnboardingModal({ isOpen, onClose, onCreated, currentRate }: Props) {
  const [step, setStep]     = useState(0)
  const [form, setForm]     = useState<FormState>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState<string | null>(null)
  const [ifsc, setIfsc]     = useState<{ status: 'idle' | 'loading' | 'ok' | 'fail'; details?: IfscDetails }>({ status: 'idle' })
  const [result, setResult] = useState<OnboardResult | null>(null)
  const [rate, setRate]     = useState<QuarterlyRate | null>(currentRate ?? null)
  const [sending, setSending] = useState<{ email?: boolean; emailSent?: boolean; whatsappUrl?: string | null; waSent?: boolean }>({})

  // Ensure rate loaded
  async function ensureRate() {
    if (rate) return rate
    const supabase = createClient()
    const r = await getCurrentRate(supabase)
    if (r.data) {
      setRate(r.data)
      return r.data
    }
    return null
  }

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const capitalPaise = useMemo(() => {
    const n = Number(form.capital_rupees)
    return isNaN(n) || n <= 0 ? 0 : Math.round(n * 100)
  }, [form.capital_rupees])

  const tier = capitalPaise > 0 ? tierForAmount(capitalPaise) : 'L1'

  const effectiveRate = rate?.monthly_rate ?? QUARTERLY_RATE_DEFAULT
  const profitShare = Number(form.profit_share_ratio) || 75
  const estDistribution = capitalPaise > 0
    ? calculateDistribution(capitalPaise, effectiveRate, profitShare)
    : 0

  const lockInExpiryDate = useMemo(() => {
    if (!form.contribution_date || form.lock_in_period === 'flexible') return null
    return calculateLockInExpiry(new Date(form.contribution_date), form.lock_in_period)
  }, [form.contribution_date, form.lock_in_period])

  const firstPayoutDate = useMemo(() => {
    if (!form.contribution_date) return null
    return getFirstPayoutDate(new Date(form.contribution_date))
  }, [form.contribution_date])

  // ── Validation per step ──────────────────────────────────────────────
  function validateStep(s: number): string | null {
    if (s === 0) {
      if (!form.full_name.trim()) return 'Full name required'
      if (!form.date_of_birth)    return 'Date of birth required'
      if (!PAN_REGEX.test(form.pan_number.toUpperCase())) return 'PAN must match format AAAAA9999A'
      if (!form.phone || form.phone.length < 10) return 'WhatsApp number required'
      if (!form.email.includes('@')) return 'Valid email required'
      if (!form.residential_address.trim()) return 'Address required'
      if (!form.city.trim()) return 'City required'
      if (!form.state) return 'State required'
      if (!PIN_REGEX.test(form.pin_code)) return 'PIN must be 6 digits'
    }
    if (s === 1) {
      if (capitalPaise <= 0) return 'Capital contribution must be > 0'
      if (!form.contribution_date) return 'Contribution date required'
      const ps = Number(form.profit_share_ratio)
      if (isNaN(ps) || ps < 50 || ps > 100) return 'Profit share must be between 50 and 100'
    }
    if (s === 2) {
      if (!form.account_holder_name.trim()) return 'Account holder name required'
      if (!form.bank_account_number || form.bank_account_number.length < 6) return 'Account number required'
      if (form.bank_account_number !== form.bank_account_confirm) return 'Account numbers do not match'
      if (!IFSC_REGEX.test(form.bank_ifsc.toUpperCase())) return 'IFSC must match format AAAA0XXXXXX'
    }
    if (s === 3) {
      if (!form.agreementConfirmed) return 'Confirm agreement signed'
      if (!form.capitalConfirmed)   return 'Confirm capital received'
    }
    return null
  }

  function next() {
    const e = validateStep(step)
    if (e) { setError(e); return }
    setError(null)
    if (step === 0) {
      setForm(f => ({ ...f, account_holder_name: f.account_holder_name || f.full_name }))
    }
    if (step === 1) {
      ensureRate()
    }
    setStep(s => Math.min(s + 1, STEPS.length - 1))
  }

  function back() {
    setError(null)
    setStep(s => Math.max(s - 1, 0))
  }

  async function lookupIfsc(code: string) {
    if (!IFSC_REGEX.test(code.toUpperCase())) {
      setIfsc({ status: 'idle' })
      return
    }
    setIfsc({ status: 'loading' })
    try {
      const res = await fetch(`https://ifsc.razorpay.com/${code.toUpperCase()}`)
      if (!res.ok) throw new Error('IFSC not found')
      const data = (await res.json()) as IfscDetails
      setIfsc({ status: 'ok', details: data })
      set('bank_name', data.BANK ?? '')
    } catch {
      setIfsc({ status: 'fail' })
    }
  }

  // ── Submit ────────────────────────────────────────────────────────────
  async function handleSubmit() {
    const e = validateStep(3)
    if (e) { setError(e); return }
    setSaving(true); setError(null)
    const supabase = createClient()
    const lockInExpiryISO = lockInExpiryDate
      ? lockInExpiryDate.toISOString().split('T')[0]
      : null
    const now = new Date().toISOString()

    const res = await onboardPartner(supabase, {
      full_name:    form.full_name.trim(),
      email:        form.email.trim(),
      phone:        form.phone.trim(),
      tier,
      invested_amount:     capitalPaise,
      entry_date:          form.contribution_date,
      status:              'active',
      date_of_birth:       form.date_of_birth,
      pan_number:          form.pan_number.toUpperCase(),
      residential_address: form.residential_address,
      city:                form.city,
      state:               form.state,
      pin_code:            form.pin_code,
      bank_account_number: form.bank_account_number,
      bank_ifsc:           form.bank_ifsc.toUpperCase(),
      bank_name:           form.bank_name,
      account_holder_name: form.account_holder_name,
      profit_share_ratio:  profitShare,
      lock_in_period:      form.lock_in_period,
      lock_in_expiry:      lockInExpiryISO,
      payout_preference:   form.payout_preference,
      contribution_date:   form.contribution_date,
      risk_disclosure_acknowledged_at: now,
      terms_acknowledged_at:           now,
      capital_contribution_paise:      capitalPaise,
    })
    setSaving(false)
    if (res.error || !res.data) {
      setError(res.error ?? 'Failed to create partner')
      return
    }
    setResult(res.data)
    onCreated(res.data)
  }

  async function handleSendEmail() {
    if (!result?.transactionId) return
    setSending(s => ({ ...s, email: true }))
    const supabase = createClient()
    const res = await sendTransactionNotification(supabase, result.transactionId)
    setSending(s => ({
      ...s,
      email: false,
      emailSent: res.data?.emailSent ?? false,
      whatsappUrl: res.data?.whatsappUrl ?? null,
    }))
  }

  async function handleWhatsApp() {
    if (!sending.whatsappUrl || !result?.transactionId) return
    window.open(sending.whatsappUrl, '_blank', 'noopener,noreferrer')
    const supabase = createClient()
    await markWhatsappSent(supabase, result.transactionId)
    setSending(s => ({ ...s, waSent: true }))
  }

  function handleClose() {
    setForm(EMPTY)
    setStep(0)
    setResult(null)
    setError(null)
    setIfsc({ status: 'idle' })
    setSending({})
    onClose()
  }

  // ── Success view ──────────────────────────────────────────────────────
  if (result) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title="Partner created" size="md">
        <div className="flex flex-col gap-5 items-center text-center py-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)' }}
          >
            <Check size={28} className="text-[#22C55E]" />
          </div>
          <div>
            <h3 className="font-serif text-[22px] text-[#F0EDE6] mb-1">{result.partner.full_name} onboarded</h3>
            <p className="text-[13px] font-sans text-[#9A9080]">
              {result.invoiceNumber ? `Capital receipt: ${result.invoiceNumber}` : 'Capital receipt pending'}
            </p>
          </div>

          {result.invoiceUrl && (
            <a
              href={result.invoiceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[13px] font-sans text-gold hover:text-gold-secondary"
            >
              <ExternalLink size={13} />
              Open receipt
            </a>
          )}

          <div
            className="w-full rounded-[6px] p-3 text-left flex flex-col gap-1"
            style={{ background: '#0F0F0F', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <p className="text-[11px] font-sans text-[#7F7566] uppercase tracking-[0.08em]">Notification</p>
            {sending.emailSent && (
              <p className="text-[12px] font-sans text-[#22C55E]">✓ Email sent to {result.partner.email}</p>
            )}
            {sending.waSent && (
              <p className="text-[12px] font-sans text-[#22C55E]">✓ WhatsApp opened</p>
            )}
            {!sending.emailSent && !sending.waSent && (
              <p className="text-[12px] font-sans text-[#9A9080]">
                Send the partner their welcome message + receipt.
              </p>
            )}
          </div>

          <div className="flex gap-2 w-full justify-end">
            {!sending.emailSent && (
              <button
                onClick={handleSendEmail}
                disabled={sending.email}
                className="inline-flex items-center gap-1.5 text-[13px] font-sans px-4 py-2 rounded-[4px] cursor-pointer border-none disabled:opacity-50"
                style={{ background: 'rgba(245,166,35,0.12)', color: '#F5A623' }}
              >
                {sending.email ? <Loader2 size={12} className="animate-spin" /> : <Mail size={12} />}
                Send Email
              </button>
            )}
            {sending.whatsappUrl && !sending.waSent && (
              <button
                onClick={handleWhatsApp}
                className="inline-flex items-center gap-1.5 text-[13px] font-sans px-4 py-2 rounded-[4px] cursor-pointer border-none"
                style={{ background: '#F5A623', color: '#080808' }}
              >
                <MessageCircle size={12} />
                Open WhatsApp
              </button>
            )}
            <button
              onClick={handleClose}
              className="text-[13px] font-sans px-4 py-2 rounded-[4px] cursor-pointer bg-transparent"
              style={{ border: '1px solid rgba(245,166,35,0.3)', color: '#F5A623' }}
            >
              Done
            </button>
          </div>
        </div>
      </Modal>
    )
  }

  // ── Form view ─────────────────────────────────────────────────────────
  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Onboard Partner — ${STEPS[step]}`}
      size="lg"
      footer={
        <>
          {step > 0 && (
            <button
              onClick={back}
              disabled={saving}
              className="px-5 py-2.5 rounded-[4px] text-[13px] font-sans cursor-pointer bg-transparent border"
              style={{ borderColor: 'rgba(255,255,255,0.1)', color: '#9A9080' }}
            >
              ← Back
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button
              onClick={next}
              disabled={saving}
              className="px-5 py-2.5 rounded-[4px] text-[14px] font-sans cursor-pointer border-none disabled:opacity-50"
              style={{ background: '#F5A623', color: '#080808' }}
            >
              Continue →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="px-5 py-2.5 rounded-[4px] text-[14px] font-sans cursor-pointer border-none disabled:opacity-50"
              style={{ background: '#F5A623', color: '#080808' }}
            >
              {saving ? 'Creating…' : 'Create Partner'}
            </button>
          )}
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <StepIndicator steps={STEPS} currentStep={step} />

        {error && (
          <div
            className="rounded-[6px] p-3 flex items-start gap-2"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)' }}
          >
            <AlertCircle size={14} className="text-[#EF4444] flex-shrink-0 mt-0.5" />
            <p className="text-[12px] font-sans text-[#F0EDE6]">{error}</p>
          </div>
        )}

        {/* ───── STEP 1 — Identity ───── */}
        {step === 0 && (
          <div className="flex flex-col gap-3">
            <FormField label="Full legal name" required>
              <input style={inputStyle} value={form.full_name}
                onChange={e => set('full_name', e.target.value)} placeholder="As per PAN" />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Date of birth" required>
                <input type="date" style={inputStyle} value={form.date_of_birth}
                  onChange={e => set('date_of_birth', e.target.value)} />
              </FormField>
              <FormField label="PAN number" required>
                <input style={inputStyle} value={form.pan_number}
                  onChange={e => set('pan_number', e.target.value.toUpperCase())}
                  placeholder="ABCDE1234F" maxLength={10} />
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="WhatsApp number" required>
                <input type="tel" style={inputStyle} value={form.phone}
                  onChange={e => set('phone', e.target.value)} placeholder="+91 9XXXXX XXXXX" />
              </FormField>
              <FormField label="Email address" required>
                <input type="email" style={inputStyle} value={form.email}
                  onChange={e => set('email', e.target.value)} placeholder="partner@example.com" />
              </FormField>
            </div>
            <FormField label="Residential address" required>
              <textarea style={{ ...textareaStyle, minHeight: 70 }} value={form.residential_address}
                onChange={e => set('residential_address', e.target.value)}
                placeholder="Door no, building, street, locality" />
            </FormField>
            <div className="grid grid-cols-3 gap-3">
              <FormField label="City" required>
                <input style={inputStyle} value={form.city}
                  onChange={e => set('city', e.target.value)} placeholder="Bangalore" />
              </FormField>
              <FormField label="State" required>
                <select style={selectStyle} value={form.state}
                  onChange={e => set('state', e.target.value)}>
                  {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </FormField>
              <FormField label="PIN code" required>
                <input style={inputStyle} value={form.pin_code} maxLength={6}
                  onChange={e => set('pin_code', e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="560001" />
              </FormField>
            </div>
          </div>
        )}

        {/* ───── STEP 2 — Capital ───── */}
        {step === 1 && (
          <div className="flex flex-col gap-3">
            <FormField label="Capital contribution (₹)" required>
              <input
                type="number" step="1" min="0" style={inputStyle}
                value={form.capital_rupees}
                onChange={e => set('capital_rupees', e.target.value)}
                placeholder="500000" />
            </FormField>
            {capitalPaise > 0 && (
              <div
                className="rounded-[6px] p-3 flex flex-col gap-1.5"
                style={{ background: 'rgba(245,166,35,0.04)', border: '1px solid rgba(245,166,35,0.15)' }}
              >
                <p className="text-[12px] font-sans text-[#9A9080]">
                  Tier: <span className="text-gold font-medium">{tier}</span>
                </p>
                <p className="text-[12px] font-sans text-[#9A9080]">
                  Estimated quarterly distribution at {(effectiveRate * 100).toFixed(2)}%/month: <span className="text-gold font-medium">~{formatINR(estDistribution)}</span>
                </p>
                {firstPayoutDate && (
                  <p className="text-[12px] font-sans text-[#9A9080]">
                    First payout date: <span className="text-[#F0EDE6]">{firstPayoutDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  </p>
                )}
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Contribution date" required>
                <input type="date" style={inputStyle} value={form.contribution_date}
                  onChange={e => set('contribution_date', e.target.value)} />
              </FormField>
              <FormField label="Lock-in period">
                <select style={selectStyle} value={form.lock_in_period}
                  onChange={e => set('lock_in_period', e.target.value as LockInPeriodValue)}>
                  {LOCK_IN_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </FormField>
            </div>
            {lockInExpiryDate && (
              <p className="text-[12px] font-sans text-[#9A9080] -mt-2">
                Lock-in expires: <span className="text-[#F0EDE6]">{lockInExpiryDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
              </p>
            )}
            <FormField label="Payout preference">
              <div className="flex gap-2">
                {PAYOUT_OPTIONS.map(o => (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => set('payout_preference', o.value)}
                    className="flex-1 px-4 py-3 rounded-[4px] text-[13px] font-sans cursor-pointer bg-transparent text-left"
                    style={{
                      border: `1px solid ${form.payout_preference === o.value ? '#F5A623' : 'rgba(255,255,255,0.1)'}`,
                      color: form.payout_preference === o.value ? '#F5A623' : '#9A9080',
                      background: form.payout_preference === o.value ? 'rgba(245,166,35,0.08)' : 'transparent',
                    }}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </FormField>
            <FormField label="Profit share ratio (%)">
              <input type="number" min="50" max="100" step="1" style={inputStyle}
                value={form.profit_share_ratio}
                onChange={e => set('profit_share_ratio', e.target.value)} />
            </FormField>
            <p className="text-[11px] font-sans text-[#7F7566] -mt-2">
              Partner receives {profitShare}% · firm retains {100 - profitShare}%
            </p>
          </div>
        )}

        {/* ───── STEP 3 — Banking ───── */}
        {step === 2 && (
          <div className="flex flex-col gap-3">
            <FormField label="Account holder name" required>
              <input style={inputStyle} value={form.account_holder_name}
                onChange={e => set('account_holder_name', e.target.value)}
                placeholder="As per bank records" />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Bank account number" required>
                <input style={inputStyle} value={form.bank_account_number}
                  onChange={e => set('bank_account_number', e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="Account number" />
              </FormField>
              <FormField label="Confirm account number" required>
                <input style={inputStyle} value={form.bank_account_confirm}
                  onChange={e => set('bank_account_confirm', e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="Re-enter to confirm" />
              </FormField>
            </div>
            <FormField label="IFSC code" required>
              <input
                style={inputStyle}
                value={form.bank_ifsc}
                onChange={e => {
                  const v = e.target.value.toUpperCase()
                  set('bank_ifsc', v)
                  if (v.length === 11) lookupIfsc(v)
                  else setIfsc({ status: 'idle' })
                }}
                placeholder="HDFC0001234"
                maxLength={11}
              />
            </FormField>
            {ifsc.status === 'loading' && (
              <p className="text-[12px] font-sans text-[#9A9080] -mt-2 flex items-center gap-2">
                <Loader2 size={12} className="animate-spin" /> Looking up bank…
              </p>
            )}
            {ifsc.status === 'ok' && ifsc.details && (
              <p className="text-[12px] font-sans text-[#22C55E] -mt-2">
                ✓ {ifsc.details.BANK} · {ifsc.details.BRANCH}
              </p>
            )}
            {ifsc.status === 'fail' && (
              <p className="text-[12px] font-sans text-[#EF4444] -mt-2">
                Could not verify IFSC. Double-check the code.
              </p>
            )}
          </div>
        )}

        {/* ───── STEP 4 — Agreement ───── */}
        {step === 3 && (
          <div className="flex flex-col gap-4">
            <div
              className="rounded-[8px] p-5 flex flex-col gap-2"
              style={{ background: '#0F0F0F', border: '1px solid rgba(245,166,35,0.15)' }}
            >
              <p className="text-[10px] font-sans uppercase tracking-[0.08em] text-gold mb-1">Summary</p>
              <SummaryRow label="Partner" value={form.full_name} />
              <SummaryRow label="Capital" value={formatINR(capitalPaise)} accent />
              <SummaryRow label="Tier" value={tier} />
              <SummaryRow label="Rate" value={`${(effectiveRate * 100).toFixed(2)}%/month`} />
              <SummaryRow label="Quarterly distribution" value={`~${formatINR(estDistribution)}`} accent />
              <SummaryRow
                label="Lock-in"
                value={
                  lockInExpiryDate
                    ? `${LOCK_IN_OPTIONS.find(o => o.value === form.lock_in_period)?.label} (until ${lockInExpiryDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })})`
                    : 'Flexible'
                }
              />
              <SummaryRow label="Preference" value={form.payout_preference === 'payout' ? 'Quarterly Payout' : 'Reinvest (Compound)'} />
              <SummaryRow label="Profit split" value={`${profitShare}% / ${100 - profitShare}%`} />
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input type="checkbox" className="mt-0.5"
                checked={form.agreementConfirmed}
                onChange={e => set('agreementConfirmed', e.target.checked)} />
              <span className="text-[13px] font-sans text-[#F0EDE6] leading-relaxed">
                I confirm that <strong className="text-gold">{form.full_name || 'this partner'}</strong> has signed the Capital Partnership Agreement and the Risk Disclosure Statement.
              </span>
            </label>
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input type="checkbox" className="mt-0.5"
                checked={form.capitalConfirmed}
                onChange={e => set('capitalConfirmed', e.target.checked)} />
              <span className="text-[13px] font-sans text-[#F0EDE6] leading-relaxed">
                I confirm that the capital of <strong className="text-gold">{formatINR(capitalPaise)}</strong> has been received in the firm account.
              </span>
            </label>
          </div>
        )}
      </div>
    </Modal>
  )
}

function SummaryRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[12px] font-sans text-[#9A9080]">{label}</span>
      <span
        className="text-[13px] font-sans tabular-nums"
        style={{ color: accent ? '#F5A623' : '#F0EDE6', fontWeight: accent ? 500 : 400 }}
      >
        {value}
      </span>
    </div>
  )
}
