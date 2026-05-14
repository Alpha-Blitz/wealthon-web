'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AlertCircle, ArrowRight, Check, CheckCircle2, Loader2, MessageCircle, Send, FileText, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import {
  getDistributionRun, confirmDistribution,
  type DistributionRun, type ProcessedDistribution, type IneligiblePartner,
} from '@/lib/admin/distributions'
import { markWhatsappSent } from '@/lib/admin/notifications'
import { MONTH_NAMES } from '@/config/constants'
import { ROUTES } from '@/config/routes'
import { StepIndicator } from '@/components/admin/StepIndicator'
import { formatINR } from '@/lib/utils'

const STEPS = ['Select Period', 'Review', 'Process', 'Complete'] as const

export function DistributionsClient() {
  const now = new Date()
  const [step, setStep]     = useState(0)
  const [month, setMonth]   = useState(now.getMonth() + 1)
  const [year, setYear]     = useState(now.getFullYear())
  const [run, setRun]       = useState<DistributionRun | null>(null)
  const [overrides, setOverrides] = useState<Record<string, number>>({})
  const [processing, setProcessing] = useState(false)
  const [processed, setProcessed] = useState<ProcessedDistribution[]>([])
  const [failed, setFailed]   = useState<{ partnerId: string; error: string }[]>([])
  const [whatsappSent, setWhatsappSent] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  async function loadPreview() {
    setLoading(true); setError(null)
    const supabase = createClient()
    const res = await getDistributionRun(supabase, month, year)
    setLoading(false)
    if (res.error || !res.data) { setError(res.error ?? 'No data'); return }
    setRun(res.data)
    setOverrides(Object.fromEntries(res.data.partners.map(p => [p.partner.id, p.calculatedAmount])))
    setStep(1)
  }

  async function handleConfirmAll() {
    if (!run) return
    if (!confirm(`Confirm ${run.monthLabel} payouts for ${run.partners.length} eligible partner${run.partners.length === 1 ? '' : 's'}?`)) return
    setStep(2)
    setProcessing(true)
    const supabase = createClient()
    const payload = run.partners.map(p => ({
      partnerId: p.partner.id,
      amount: overrides[p.partner.id] ?? p.calculatedAmount,
    }))
    const res = await confirmDistribution(supabase, run.month, run.year, payload)
    setProcessing(false)
    if (res.error || !res.data) {
      setError(res.error ?? 'Distribution failed')
      return
    }
    setProcessed(res.data.processed)
    setFailed(res.data.failed)
    setStep(3)
  }

  async function handleWhatsappClick(item: ProcessedDistribution) {
    if (!item.whatsappUrl) return
    window.open(item.whatsappUrl, '_blank')
    const supabase = createClient()
    await markWhatsappSent(supabase, item.transactionId)
    setWhatsappSent(s => new Set(s).add(item.transactionId))
  }

  return (
    <div className="flex flex-col gap-6 max-w-[1200px]">
      <StepIndicator steps={STEPS} currentStep={step} />

      {error && (
        <div
          className="rounded-[6px] p-3 flex items-center gap-2"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)' }}
        >
          <AlertCircle size={14} className="text-[#EF4444]" />
          <p className="text-[12px] font-sans text-[#F0EDE6]">{error}</p>
        </div>
      )}

      {step === 0 && (
        <Step0
          month={month} year={year}
          loading={loading}
          onMonth={setMonth} onYear={setYear}
          onProceed={loadPreview}
        />
      )}

      {step === 1 && run && (
        <Step1
          run={run}
          overrides={overrides}
          onOverride={(id, amount) => setOverrides(o => ({ ...o, [id]: amount }))}
          onBack={() => { setStep(0); setRun(null) }}
          onConfirmAll={handleConfirmAll}
        />
      )}

      {step === 2 && (
        <Step2 processing={processing} />
      )}

      {step === 3 && run && (
        <Step3
          run={run}
          processed={processed}
          failed={failed}
          whatsappSent={whatsappSent}
          onWhatsappClick={handleWhatsappClick}
          onReset={() => {
            setStep(0); setRun(null); setProcessed([]); setFailed([]); setWhatsappSent(new Set())
          }}
        />
      )}
    </div>
  )
}

// ─── Step 0: Select Period ───────────────────────────────────────────────

