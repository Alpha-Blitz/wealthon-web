'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, Check, ExternalLink, Loader2, Mail, MessageCircle } from 'lucide-react'
import { Modal } from './Modal'
import { FormField, inputStyle } from './FormField'
import { formatINR } from '@/lib/utils'
import type { EnrichedLead } from '@/lib/admin/leads'

interface ActivateResult {
  partner:        { id: string; full_name: string }
  invoiceNumber:  string | null
  invoiceUrl:     string | null
  emailSent:      boolean
  whatsappUrl:    string | null
  lockInExpiry:   string | null
}

interface Props {
  isOpen:       boolean
  onClose:      () => void
  lead:         EnrichedLead | null
  lockInMonths: number
  onActivated:  (lead: EnrichedLead, result: ActivateResult) => void
}

export function ActivatePartnerModal({ isOpen, onClose, lead, lockInMonths, onActivated }: Props) {
  const [amountRupees, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ActivateResult | null>(null)

  useEffect(() => {
    if (isOpen && lead) {
      if (lead.intendedCapital) setAmount(String(Math.round(lead.intendedCapital / 100)))
      else setAmount('')
      setDate(new Date().toISOString().split('T')[0])
      setBusy(false)
      setError(null)
      setResult(null)
    }
  }, [isOpen, lead])

  async function handleConfirm() {
    if (!lead) return
    const n = Number(amountRupees)
    if (isNaN(n) || n <= 0) { setError('Enter a positive amount'); return }
    if (!lead.pendingPartnerId) { setError('No pending partner record for this lead'); return }
    setBusy(true); setError(null)
    try {
      const res = await fetch('/api/admin/activate-partner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partnerId: lead.pendingPartnerId,
          leadId:    lead.id,
          actualCapitalPaise: Math.round(n * 100),
          contributionDate:   date,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        setError(data.error ?? 'Failed to activate')
        setBusy(false)
        return
      }
      setResult(data as ActivateResult)
      onActivated(lead, data as ActivateResult)
    } catch {
      setError('Network error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={result ? 'Partner activated' : 'Confirm capital received'}
      size="md"
    >
      {!lead ? null : !result ? (
        <div className="flex flex-col gap-4">
          <p className="text-[13px] font-sans text-[#9A9080]">
            Confirm the actual capital received from <span className="text-[#F0EDE6]">{lead.name}</span>.
            {lead.intendedCapital && (
              <> Intended capital was <span className="text-gold">{formatINR(lead.intendedCapital)}</span>.</>
            )}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Actual capital received (₹)" required>
              <input type="number" min="0" step="1" style={inputStyle}
                value={amountRupees} onChange={e => setAmount(e.target.value)} />
            </FormField>
            <FormField label="Confirmation date" required>
              <input type="date" style={inputStyle} value={date} onChange={e => setDate(e.target.value)} />
            </FormField>
          </div>
          <p className="text-[11px] font-sans text-[#7F7566]">
            Lock-in expiry will be set to {lockInMonths} months after this date. A capital receipt PDF will be generated and the partner will receive a welcome email.
          </p>
          {error && (
            <div className="rounded-[6px] p-2.5 flex items-start gap-2"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)' }}>
              <AlertCircle size={14} className="text-[#EF4444] flex-shrink-0 mt-0.5" />
              <p className="text-[12px] font-sans text-[#F0EDE6]">{error}</p>
            </div>
          )}
          <div className="flex justify-end gap-2 mt-2">
            <button onClick={onClose}
              className="px-4 py-2 text-[13px] font-sans rounded-[4px] cursor-pointer bg-transparent"
              style={{ border: '1px solid rgba(255,255,255,0.1)', color: '#9A9080' }}>
              Cancel
            </button>
            <button onClick={handleConfirm} disabled={busy}
              className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-sans rounded-[4px] cursor-pointer border-none disabled:opacity-50"
              style={{ background: '#F5A623', color: '#080808' }}>
              {busy ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
              Confirm & Activate
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)' }}>
              <Check size={18} className="text-[#22C55E]" />
            </div>
            <div>
              <p className="font-serif text-[16px] text-[#F0EDE6]">{result.partner.full_name} is now active</p>
              {result.lockInExpiry && (
                <p className="text-[12px] font-sans text-[#9A9080]">
                  Lock-in until {new Date(result.lockInExpiry).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              )}
            </div>
          </div>
          <div className="rounded-[6px] p-3 flex flex-col gap-1.5"
            style={{ background: '#0F0F0F', border: '1px solid rgba(255,255,255,0.06)' }}>
            {result.invoiceNumber && (
              <p className="text-[12px] font-sans text-[#9A9080]">
                Capital receipt: <span className="text-gold">{result.invoiceNumber}</span>
                {result.invoiceUrl && (
                  <a href={result.invoiceUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 ml-2 text-gold hover:text-gold-secondary">
                    <ExternalLink size={10} /> Open
                  </a>
                )}
              </p>
            )}
            <p className="text-[12px] font-sans text-[#9A9080] flex items-center gap-1.5">
              <Mail size={11} className={result.emailSent ? 'text-[#22C55E]' : 'text-[#7F7566]'} />
              Welcome email {result.emailSent ? 'sent' : 'queued'}
            </p>
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <button onClick={onClose}
              className="px-4 py-2 text-[13px] font-sans rounded-[4px] cursor-pointer bg-transparent"
              style={{ border: '1px solid rgba(255,255,255,0.1)', color: '#9A9080' }}>
              Done
            </button>
            {result.whatsappUrl && (
              <a href={result.whatsappUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-sans rounded-[4px] cursor-pointer border-none"
                style={{ background: '#F5A623', color: '#080808' }}>
                <MessageCircle size={12} />
                Send Welcome WhatsApp
              </a>
            )}
          </div>
        </div>
      )}
    </Modal>
  )
}
