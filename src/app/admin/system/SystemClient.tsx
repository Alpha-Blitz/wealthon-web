'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { runServiceChecks, type ServiceStatus } from '@/lib/admin/system'
import { CONTENT } from '@/config/content'

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
    </div>
  )
}
