'use client'

import { DataTable, type Column } from '@/components/admin/DataTable'
import { formatINRCompact } from '@/lib/utils'
import { CONTENT } from '@/config/content'
import type { PnLReport } from '@/types/database'

const C = CONTENT.admin.distributions

type PartnerInfo = { full_name: string; initials: string; tier: string; invested_amount: number; status: string }
export type ReportWithPartner = PnLReport & { partners?: PartnerInfo | null }

interface Props {
  reports:      ReportWithPartner[]
  columns:      Column<ReportWithPartner>[]
  totalPayout:  number
  paidCount:    number
  pendingCount: number
  quarter:      number
  year:         number
  loading:      boolean
  error:        string | null
  onBack:       () => void
  onConfirmAll: () => void
}

export function ReviewStep({ reports, columns, totalPayout, paidCount, pendingCount, quarter, year, loading, error, onBack, onConfirmAll }: Props) {
  return (
    <>
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: C.summary.total,    value: formatINRCompact(totalPayout) },
          { label: C.summary.partners, value: `${paidCount} / ${reports.length} paid` },
          { label: C.summary.date,     value: `Q${quarter} ${year}` },
        ].map(m => (
          <div key={m.label} className="rounded-[8px] p-4"
            style={{ background: '#111111', border: '0.5px solid rgba(245,166,35,0.15)' }}>
            <p className="text-[11px] font-sans uppercase tracking-[0.08em] text-[#9A9080] mb-1">{m.label}</p>
            <p className="font-dm-serif text-[20px] text-[#F0EDE6]">{m.value}</p>
          </div>
        ))}
      </div>

      {error && <p className="text-[12px] font-sans" style={{ color: '#EF4444' }}>{error}</p>}

      <div className="rounded-[8px] overflow-hidden"
        style={{ background: '#111111', border: '0.5px solid rgba(245,166,35,0.15)' }}>
        <DataTable columns={columns} data={reports} pageSize={20} />
      </div>

      <div className="flex gap-3">
        <button onClick={onBack}
          className="text-[13px] font-sans px-4 py-2.5 rounded-[4px] cursor-pointer border-none"
          style={{ background: 'rgba(255,255,255,0.05)', color: '#9A9080' }}>
          ← Back
        </button>
        <button onClick={onConfirmAll} disabled={loading || pendingCount > 0}
          className="text-[14px] font-sans px-5 py-2.5 rounded-[4px] cursor-pointer border-none disabled:opacity-50"
          style={{ background: '#F5A623', color: '#080808' }}>
          {loading ? 'Confirming…' : C.confirmAll}
        </button>
      </div>
    </>
  )
}
