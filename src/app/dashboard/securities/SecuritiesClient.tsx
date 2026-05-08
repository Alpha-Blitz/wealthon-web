'use client'

import { useState } from 'react'
import { Shield, Award, FileText } from 'lucide-react'
import { StatusPill } from '@/components/shared/StatusPill'
import { formatINR } from '@/lib/utils'
import { CONTENT } from '@/config/content'
import type { Security } from '@/types/database'

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function fmtDate(s: string | null): string {
  if (!s) return '—'
  const d = new Date(s)
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`
}

interface Props {
  security: Security
  partnerName: string
  agreementUrl: string | null
}

export function SecuritiesClient({ security, partnerName, agreementUrl }: Props) {
  const [toast, setToast] = useState<string | null>(null)
  const C = CONTENT.securities

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 4000)
  }

  function handleDownload() {
    if (agreementUrl) {
      window.open(agreementUrl, '_blank')
    } else {
      showToast(C.documentPending)
    }
  }

  return (
    <div className="p-6 flex flex-col gap-6 max-w-[1400px] relative">

      {/* Toast */}
      {toast && (
        <div
          className="fixed top-6 right-6 z-50 max-w-[360px] px-4 py-3 rounded-[6px] text-[13px] font-sans text-[#F0EDE6] shadow-lg"
          style={{ background: '#1a1a1a', border: '1px solid rgba(245,166,35,0.3)' }}
        >
          {toast}
        </div>
      )}

      <h1 className="font-serif text-[28px] text-[#F0EDE6]">{C.title}</h1>

      {/* Two cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Agreement card */}
        <div
          className="rounded-[8px] p-6 relative"
          style={{ background: '#111111', border: '0.5px solid rgba(245,166,35,0.15)' }}
        >
          <Award size={20} className="absolute top-5 right-5 text-gold opacity-60" />

          <h3 className="font-serif text-[18px] text-[#F0EDE6] mb-6">{C.agreementTitle}</h3>

          <div className="flex flex-col gap-4 mb-6">
            {[
              { label: C.agreementMou,     value: security.mou_reference ?? '—' },
              { label: C.agreementSigned,  value: fmtDate(security.agreement_signed_date) },
              { label: C.agreementPartner, value: partnerName },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-[12px] font-sans text-[#9E9484]">{label}</span>
                <span className="text-[13px] font-sans text-[#F0EDE6]">{value}</span>
              </div>
            ))}
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-sans text-[#9E9484]">Status</span>
              <StatusPill status={security.status} />
            </div>
          </div>

          <button
            onClick={handleDownload}
            className="w-full py-2.5 rounded-[4px] text-[13px] font-sans text-gold border border-[rgba(245,166,35,0.4)] hover:bg-[rgba(245,166,35,0.06)] transition-colors cursor-pointer bg-transparent"
          >
            {C.downloadPdf}
          </button>
        </div>

        {/* Security / Collateral card */}
        <div
          className="rounded-[8px] p-6 relative"
          style={{ background: '#111111', border: '0.5px solid rgba(245,166,35,0.15)' }}
        >
          <Shield size={20} className="absolute top-5 right-5 text-gold opacity-60" />

          <h3 className="font-serif text-[18px] text-[#F0EDE6] mb-6">{C.securityTitle}</h3>

          <div className="flex flex-col gap-4 mb-6">
            {[
              { label: C.chequeAmount, value: security.cheque_amount ? formatINR(security.cheque_amount) : '—' },
              { label: C.chequeDate,   value: fmtDate(security.cheque_date) },
              { label: C.chequeRef,    value: security.cheque_reference ?? '—' },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-[12px] font-sans text-[#9E9484]">{label}</span>
                <span className="text-[13px] font-sans text-[#F0EDE6]">{value}</span>
              </div>
            ))}
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-sans text-[#9E9484]">Status</span>
              <StatusPill status={security.cheque_status} labelOverride="Held as collateral" />
            </div>
          </div>

          <button
            onClick={() => showToast('Detailed view coming soon.')}
            className="w-full py-2.5 rounded-[4px] text-[13px] font-sans text-[#9E9484] border border-[rgba(255,255,255,0.1)] hover:text-[#F0EDE6] hover:border-[rgba(255,255,255,0.2)] transition-colors cursor-pointer bg-transparent"
          >
            {C.viewDetails}
          </button>
        </div>
      </div>

      {/* Document history */}
      <div
        className="rounded-[8px] overflow-hidden"
        style={{ border: '0.5px solid rgba(245,166,35,0.15)' }}
      >
        <div
          className="grid px-4 py-3 text-[11px] font-sans uppercase tracking-[0.08em]"
          style={{
            background: '#0F0F0F',
            color: '#F5A623',
            gridTemplateColumns: '1fr 140px 120px 80px',
          }}
        >
          {[C.columns.document, C.columns.date, C.columns.type, C.columns.download].map(col => (
            <span key={col}>{col}</span>
          ))}
        </div>

        {[
          { doc: 'Capital Partnership Agreement', date: fmtDate(security.agreement_signed_date), type: 'PDF' },
          { doc: 'MoU — ' + (security.mou_reference ?? 'WCV-2025-001'),  date: fmtDate(security.agreement_signed_date), type: 'PDF' },
          { doc: 'Security Cheque Record',         date: fmtDate(security.cheque_date),           type: 'Record' },
        ].map((row, i) => (
          <div
            key={row.doc}
            className="grid px-4 py-3 items-center text-[14px] font-sans"
            style={{
              gridTemplateColumns: '1fr 140px 120px 80px',
              background: i % 2 === 0 ? '#111111' : '#0D0D0D',
              borderTop: '1px solid rgba(255,255,255,0.04)',
            }}
          >
            <span className="flex items-center gap-2 text-[#F0EDE6] text-[13px]">
              <FileText size={14} className="text-[#68625A]" />
              {row.doc}
            </span>
            <span className="text-[#9E9484] text-[12px]">{row.date}</span>
            <span className="text-[#9E9484] text-[12px]">{row.type}</span>
            <button
              onClick={handleDownload}
              className="text-gold text-[12px] font-sans hover:text-gold-secondary transition-colors cursor-pointer bg-transparent border-none text-left"
            >
              Download
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
