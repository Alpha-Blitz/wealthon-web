'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Eye, Users, MessageSquare, MessageCircle, TrendingUp, TrendingDown,
  Compass, ChevronRight, ChevronDown,
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { createClient } from '@/lib/supabase/client'
import { getAllAnalytics, type AnalyticsBundle } from '@/lib/admin/analytics'
import { CONTENT } from '@/config/content'

const C = CONTENT.admin.content.analytics

type RangeKey = 'd7' | 'd30' | 'd90' | 'year'

const RANGE_OPTIONS: { key: RangeKey; label: string }[] = [
  { key: 'd7',   label: C.ranges.d7 },
  { key: 'd30',  label: C.ranges.d30 },
  { key: 'd90',  label: C.ranges.d90 },
  { key: 'year', label: C.ranges.year },
]

function rangeFromKey(key: RangeKey): { from: Date; to: Date } {
  const to = new Date()
  const from = new Date()
  switch (key) {
    case 'd7':   from.setDate(to.getDate() - 7); break
    case 'd30':  from.setDate(to.getDate() - 30); break
    case 'd90':  from.setDate(to.getDate() - 90); break
    case 'year': from.setMonth(0, 1); from.setHours(0, 0, 0, 0); break
  }
  return { from, to }
}

function formatDateLabel(iso: string): string {
  const d = new Date(iso + 'T00:00:00Z')
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

function TrendArrow({ pct }: { pct: number | null }) {
  if (pct === null) return null
  const up = pct >= 0
  const color = up ? '#22C55E' : '#EF4444'
  const Icon = up ? TrendingUp : TrendingDown
  return (
    <span className="inline-flex items-center gap-1 text-[12px] font-sans" style={{ color }}>
      <Icon size={12} />
      {up ? '+' : ''}{pct}%
    </span>
  )
}

function ChartTooltip({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div
      className="px-3 py-2 rounded-[4px] text-[12px] font-sans"
      style={{ background: '#1a1a1a', border: '1px solid rgba(245,166,35,0.3)', color: '#F0EDE6' }}
    >
      <p className="text-[#9E9484] mb-1">{label}</p>
      <p style={{ color: '#F5A623' }}>{payload[0].value ?? 0} views</p>
    </div>
  )
}

function PanelHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[11px] font-sans uppercase tracking-[0.1em] text-gold mb-4">{children}</h3>
  )
}

