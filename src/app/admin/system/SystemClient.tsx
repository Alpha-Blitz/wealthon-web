'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2, AlertCircle, RefreshCw, Send, Eye, Loader2, MessageCircle, Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { runServiceChecks, type ServiceStatus } from '@/lib/admin/system'
import { CONTENT } from '@/config/content'
import { formatINR } from '@/lib/utils'

const C = CONTENT.admin.system

interface ServiceCheck { name: string; status: 'checking' | 'ok' | 'error'; detail?: string }

const SERVICE_NAMES = [C.database, C.auth, C.storage, C.website]

export function SystemClient() {
  const [services, setServices] = useState<ServiceCheck[]>(
    SERVICE_NAMES.map(name => ({ name, status: 'checking' }))
  )

  async function runChecks() {
    setServices(SERVICE_NAMES.map(name => ({ name, status: 'checking' })))
    const supabase = createClient()
    const res = await runServiceChecks(supabase)
    if (res.data) {
      setServices(res.data.map((s: ServiceStatus, i) => ({
        name:   SERVICE_NAMES[i] ?? s.name,
        status: s.ok ? 'ok' : 'error',
        detail: s.detail,
      })))
    }
  }

  useEffect(() => { runChecks() }, [])

  return (
    <div className="flex flex-col gap-6 max-w-[700px]">
      <div className="rounded-[8px] p-5"
        style={{ background: '#111111', border: '0.5px solid rgba(245,166,35,0.15)' }}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-serif text-[18px] text-[#F0EDE6]">
            {C.title}<span className="text-gold">.</span>
          </h3>
          <button onClick={runChecks}
            className="flex items-center gap-1.5 text-[12px] font-sans cursor-pointer bg-transparent border-none text-[#9A9080] hover:text-[#F5A623] transition-colors">
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {services.map(svc => (
            <div key={svc.name} className="flex items-center justify-between py-2"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <span className="text-[13px] font-sans text-[#F0EDE6]">{svc.name}</span>
              <div className="flex items-center gap-2">
                {svc.status === 'checking' ? (
                  <>
                    <div className="w-2 h-2 rounded-full bg-[#9A9080] animate-pulse" />
                    <span className="text-[12px] font-sans text-[#9A9080]">{C.checking}</span>
                  </>
                ) : svc.status === 'ok' ? (
                  <>
                    <CheckCircle2 size={14} className="text-[#22C55E]" />
                    <span className="text-[12px] font-sans text-[#22C55E]">{C.ok}</span>
                  </>
                ) : (
                  <>
                    <AlertCircle size={14} className="text-[#EF4444]" />
                    <span className="text-[12px] font-sans text-[#EF4444]">{svc.detail ?? C.error}</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[8px] p-5 grid grid-cols-2 gap-4"
        style={{ background: '#111111', border: '0.5px solid rgba(245,166,35,0.15)' }}>
        {[
          { label: 'Environment', value: process.env.NODE_ENV ?? 'production' },
          { label: 'Version',     value: process.env.NEXT_PUBLIC_APP_VERSION ?? '1.0.0' },
          { label: 'Region',      value: process.env.VERCEL_REGION ?? 'local' },
          { label: 'Build',       value: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) },
        ].map(item => (
          <div key={item.label}>
            <p className="text-[11px] font-sans uppercase tracking-[0.08em] text-[#68625A] mb-1">{item.label}</p>
            <p className="text-[13px] font-mono text-[#F0EDE6]">{item.value}</p>
          </div>
        ))}
      </div>

      <ScheduledAlertsSection />
    </div>
  )
}

function ScheduledAlertsSection() {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-serif text-[18px] text-[#F0EDE6]">Scheduled Alerts<span className="text-gold">.</span></h3>
      <p className="text-[12px] font-sans text-[#9A9080] -mt-2">
        Automated emails + WhatsApp links to Suhan for monthly payouts.
        Cron runs on the 15th (summary) and 20th (full details) of each month.
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AlertCard
          type="summary"
          title="Payout Summary — 15th"
          subtitle="Partner list + amounts. No bank details."
          warning={null}
        />
        <AlertCard
          type="details"
          title="Payout Details — 20th"
          subtitle="Full bank info for processing transfers."
          warning="This email contains full bank account details."
        />
      </div>
    </div>
  )
}

interface PreviewState {
  type: 'summary' | 'details'
  monthLabel: string
  partnerCount: number
  totalPaise: number
  subject: string
  html: string
  whatsappBody: string
  whatsappUrl: string | null
}

function AlertCard({ type, title, subtitle, warning }: {
  type: 'summary' | 'details'; title: string; subtitle: string; warning: string | null
}) {
  const [busy, setBusy]       = useState<'preview' | 'send' | null>(null)
  const [preview, setPreview] = useState<PreviewState | null>(null)
  const [result, setResult]   = useState<{ partnerCount: number; totalPaise: number; emailSent: boolean; whatsappUrl: string | null } | null>(null)
  const [error, setError]     = useState<string | null>(null)

  async function call(action: 'preview' | 'send') {
    setBusy(action); setError(null)
    try {
      const res = await fetch('/api/admin/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, action }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Failed')
        setBusy(null)
        return
      }
      if (action === 'preview') {
        setPreview(data)
      } else {
        setResult(data)
      }
    } catch {
      setError('Network error')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="rounded-[8px] p-5 flex flex-col gap-3"
      style={{
        background: '#111111',
        border: warning ? '0.5px solid rgba(239,68,68,0.3)' : '0.5px solid rgba(245,166,35,0.15)',
      }}>
      <div>
        <h4 className="font-serif text-[16px] text-[#F0EDE6]">{title}</h4>
        <p className="text-[12px] font-sans text-[#9A9080] mt-1">{subtitle}</p>
      </div>
      {warning && (
        <p className="text-[11px] font-sans text-[#EF4444] flex items-center gap-1.5">
          <AlertCircle size={11} /> {warning}
        </p>
      )}
      {result && (
        <div className="rounded-[4px] p-2.5"
          style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.25)' }}>
          <p className="text-[12px] font-sans text-[#22C55E]">
            Sent · {result.partnerCount} partners · {formatINR(result.totalPaise)}
          </p>
        </div>
      )}
      {error && <p className="text-[11px] font-sans text-[#EF4444]">{error}</p>}
      <div className="flex items-center gap-2 mt-1">
        <button
          onClick={() => call('preview')}
          disabled={busy !== null}
          className="inline-flex items-center gap-1.5 text-[12px] font-sans px-3 py-2 rounded-[4px] cursor-pointer bg-transparent disabled:opacity-50"
          style={{ border: '1px solid rgba(245,166,35,0.3)', color: '#F5A623' }}
        >
          {busy === 'preview' ? <Loader2 size={12} className="animate-spin" /> : <Eye size={12} />}
          Preview
        </button>
        <button
          onClick={() => call('send')}
          disabled={busy !== null}
          className="inline-flex items-center gap-1.5 text-[12px] font-sans px-3 py-2 rounded-[4px] cursor-pointer border-none disabled:opacity-50"
          style={{ background: '#F5A623', color: '#080808' }}
        >
          {busy === 'send' ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
          Send Now
        </button>
      </div>
      {preview && (
        <PreviewModal preview={preview} onClose={() => setPreview(null)} />
      )}
    </div>
  )
}

function PreviewModal({ preview, onClose }: { preview: PreviewState; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
      <div
        className="relative w-full max-w-[720px] max-h-[88vh] flex flex-col rounded-[8px] overflow-hidden"
        style={{ background: '#111111', border: '1px solid rgba(245,166,35,0.3)' }}
      >
        <div className="px-5 py-4 flex items-center justify-between flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 className="font-serif text-[18px] text-[#F0EDE6]">
            Preview · {preview.monthLabel}
          </h3>
          <button onClick={onClose} className="text-[12px] font-sans text-[#9A9080] hover:text-[#F0EDE6] bg-transparent border-none cursor-pointer">Close</button>
        </div>
        <div className="overflow-auto flex-1 px-5 py-4 flex flex-col gap-4">
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-[12px] font-sans text-[#9A9080]">
            <span>Partners: <span className="text-[#F0EDE6]">{preview.partnerCount}</span></span>
            <span>Total: <span className="text-gold">{formatINR(preview.totalPaise)}</span></span>
          </div>

          <div>
            <p className="text-[10px] font-sans uppercase tracking-[0.1em] text-gold mb-2 flex items-center gap-1.5"><Mail size={11} /> Email</p>
            <p className="text-[12px] font-sans text-[#F0EDE6] mb-2">
              <span className="text-[#9A9080]">Subject:</span> {preview.subject}
            </p>
            <iframe
              srcDoc={preview.html}
              title="Email preview"
              className="w-full rounded-[6px]"
              style={{ height: 360, border: '1px solid rgba(255,255,255,0.08)', background: '#FFF' }}
            />
          </div>

          <div>
            <p className="text-[10px] font-sans uppercase tracking-[0.1em] text-gold mb-2 flex items-center gap-1.5"><MessageCircle size={11} /> WhatsApp</p>
            <pre className="text-[12px] font-mono text-[#F0EDE6] whitespace-pre-wrap rounded-[6px] p-3"
              style={{ background: '#0F0F0F', border: '1px solid rgba(255,255,255,0.06)' }}>{preview.whatsappBody}</pre>
            {preview.whatsappUrl && (
              <a
                href={preview.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-2 text-[12px] font-sans px-3 py-1.5 rounded-[4px]"
                style={{ background: 'rgba(245,166,35,0.1)', color: '#F5A623', border: '1px solid rgba(245,166,35,0.3)' }}
              >
                <MessageCircle size={11} /> Open in WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
