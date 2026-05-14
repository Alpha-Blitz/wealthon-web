'use client'

import { useEffect, useState } from 'react'
import { Copy, ExternalLink, Loader2, MessageCircle, Check, AlertCircle } from 'lucide-react'
import { Modal } from './Modal'
import { FormField, inputStyle } from './FormField'
import type { EnrichedLead } from '@/lib/admin/leads'

interface GeneratedToken {
  token:    string
  tokenId:  string
  expiresAt:string
  url:      string
  message:  string
  whatsappUrl: string
}

interface Props {
  isOpen:        boolean
  onClose:       () => void
  lead:          EnrichedLead | null
  defaultExpiryDays: number
  onGenerated:   (lead: EnrichedLead, token: GeneratedToken) => void
}

export function SendApplyTokenModal({ isOpen, onClose, lead, defaultExpiryDays, onGenerated }: Props) {
  const [name, setName]   = useState(lead?.name ?? '')
  const [phone, setPhone] = useState(lead?.phone ?? '')
  const [email, setEmail] = useState(lead?.email ?? '')
  const [expiry, setExpiry] = useState(defaultExpiryDays)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [token, setToken] = useState<GeneratedToken | null>(null)
  const [copied, setCopied] = useState(false)

  // Sync form fields when a new lead becomes active or modal opens
  useEffect(() => {
    if (isOpen && lead) {
      setName(lead.name)
      setPhone(lead.phone ?? '')
      setEmail(lead.email ?? '')
      setExpiry(defaultExpiryDays)
      setToken(null)
      setError(null)
      setCopied(false)
    }
  }, [isOpen, lead, defaultExpiryDays])

  async function handleGenerate() {
    if (!lead) return
    setGenerating(true); setError(null)
    try {
      const res = await fetch('/api/admin/generate-apply-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: lead.id,
          prospectName: name,
          prospectWhatsapp: phone,
          prospectEmail: email,
          expiryDays: expiry,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Failed to generate'); setGenerating(false); return }
      setToken(data)
      onGenerated(lead, data)
    } catch {
      setError('Network error')
    } finally {
      setGenerating(false)
    }
  }

  async function copyUrl() {
    if (!token) return
    try {
      await navigator.clipboard.writeText(token.url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }

  function handleClose() {
    setToken(null)
    setError(null)
    setCopied(false)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={token ? 'Onboarding link generated' : `Send onboarding form to ${lead?.name ?? ''}`}
      size="md"
    >
      {!lead ? null : !token ? (
        <div className="flex flex-col gap-3">
          <FormField label="Prospect name" required>
            <input className={inputStyle as unknown as string} style={inputStyle} value={name} onChange={e => setName(e.target.value)} />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="WhatsApp" required>
              <input style={inputStyle} value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 9XXXXX XXXXX" />
            </FormField>
            <FormField label="Email" required>
              <input type="email" style={inputStyle} value={email} onChange={e => setEmail(e.target.value)} />
            </FormField>
          </div>
          <FormField label={`Expiry (days, default ${defaultExpiryDays})`}>
            <input type="number" min={1} max={90} style={inputStyle} value={expiry} onChange={e => setExpiry(Number(e.target.value) || defaultExpiryDays)} />
          </FormField>

          {error && (
            <div className="rounded-[6px] p-2.5 flex items-start gap-2"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)' }}>
              <AlertCircle size={14} className="text-[#EF4444] flex-shrink-0 mt-0.5" />
              <p className="text-[12px] font-sans text-[#F0EDE6]">{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-2 mt-2">
            <button onClick={handleClose}
              className="px-4 py-2 text-[13px] font-sans rounded-[4px] cursor-pointer bg-transparent"
              style={{ border: '1px solid rgba(255,255,255,0.1)', color: '#9A9080' }}>
              Cancel
            </button>
            <button onClick={handleGenerate} disabled={generating}
              className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-sans rounded-[4px] cursor-pointer border-none disabled:opacity-50"
              style={{ background: '#F5A623', color: '#080808' }}>
              {generating ? <Loader2 size={12} className="animate-spin" /> : null}
              Generate Secure Link
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-[13px] font-sans text-[#9A9080]">
            Share this private link with {lead.name}. It expires in {expiry} day{expiry === 1 ? '' : 's'} and can only be used once.
          </p>

          {/* URL with copy */}
          <div className="rounded-[6px] p-3 flex items-center gap-2"
            style={{ background: '#0F0F0F', border: '1px solid rgba(245,166,35,0.2)' }}>
            <code className="flex-1 text-[12px] font-mono text-gold truncate">{token.url}</code>
            <button onClick={copyUrl}
              className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-sans rounded-[3px] cursor-pointer border-none"
              style={{ background: copied ? 'rgba(34,197,94,0.12)' : 'rgba(245,166,35,0.1)', color: copied ? '#22C55E' : '#F5A623' }}>
              {copied ? <Check size={11} /> : <Copy size={11} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>

          {/* WhatsApp message preview */}
          <div>
            <p className="text-[10px] font-sans uppercase tracking-[0.1em] text-gold mb-2 flex items-center gap-1.5">
              <MessageCircle size={11} /> WhatsApp Message
            </p>
            <pre className="text-[12px] font-mono text-[#F0EDE6] whitespace-pre-wrap rounded-[6px] p-3"
              style={{ background: '#0F0F0F', border: '1px solid rgba(255,255,255,0.06)' }}>{token.message}</pre>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={handleClose}
              className="px-4 py-2 text-[13px] font-sans rounded-[4px] cursor-pointer bg-transparent"
              style={{ border: '1px solid rgba(255,255,255,0.1)', color: '#9A9080' }}>
              Done
            </button>
            <a href={token.whatsappUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-sans rounded-[4px] cursor-pointer border-none"
              style={{ background: '#F5A623', color: '#080808' }}>
              <ExternalLink size={12} />
              Open WhatsApp
            </a>
          </div>
        </div>
      )}
    </Modal>
  )
}
