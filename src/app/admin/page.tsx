import { Suspense } from 'react'
import Link from 'next/link'
import { Briefcase, Users, Send, Calendar, Eye } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getAllPartners, getPartnerMetrics } from '@/lib/admin/partners'
import { getAuditLog } from '@/lib/admin/audit'
import { getLeads } from '@/lib/admin/leads'
import { getCurrentRate } from '@/lib/admin/rates'
import { calculateDistribution } from '@/lib/admin/calculations'
import { ROUTES } from '@/config/routes'
import { CONTENT } from '@/config/content'
import { MONTH_NAMES, getCurrentQuarter } from '@/config/constants'
import { AdminMetricCard } from '@/components/admin/AdminMetricCard'
import { AdminSkeleton } from '@/components/admin/AdminSkeleton'
import { AuditFeed } from '@/components/admin/AuditFeed'
import { RateOverviewWidget } from '@/components/admin/RateOverviewWidget'
import { DistributionAlertWidget } from '@/components/admin/DistributionAlertWidget'
import { StatusPill } from '@/components/shared/StatusPill'
import { formatINR } from '@/lib/utils'
import type { AuditLog, Partner } from '@/types/database'

function fmtDate(s: string) {
  const d = new Date(s)
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`
}

const C = CONTENT.admin.overview

async function OverviewContent() {
  const supabase = await createClient()

  const [metricsRes, partnersRes, auditRes, leadsRes, rateRes] = await Promise.all([
    getPartnerMetrics(supabase),
    getAllPartners(supabase),
    getAuditLog(supabase, 8),
    getLeads(supabase),
    getCurrentRate(supabase),
  ])

  const metrics    = metricsRes.data
  const allPartners = (partnersRes.data ?? []) as Partner[]
  const partners   = allPartners.slice(0, 5)
  const auditLog   = (auditRes.data ?? []) as AuditLog[]
  const leads      = leadsRes.data ?? []
  const currentRate = rateRes.data

  // Distribution alert: only render in the final 30 days of the quarter
  const now = new Date()
  const currentQuarter = getCurrentQuarter()
  const quarterEndMonth = currentQuarter * 3
  const quarterEnd = new Date(now.getFullYear(), quarterEndMonth, 0)
  const daysUntilQuarterEnd = Math.ceil(
    (quarterEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  )
  const activePartners = allPartners.filter(p => p.status === 'active')
  const estDistributionTotal = currentRate
    ? activePartners.reduce(
        (sum, p) => sum + calculateDistribution(p.invested_amount, currentRate.monthly_rate, p.profit_share_ratio ?? 75),
        0,
      )
    : 0

  const stageCounts = leads.reduce<Record<string, number>>((acc, l) => {
    acc[l.stage] = (acc[l.stage] ?? 0) + 1
    return acc
  }, {})

  const pipelineStages = [
    { key: 'new',       label: 'Lead' },
    { key: 'contacted', label: 'Conversation' },
    { key: 'qualified', label: 'Terms' },
    { key: 'proposal',  label: 'Agreement' },
    { key: 'converted', label: 'Active' },
  ]
  const maxCount = Math.max(...Object.values(stageCounts), 1)

  return (
    <div className="flex flex-col gap-6">

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <AdminMetricCard icon={Briefcase}      label={C.aum}           value={metrics ? formatINR(metrics.totalAUM) : '—'} />
        <AdminMetricCard icon={Users}          label={C.activePartners} value={metrics?.activeCount ?? '—'} sub="active partners" />
        <AdminMetricCard icon={Send}           label={C.distributions}  value={metrics ? formatINR(metrics.quarterlyDistributions) : '—'} sub="this quarter" />
        <AdminMetricCard icon={Calendar}       label={C.nextPayout}     value={metrics ? fmtDate(metrics.nextPayoutDate) : '—'} valueColor="#F0EDE6" />
      </div>

      {/* Rate + distribution alert widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {currentRate && <RateOverviewWidget rate={currentRate} />}
        <DistributionAlertWidget
          daysUntilQuarterEnd={daysUntilQuarterEnd}
          partnerCount={activePartners.length}
          estTotal={estDistributionTotal}
        />
      </div>

      <div className="flex flex-col xl:flex-row gap-4">

        {/* Recent Partners */}
        <div className="flex-1 rounded-[8px] p-5"
          style={{ background: '#111111', border: '0.5px solid rgba(245,166,35,0.15)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-[18px] text-[#F0EDE6]">
              {C.recentPartners}<span className="text-gold">.</span>
            </h3>
            <Link href={ROUTES.ADMIN.PARTNERS} className="text-[12px] font-sans text-gold hover:text-gold-secondary transition-colors">
              View all →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  {['PARTNER', 'TIER', 'INVESTED', 'STATUS', ''].map(h => (
                    <th key={h} className="text-left pb-2 text-[10px] font-sans uppercase tracking-[0.08em] text-[#F5A623] pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {partners.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td className="py-2.5 pr-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-sans font-medium flex-shrink-0"
                          style={{ background: 'rgba(245,166,35,0.12)', color: '#F5A623' }}>
                          {p.initials}
                        </div>
                        <div>
                          <p className="text-[13px] font-sans text-[#F0EDE6]">{p.full_name}</p>
                          <p className="text-[11px] font-sans text-[#9A9080]">{p.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 pr-4"><StatusPill status={p.tier} /></td>
                    <td className="py-2.5 pr-4 text-[13px] font-sans text-[#F0EDE6] tabular-nums">{formatINR(p.invested_amount)}</td>
                    <td className="py-2.5 pr-4"><StatusPill status={p.status} /></td>
                    <td className="py-2.5">
                      <Link href={ROUTES.ADMIN.PARTNER_DETAIL(p.id)} className="text-[#9A9080] hover:text-[#F5A623] transition-colors">
                        <Eye size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
                {partners.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-[13px] text-[#9A9080]">No partners yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pipeline mini */}
        <div className="xl:w-[280px] flex-shrink-0 rounded-[8px] p-5"
          style={{ background: '#111111', border: '0.5px solid rgba(245,166,35,0.15)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-[18px] text-[#F0EDE6]">
              {C.pipeline}<span className="text-gold">.</span>
            </h3>
            <Link href={ROUTES.ADMIN.PIPELINE} className="text-[12px] font-sans text-gold hover:text-gold-secondary transition-colors">
              {C.openPipeline}
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            {pipelineStages.map(s => {
              const count = stageCounts[s.key] ?? 0
              const pct   = Math.round((count / maxCount) * 100)
              return (
                <div key={s.key}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12px] font-sans text-[#9A9080]">{s.label}</span>
                    <span className="text-[12px] font-sans text-[#F0EDE6]">{count}</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className="h-full rounded-full"
                      style={{ width: `${pct}%`, background: 'linear-gradient(to right, rgba(245,166,35,0.5), #F5A623)' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-[8px] p-5"
        style={{ background: '#111111', border: '0.5px solid rgba(245,166,35,0.15)' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-[18px] text-[#F0EDE6]">
            {C.recentActivity}<span className="text-gold">.</span>
          </h3>
          <Link href={ROUTES.ADMIN.TEAM} className="text-[12px] font-sans text-gold hover:text-gold-secondary transition-colors">
            {C.viewAllActivity}
          </Link>
        </div>
        <AuditFeed entries={auditLog} limit={8} />
      </div>
    </div>
  )
}

export default function AdminOverviewPage() {
  return (
    <div className="p-6 max-w-[1400px]">
      <Suspense fallback={<AdminSkeleton cols={4} rows={5} />}>
        <OverviewContent />
      </Suspense>
    </div>
  )
}