function Panel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-[8px] p-5 ${className}`}
      style={{ background: '#111111', border: '0.5px solid rgba(245,166,35,0.15)' }}
    >
      {children}
    </div>
  )
}

export function ContentAnalytics() {
  const [rangeKey, setRangeKey] = useState<RangeKey>('d30')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [data, setData] = useState<AnalyticsBundle | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    const supabase = createClient()
    getAllAnalytics(supabase, rangeFromKey(rangeKey))
      .then(bundle => {
        if (!cancelled) {
          setData(bundle)
          setLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setData(null)
          setLoading(false)
        }
      })
    return () => { cancelled = true }
  }, [rangeKey])

  const currentLabel = RANGE_OPTIONS.find(r => r.key === rangeKey)?.label ?? ''
  const isEmpty = !loading && data !== null && data.totalEvents === 0

  const eventCountMap = useMemo(() => {
    const m = new Map<string, number>()
    if (data) for (const e of data.events) m.set(e.eventType, e.count)
    return m
  }, [data])

  const formSubmitTrend = useMemo(() => {
    if (!data) return null
    return data.events.find(e => e.eventType === 'contact_form_submit')?.trendPct ?? null
  }, [data])

  const whatsappTrend = useMemo(() => {
    if (!data) return null
    return data.events.find(e => e.eventType === 'whatsapp_click')?.trendPct ?? null
  }, [data])

  const pageViewTrend = useMemo(() => {
    if (!data) return null
    return data.events.find(e => e.eventType === 'page_view')?.trendPct ?? null
  }, [data])

  return (
    <div className="flex flex-col gap-5">
      {/* Date range selector */}
      <div className="flex justify-end">
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(o => !o)}
            className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-sans rounded-[4px] cursor-pointer"
            style={{
              background: '#111111',
              border: '1px solid rgba(245,166,35,0.25)',
              color: '#F0EDE6',
            }}
          >
            {currentLabel}
            <ChevronDown size={14} className="text-gold" />
          </button>
          {dropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-44 rounded-[6px] py-1 z-20"
              style={{ background: '#0F0F0F', border: '1px solid rgba(245,166,35,0.2)' }}
            >
              {RANGE_OPTIONS.map(opt => (
                <button
                  key={opt.key}
                  onClick={() => { setRangeKey(opt.key); setDropdownOpen(false) }}
                  className="block w-full text-left px-4 py-2 text-[13px] font-sans cursor-pointer bg-transparent border-none"
                  style={{ color: opt.key === rangeKey ? '#F5A623' : '#9A9080' }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {loading && <LoadingSkeleton />}

      {!loading && isEmpty && <EmptyState />}

      {!loading && data && !isEmpty && (
        <>
          {/* Row 1 — Metric cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricWithTrend
              icon={Eye}
              label={C.metrics.totalViews}
              value={data.pageViews.totalViews.toLocaleString('en-IN')}
              trend={pageViewTrend}
            />
            <MetricWithTrend
              icon={Users}
              label={C.metrics.uniqueSessions}
              value={data.pageViews.uniqueSessions.toLocaleString('en-IN')}
              trend={null}
            />
            <MetricWithTrend
              icon={MessageSquare}
              label={C.metrics.formSubmits}
              value={(eventCountMap.get('contact_form_submit') ?? 0).toLocaleString('en-IN')}
              trend={formSubmitTrend}
            />
            <MetricWithTrend
              icon={MessageCircle}
              label={C.metrics.whatsappClicks}
              value={(eventCountMap.get('whatsapp_click') ?? 0).toLocaleString('en-IN')}
              trend={whatsappTrend}
            />
          </div>

          {/* Row 2 — Daily trend chart */}
          <Panel>
            <PanelHeading>{C.sections.dailyViews}</PanelHeading>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart
                data={data.pageViews.dailyTrend.map(d => ({ label: formatDateLabel(d.date), count: d.count }))}
                margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
              >
                <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="label" tick={{ fill: '#9E9484', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#9E9484', fontSize: 10 }} axisLine={false} tickLine={false} width={40} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Line type="monotone" dataKey="count" stroke="#F5A623" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Panel>

          {/* Row 3 — Top articles + traffic sources */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <Panel className="lg:col-span-3">
              <PanelHeading>{C.sections.topArticles}</PanelHeading>
              {data.articles.length === 0 ? (
                <p className="text-[#7F7566] text-[13px] font-sans py-6 text-center">
                  {C.emptyArticles}
                </p>
              ) : (
                <div className="flex flex-col">
                  <div
                    className="grid grid-cols-[1fr_auto_auto] gap-4 text-[10px] font-sans uppercase tracking-[0.08em] text-gold pb-3"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <span>{C.articleColumns.title}</span>
                    <span className="text-right">{C.articleColumns.views}</span>
                    <span>{C.articleColumns.category}</span>
                  </div>
                  {data.articles.map(a => (
                    <a
                      key={a.slug}
                      href={`/insights/${a.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="grid grid-cols-[1fr_auto_auto] gap-4 items-center py-3 text-[13px] font-sans hover:bg-[rgba(245,166,35,0.04)] -mx-2 px-2 rounded-[4px] transition-colors"
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    >
                      <span className="text-[#F0EDE6] line-clamp-1">{a.title}</span>
                      <span className="text-gold font-dm-serif text-[15px] text-right">{a.views}</span>
                      <span className="text-[#9A9080] text-[12px]">{a.category}</span>
                    </a>
                  ))}
                </div>
              )}
            </Panel>

            <Panel className="lg:col-span-2">
              <PanelHeading>{C.sections.trafficSources}</PanelHeading>
              {data.referrers.length === 0 ? (
                <p className="text-[#7F7566] text-[13px] font-sans py-6 text-center">
                  {C.emptyReferrers}
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {data.referrers.slice(0, 8).map(r => {
                    const max = data.referrers[0]?.count ?? 1
                    const pct = Math.round((r.count / max) * 100)
                    return (
                      <div key={r.source}>
                        <div className="flex justify-between items-baseline mb-1.5">
                          <span className="text-[#F0EDE6] text-[13px] font-sans">{r.source}</span>
                          <span className="text-gold text-[12px] font-sans">{r.count}</span>
                        </div>
                        <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                          <div
                            className="h-full transition-all duration-500 rounded-full"
                            style={{ width: `${pct}%`, background: '#F5A623' }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </Panel>
          </div>

          {/* Row 4 — Conversion funnel */}
          <Panel>
            <PanelHeading>{C.sections.funnel}</PanelHeading>
            <ConversionFunnelStrip data={data.funnel} />
          </Panel>

          {/* Row 5 — Event breakdown */}
          <Panel>
            <PanelHeading>{C.sections.allEvents}</PanelHeading>
            {data.events.length === 0 ? (
              <p className="text-[#7F7566] text-[13px] font-sans py-6 text-center">
                {C.emptyEvents}
              </p>
            ) : (
              <div className="flex flex-col">
                <div
                  className="grid grid-cols-[1fr_auto_auto] gap-6 text-[10px] font-sans uppercase tracking-[0.08em] text-gold pb-3"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <span>{C.eventsColumns.eventType}</span>
                  <span className="text-right">{C.eventsColumns.count}</span>
                  <span className="text-right">{C.eventsColumns.share}</span>
                </div>
                {data.events.map(e => {
                  const share = data.totalEvents > 0 ? ((e.count / data.totalEvents) * 100).toFixed(1) : '0.0'
                  return (
                    <div
                      key={e.eventType}
                      className="grid grid-cols-[1fr_auto_auto] gap-6 items-center py-3 text-[13px] font-sans"
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    >
                      <span className="text-[#F0EDE6]">{e.eventType}</span>
                      <span className="text-gold font-dm-serif text-[15px] text-right">{e.count}</span>
                      <span className="text-[#9A9080] text-[12px] text-right">{share}%</span>
                    </div>
                  )
                })}
              </div>
            )}
          </Panel>
        </>
      )}
    </div>
  )
}

function MetricWithTrend({
  icon: Icon, label, value, trend,
}: {
  icon: typeof Eye
  label: string
  value: string
  trend: number | null
}) {
  return (
    <div
      className="rounded-[8px] p-5 flex flex-col gap-4"
      style={{
        background: '#111111',
        border: '0.5px solid rgba(245,166,35,0.15)',
        backgroundImage: 'linear-gradient(180deg, rgba(245,166,35,0.04) 0%, transparent 60%)',
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ border: '1px solid rgba(245,166,35,0.3)', background: 'rgba(245,166,35,0.06)' }}
        >
          <Icon size={18} style={{ color: '#F5A623' }} />
        </div>
        <p className="text-[11px] font-sans uppercase tracking-[0.1em] text-[#8A8070]">{label}</p>
      </div>

      <div>
        <p className="font-dm-serif text-[32px] leading-none" style={{ color: '#F5A623' }}>
          {value}
        </p>
        {trend !== null && (
          <div className="mt-1.5">
            <TrendArrow pct={trend} />
            <span className="text-[11px] font-sans text-[#8A8070] ml-2">{C.vsPrevious}</span>
          </div>
        )}
      </div>
    </div>
  )
}

function ConversionFunnelStrip({ data }: { data: AnalyticsBundle['funnel'] }) {
  const stages = [
    { key: 'pageViews',      label: C.funnel.pageViews,      count: data.pageViews },
    { key: 'calculatorUsed', label: C.funnel.calculator,     count: data.calculatorUsed },
    { key: 'ctaClicked',     label: C.funnel.cta,            count: data.ctaClicked },
    { key: 'formSubmitted',  label: C.funnel.formSubmitted,  count: data.formSubmitted },
    { key: 'leadsCreated',   label: C.funnel.leadsCreated,   count: data.leadsCreated },
  ]
  const maxCount = Math.max(...stages.map(s => s.count), 1)

  return (
    <div className="overflow-x-auto">
      <div className="flex items-stretch gap-0 min-w-max">
        {stages.map((s, i) => {
          const prev = stages[i - 1]?.count ?? 0
          const conv = i === 0 ? 100 : prev > 0 ? Math.round((s.count / prev) * 100) : 0
          const barPct = Math.round((s.count / maxCount) * 100)
          return (
            <div key={s.key} className="flex items-center">
              <div className="flex flex-col gap-2 px-6 py-1" style={{ minWidth: 150 }}>
                <span className="text-[10px] font-sans uppercase tracking-[0.1em] text-gold">
                  {s.label}
                </span>
                <div className="flex items-end gap-3">
                  <span className="font-dm-serif text-[32px] leading-none text-[#F0EDE6]">
                    {s.count}
                  </span>
                  {i > 0 && (
                    <span
                      className="text-[11px] font-sans mb-1"
                      style={{ color: conv >= 50 ? '#22C55E' : conv >= 20 ? '#F59E0B' : '#EF4444' }}
                    >
                      {conv}%
                    </span>
                  )}
                </div>
                <div
                  className="h-1 rounded-full overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.06)', width: '100%' }}
                >
                  <div
                    className="h-full transition-all duration-500 rounded-full"
                    style={{
                      width: `${barPct}%`,
                      background:
                        i === 0
                          ? '#F5A623'
                          : i === stages.length - 1
                          ? '#22C55E'
                          : 'rgba(245,166,35,0.5)',
                    }}
                  />
                </div>
              </div>
              {i < stages.length - 1 && (
                <ChevronRight size={16} className="flex-shrink-0 text-gold" style={{ opacity: 0.35 }} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div
      className="rounded-[10px] p-12 flex flex-col items-center justify-center text-center gap-4"
      style={{ background: '#111111', border: '0.5px solid rgba(245,166,35,0.15)' }}
    >
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center"
        style={{ border: '1px solid rgba(245,166,35,0.3)', background: 'rgba(245,166,35,0.06)' }}
      >
        <Compass size={28} className="text-gold" style={{ opacity: 0.7 }} />
      </div>
      <p className="font-serif text-[20px] text-[#F0EDE6]">{C.empty.title}</p>
      <p className="text-[#9A9080] text-[13px] font-sans max-w-[420px]">{C.empty.subtitle}</p>
      <p className="text-[#7F7566] text-[12px] font-sans">{C.empty.hint}</p>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-5 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-[8px] p-5 h-28"
            style={{ background: '#111111', border: '0.5px solid rgba(245,166,35,0.1)' }}
          >
            <div className="h-3 w-24 rounded mb-3" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <div className="h-6 w-20 rounded" style={{ background: 'rgba(255,255,255,0.06)' }} />
          </div>
        ))}
      </div>
      <div
        className="rounded-[8px] p-5 h-64"
        style={{ background: '#111111', border: '0.5px solid rgba(245,166,35,0.1)' }}
      />
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div
          className="lg:col-span-3 rounded-[8px] p-5 h-72"
          style={{ background: '#111111', border: '0.5px solid rgba(245,166,35,0.1)' }}
        />
        <div
          className="lg:col-span-2 rounded-[8px] p-5 h-72"
          style={{ background: '#111111', border: '0.5px solid rgba(245,166,35,0.1)' }}
        />
      </div>
    </div>
  )
}