function Step0({
  month, year, loading, onMonth, onYear, onProceed,
}: {
  month: number; year: number; loading: boolean
  onMonth: (m: number) => void; onYear: (y: number) => void; onProceed: () => void
}) {
  return (
    <div
      className="rounded-[10px] p-6"
      style={{ background: '#111111', border: '0.5px solid rgba(245,166,35,0.15)' }}
    >
      <h3 className="font-serif text-[18px] text-[#F0EDE6] mb-1">Select period<span className="text-gold">.</span></h3>
      <p className="text-[13px] font-sans text-[#9A9080] mb-5">
        Pick the month and year to run payouts for. Only partners past their lock-in are eligible.
      </p>

      <div className="flex items-end gap-5 flex-wrap">
        <div>
          <label className="block text-[11px] font-sans uppercase tracking-[0.1em] text-[#8A8070] mb-2">Month</label>
          <select
            value={month}
            onChange={e => onMonth(Number(e.target.value))}
            className="px-4 py-2 rounded-[4px] text-[13px] font-sans cursor-pointer"
            style={{ background: '#0F0F0F', border: '1px solid rgba(245,166,35,0.3)', color: '#F5A623', minWidth: 140 }}
          >
            {MONTH_NAMES.map((name, i) => (
              <option key={name} value={i + 1}>{name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[11px] font-sans uppercase tracking-[0.1em] text-[#8A8070] mb-2">Year</label>
          <input
            type="number"
            min={2024}
            max={2100}
            value={year}
            onChange={e => onYear(Number(e.target.value))}
            className="w-32 px-3 py-2 rounded-[4px] text-[13px] font-sans"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#F0EDE6' }}
          />
        </div>
        <button
          onClick={onProceed}
          disabled={loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[4px] text-[13px] font-sans cursor-pointer border-none disabled:opacity-50"
          style={{ background: '#F5A623', color: '#080808' }}
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <ArrowRight size={14} />}
          Proceed to Review
        </button>
      </div>
    </div>
  )
}

// ─── Step 1: Review ──────────────────────────────────────────────────────

function Step1({
  run, overrides, onOverride, onBack, onConfirmAll,
}: {
  run: DistributionRun
  overrides: Record<string, number>
  onOverride: (id: string, amount: number) => void
  onBack: () => void
  onConfirmAll: () => void
}) {
  const ratePct = run.ratePct.toFixed(2)
  const total = Object.values(overrides).reduce((s, v) => s + v, 0)
  const rateSourceLabel = run.rateSource === 'quarterly' ? 'quarterly rate' : 'default rate'

  return (
    <>
      <div
        className="rounded-[10px] p-5 flex items-center justify-between flex-wrap gap-4"
        style={{
          background: 'linear-gradient(120deg, rgba(245,166,35,0.08), rgba(245,166,35,0.02))',
          border: '0.5px solid rgba(245,166,35,0.3)',
        }}
      >
        <div>
          <p className="text-[11px] font-sans uppercase tracking-[0.1em] text-gold mb-1">
            {run.monthLabel} Payout Run
          </p>
          <p className="text-[13px] font-sans text-[#F0EDE6]">
            Rate: {ratePct}%/month <span className="text-[#7F7566]">({rateSourceLabel})</span>
            {' · '}Eligible partners: {run.partners.length}
            {' · '}Estimated total {formatINR(total)}
          </p>
        </div>
      </div>

      {!run.rateIsSet && (
        <div
          className="rounded-[8px] p-4 flex items-start gap-3"
          style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.3)' }}
        >
          <AlertCircle size={16} className="text-[#F59E0B] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[13px] font-sans text-[#F0EDE6]">
              No quarter-specific rate set for Q{Math.ceil(run.month / 3)} {run.year}.
            </p>
            <p className="text-[12px] font-sans text-[#9A9080] mt-1">
              Using firm default rate. <Link href={ROUTES.ADMIN.RATES} className="text-gold hover:text-gold-secondary">Set rate →</Link>
            </p>
          </div>
        </div>
      )}

      {run.partners.length === 0 ? (
        <div
          className="rounded-[10px] p-8 text-center"
          style={{ background: '#111111', border: '0.5px solid rgba(245,166,35,0.15)' }}
        >
          <Clock size={32} className="text-[#7F7566] mx-auto mb-3" />
          <p className="font-serif text-[18px] text-[#F0EDE6] mb-1">No eligible partners this month.</p>
          <p className="text-[13px] font-sans text-[#9A9080]">All active partners are still in their lock-in period.</p>
        </div>
      ) : (
        <div
          className="rounded-[10px] overflow-hidden"
          style={{ background: '#111111', border: '0.5px solid rgba(245,166,35,0.15)' }}
        >
          <table className="w-full">
            <thead>
              <tr style={{ background: '#0F0F0F' }}>
                {['PARTNER', 'TIER', 'CAPITAL', 'CALCULATED', 'OVERRIDE (₹)', 'PREF', 'STATUS'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] font-sans uppercase tracking-[0.08em] text-gold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {run.partners.map(p => (
                <tr key={p.partner.id} style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-sans font-medium flex-shrink-0"
                        style={{ background: 'rgba(245,166,35,0.12)', color: '#F5A623' }}
                      >
                        {p.partner.initials}
                      </div>
                      <span className="text-[13px] font-sans text-[#F0EDE6]">{p.partner.full_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[12px] font-sans text-[#9A9080]">{p.partner.tier}</td>
                  <td className="px-4 py-3 tabular-nums text-[13px] font-sans text-[#F0EDE6]">{formatINR(p.partner.invested_amount)}</td>
                  <td className="px-4 py-3 tabular-nums font-dm-serif text-[14px] text-gold">{formatINR(p.calculatedAmount)}</td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      value={overrides[p.partner.id] ?? p.calculatedAmount}
                      onChange={e => onOverride(p.partner.id, Math.max(0, Math.round(Number(e.target.value))))}
                      className="w-32 px-2 py-1.5 rounded-[3px] text-[13px] font-sans tabular-nums"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#F0EDE6' }}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-[10px] font-sans uppercase tracking-[0.08em] px-2 py-0.5 rounded-[3px]"
                      style={p.partner.payout_preference === 'reinvest'
                        ? { background: 'rgba(245,166,35,0.12)', color: '#F5A623' }
                        : { background: 'rgba(59,130,246,0.12)', color: '#3B82F6' }
                      }
                    >
                      {p.partner.payout_preference}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-flex items-center gap-1 text-[10px] font-sans uppercase tracking-[0.05em] px-2 py-0.5 rounded-[3px]"
                      style={{ background: 'rgba(34,197,94,0.12)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.3)' }}
                    >
                      <CheckCircle2 size={10} /> Eligible
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {run.ineligible.length > 0 && (
        <IneligibleList partners={run.ineligible} />
      )}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-[12px] font-sans text-[#9A9080]">
          {run.totals.payoutCount} payout · {run.totals.reinvestCount} reinvest · Total to distribute {formatINR(total)}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="px-4 py-2 text-[13px] font-sans rounded-[4px] bg-transparent cursor-pointer"
            style={{ border: '1px solid rgba(255,255,255,0.1)', color: '#9A9080' }}
          >
            ← Back
          </button>
          <button
            onClick={onConfirmAll}
            disabled={run.partners.length === 0}
            className="inline-flex items-center gap-2 px-5 py-2 text-[13px] font-sans rounded-[4px] cursor-pointer border-none disabled:opacity-50"
            style={{ background: '#F5A623', color: '#080808' }}
          >
            <Send size={14} />
            Confirm All →
          </button>
        </div>
      </div>
    </>
  )
}

function IneligibleList({ partners }: { partners: IneligiblePartner[] }) {
  return (
    <div
      className="rounded-[8px] p-4"
      style={{ background: '#0F0F0F', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <p className="text-[11px] font-sans uppercase tracking-[0.1em] text-[#8A8070] mb-3 flex items-center gap-2">
        <Clock size={11} /> {partners.length} partner{partners.length === 1 ? '' : 's'} not yet eligible
      </p>
      <div className="flex flex-col gap-1.5">
        {partners.map(p => (
          <div key={p.id} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-sans font-medium flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.04)', color: '#7F7566' }}
              >
                {p.initials}
              </div>
              <p className="text-[12px] font-sans text-[#9A9080] truncate">
                {p.full_name} <span className="text-[#68625A]">· {p.tier}</span>
              </p>
            </div>
            <p className="text-[11px] font-sans text-[#7F7566] flex-shrink-0">
              {p.reason === 'in_lock_in' && p.lock_in_expiry
                ? <>Eligible from {new Date(p.lock_in_expiry).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</>
                : 'No lock-in set'}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Step 2: Processing ──────────────────────────────────────────────────

function Step2({ processing }: { processing: boolean }) {
  return (
    <div
      className="rounded-[10px] p-8 flex flex-col items-center gap-4"
      style={{ background: '#111111', border: '0.5px solid rgba(245,166,35,0.15)' }}
    >
      <Loader2 size={32} className={processing ? 'animate-spin text-gold' : 'text-gold'} />
      <p className="font-serif text-[20px] text-[#F0EDE6]">Processing payouts…</p>
      <p className="text-[13px] font-sans text-[#9A9080] text-center max-w-[420px]">
        Creating transactions, generating invoices, sending emails. Please wait — do not close this tab.
      </p>
    </div>
  )
}

// ─── Step 3: Complete ────────────────────────────────────────────────────

function Step3({
  run, processed, failed, whatsappSent, onWhatsappClick, onReset,
}: {
  run: DistributionRun
  processed: ProcessedDistribution[]
  failed: { partnerId: string; error: string }[]
  whatsappSent: Set<string>
  onWhatsappClick: (p: ProcessedDistribution) => void
  onReset: () => void
}) {
  const total = processed.reduce((s, p) => s + p.amount, 0)
  const invoicesGenerated = processed.filter(p => p.invoiceNumber).length
  const emailsSent  = processed.filter(p => p.emailSent).length
  const whatsappPending = processed.filter(p => p.whatsappUrl && !whatsappSent.has(p.transactionId)).length

  return (
    <>
      <div
        className="rounded-[10px] p-6"
        style={{
          background: 'linear-gradient(120deg, rgba(34,197,94,0.08), rgba(34,197,94,0.02))',
          border: '1px solid rgba(34,197,94,0.3)',
        }}
      >
        <p className="text-[11px] font-sans uppercase tracking-[0.1em] text-[#22C55E] mb-2">{run.monthLabel} payouts complete</p>
        <p className="font-serif text-[24px] text-[#F0EDE6] mb-1">
          {processed.length} partner{processed.length === 1 ? '' : 's'} paid · {formatINR(total)} total
        </p>
        <p className="text-[13px] font-sans text-[#9A9080]">
          {invoicesGenerated} invoice{invoicesGenerated === 1 ? '' : 's'} generated · {emailsSent} email{emailsSent === 1 ? '' : 's'} sent · {whatsappPending} WhatsApp pending
        </p>
      </div>

      {failed.length > 0 && (
        <div
          className="rounded-[8px] p-4"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)' }}
        >
          <p className="text-[12px] font-sans uppercase tracking-[0.08em] text-[#EF4444] mb-2">
            {failed.length} failed
          </p>
          {failed.map(f => (
            <p key={f.partnerId} className="text-[12px] font-sans text-[#F0EDE6]">
              {f.partnerId.slice(0, 8)}: {f.error}
            </p>
          ))}
        </div>
      )}

      <div
        className="rounded-[10px] overflow-hidden"
        style={{ background: '#111111', border: '0.5px solid rgba(245,166,35,0.15)' }}
      >
        <table className="w-full">
          <thead>
            <tr style={{ background: '#0F0F0F' }}>
              {['PARTNER', 'AMOUNT', 'INVOICE', 'EMAIL', 'WHATSAPP'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-[10px] font-sans uppercase tracking-[0.08em] text-gold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {processed.map(p => {
              const sent = whatsappSent.has(p.transactionId)
              return (
                <tr key={p.transactionId} style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                  <td className="px-4 py-3 text-[13px] font-sans text-[#F0EDE6]">
                    {p.partnerId.slice(0, 8)} · {p.type}
                  </td>
                  <td className="px-4 py-3 tabular-nums font-dm-serif text-[14px] text-gold">{formatINR(p.amount)}</td>
                  <td className="px-4 py-3">
                    {p.invoiceUrl ? (
                      <a
                        href={p.invoiceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[12px] font-sans text-gold hover:text-gold-secondary"
                      >
                        <FileText size={12} />
                        {p.invoiceNumber}
                      </a>
                    ) : <span className="text-[12px] font-sans text-[#9A9080]">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    {p.emailSent ? (
                      <span className="inline-flex items-center gap-1 text-[12px] font-sans text-[#22C55E]">
                        <Check size={12} />
                        Sent
                      </span>
                    ) : (
                      <span className="text-[12px] font-sans text-[#9A9080]">
                        {p.emailError ? 'Failed' : 'Skipped'}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {p.whatsappUrl ? (
                      <button
                        onClick={() => onWhatsappClick(p)}
                        className="inline-flex items-center gap-1 text-[12px] font-sans px-3 py-1.5 rounded-[4px] cursor-pointer border-none"
                        style={sent
                          ? { background: 'rgba(34,197,94,0.12)', color: '#22C55E' }
                          : { background: '#F5A623', color: '#080808' }
                        }
                      >
                        <MessageCircle size={12} />
                        {sent ? 'Sent' : 'Open WhatsApp'}
                      </button>
                    ) : <span className="text-[12px] font-sans text-[#9A9080]">No phone</span>}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onReset}
          className="text-[13px] font-sans text-[#9A9080] hover:text-[#F0EDE6] bg-transparent border-none cursor-pointer"
        >
          ← New payout run
        </button>
        <Link
          href={ROUTES.ADMIN.FINANCIALS}
          className="text-[13px] font-sans text-gold hover:text-gold-secondary"
        >
          View in Financials →
        </Link>
      </div>
    </>
  )
}
