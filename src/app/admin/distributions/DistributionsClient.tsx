'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getDistributionRun, markPartnerPaid, confirmDistributionRun } from '@/lib/admin/distributions'
import { PARTNER_PROFIT_SHARE, getCurrentQuarter } from '@/config/constants'
import { StepIndicator } from '@/components/admin/StepIndicator'
import { StatusPill } from '@/components/shared/StatusPill'
import { formatINR } from '@/lib/utils'
import { CONTENT } from '@/config/content'
import { type Column } from '@/components/admin/DataTable'
import { SelectPeriodStep } from './steps/SelectPeriodStep'
import { ReviewStep, type ReportWithPartner } from './steps/ReviewStep'
import { CompleteStep } from './steps/CompleteStep'

const C = CONTENT.admin.distributions

const CURRENT_YEAR    = new Date().getFullYear()
const CURRENT_QUARTER = getCurrentQuarter()

export function DistributionsClient() {
  const [step, setStep]           = useState(0)
  const [quarter, setQuarter]     = useState(CURRENT_QUARTER)
  const [year, setYear]           = useState(CURRENT_YEAR)
  const [reports, setReports]     = useState<ReportWithPartner[]>([])
  const [payingIds, setPayingIds] = useState<Set<string>>(new Set())
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState<string | null>(null)

  async function loadRun() {
    setLoading(true); setError(null)
    const supabase = createClient()
    const res = await getDistributionRun(supabase, quarter, year)
    if (res.error) { setError(res.error); setLoading(false); return }
    setReports((res.data ?? []) as ReportWithPartner[])
    setLoading(false)
    setStep(1)
  }

  async function handleMarkPaid(report: ReportWithPartner) {
    const amount = Math.round(report.gross_profit * PARTNER_PROFIT_SHARE)
    setPayingIds(s => new Set(s).add(report.id))
    const supabase = createClient()
    const res = await markPartnerPaid(supabase, report.id, report.partner_id, amount)
    setPayingIds(s => { const next = new Set(s); next.delete(report.id); return next })
    if (res.error) {
      setError(res.error)
    } else {
      setReports(rs => rs.map(r => r.id === report.id
        ? { ...r, distribution_status: 'paid', distribution_amount: amount }
        : r
      ))
    }
  }

  async function handleConfirmAll() {
    setLoading(true)
    const supabase = createClient()
    const res = await confirmDistributionRun(supabase, quarter, year)
    setLoading(false)
    if (res.error) { setError(res.error); return }
    setStep(2)
  }

  const totalPayout  = reports.reduce((s, r) => s + Math.round((r.gross_profit ?? 0) * PARTNER_PROFIT_SHARE), 0)
  const paidCount    = reports.filter(r => r.distribution_status === 'paid').length
  const pendingCount = reports.filter(r => r.distribution_status !== 'paid').length

  const columns: Column<ReportWithPartner>[] = [
    {
      key: 'partner_id', label: C.columns.partner,
      render: r => (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-sans font-medium flex-shrink-0"
            style={{ background: 'rgba(245,166,35,0.12)', color: '#F5A623' }}>
            {r.partners?.initials ?? '?'}
          </div>
          <div>
            <p className="text-[13px] font-sans text-[#F0EDE6]">{r.partners?.full_name ?? '—'}</p>
            <StatusPill status={r.partners?.tier ?? ''} />
          </div>
        </div>
      ),
    },
    {
      key: 'opening_balance', label: C.columns.invested, sortable: true,
      render: r => <span className="tabular-nums text-[13px] font-sans text-[#9A9080]">{formatINR(r.partners?.invested_amount ?? 0)}</span>,
    },
    {
      key: 'gross_profit', label: C.columns.pnl, sortable: true,
      render: r => (
        <span className={`tabular-nums text-[13px] font-sans ${(r.gross_profit ?? 0) >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
          {formatINR(r.gross_profit ?? 0)}
        </span>
      ),
    },
    {
      key: 'distribution_amount', label: C.columns.amount, sortable: true,
      render: r => (
        <span className="tabular-nums text-[13px] font-sans text-[#F5A623] font-medium">
          {formatINR(Math.round((r.gross_profit ?? 0) * PARTNER_PROFIT_SHARE))}
        </span>
      ),
    },
    {
      key: 'distribution_status', label: C.columns.status,
      render: r => <StatusPill status={r.distribution_status} />,
    },
    {
      key: 'actions' as keyof ReportWithPartner, label: C.columns.action,
      render: r => r.distribution_status === 'paid' ? (
        <span className="text-[12px] font-sans text-[#22C55E]">Paid</span>
      ) : (
        <button
          onClick={() => handleMarkPaid(r)}
          disabled={payingIds.has(r.id)}
          className="text-[12px] font-sans px-3 py-1.5 rounded-[4px] cursor-pointer border-none disabled:opacity-50"
          style={{ background: 'rgba(245,166,35,0.1)', color: '#F5A623' }}
        >
          {payingIds.has(r.id) ? '…' : C.markPaid}
        </button>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6 max-w-[1000px]">
      <StepIndicator steps={C.steps} currentStep={step} />

      {step === 0 && (
        <SelectPeriodStep
          quarter={quarter} year={year}
          loading={loading} error={error}
          onQuarterChange={setQuarter}
          onYearChange={setYear}
          onProceed={loadRun}
        />
      )}

      {step === 1 && (
        <ReviewStep
          reports={reports} columns={columns}
          totalPayout={totalPayout} paidCount={paidCount} pendingCount={pendingCount}
          quarter={quarter} year={year}
          loading={loading} error={error}
          onBack={() => setStep(0)}
          onConfirmAll={handleConfirmAll}
        />
      )}

      {step === 2 && (
        <CompleteStep
          quarter={quarter} year={year} totalPayout={totalPayout}
          onReset={() => { setStep(0); setReports([]) }}
        />
      )}
    </div>
  )
}
