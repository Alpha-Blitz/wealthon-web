import type { SupabaseClient } from '@supabase/supabase-js'
import { TABLE } from '@/config/api'
import { ANALYTICS_EVENTS, MOCK_COMPANY_ID } from '@/config/constants'

// ── Types ──────────────────────────────────────────────────────────────────

export interface DateRange {
  from: Date
  to:   Date
}

interface PageEventRow {
  id:         string
  event_type: string
  page:       string
  metadata:   Record<string, unknown> | null
  session_id: string | null
  referrer:   string | null
  user_agent: string | null
  created_at: string
}

export interface PageViewStats {
  totalViews:     number
  uniqueSessions: number
  viewsPerPage:   { page: string; count: number }[]
  dailyTrend:     { date: string; count: number }[]
}

export interface ArticleStat {
  slug:     string
  title:    string
  category: string
  views:    number
}

export interface EventStat {
  eventType:    string
  count:        number
  previousCount: number
  trendPct:     number | null
}

export interface ReferrerStat {
  source: string
  count:  number
}

export interface ConversionFunnel {
  pageViews:      number
  calculatorUsed: number
  ctaClicked:     number
  formSubmitted:  number
  leadsCreated:   number
}

export interface AnalyticsBundle {
  pageViews:   PageViewStats
  articles:    ArticleStat[]
  events:      EventStat[]
  referrers:   ReferrerStat[]
  funnel:      ConversionFunnel
  totalEvents: number
}

// ── Helpers ────────────────────────────────────────────────────────────────

function previousRange(range: DateRange): DateRange {
  const span = range.to.getTime() - range.from.getTime()
  return {
    from: new Date(range.from.getTime() - span),
    to:   new Date(range.from.getTime()),
  }
}

function dayKey(iso: string): string {
  return iso.slice(0, 10)
}

function eachDay(from: Date, to: Date): string[] {
  const days: string[] = []
  const cur = new Date(from)
  cur.setUTCHours(0, 0, 0, 0)
  const end = new Date(to)
  end.setUTCHours(0, 0, 0, 0)
  while (cur <= end) {
    days.push(cur.toISOString().slice(0, 10))
    cur.setUTCDate(cur.getUTCDate() + 1)
  }
  return days
}

function referrerDomain(raw: string | null): string {
  if (!raw) return 'Direct'
  try {
    const url = new URL(raw)
    if (!url.hostname) return 'Direct'
    if (typeof window !== 'undefined' && url.hostname === window.location.hostname) return 'Direct'
    return url.hostname.replace(/^www\./, '')
  } catch {
    return 'Other'
  }
}

async function fetchEvents(
  supabase: SupabaseClient,
  range: DateRange,
): Promise<PageEventRow[]> {
  const { data } = await supabase
    .from(TABLE.PAGE_EVENTS)
    .select('id,event_type,page,metadata,session_id,referrer,user_agent,created_at')
    .gte('created_at', range.from.toISOString())
    .lte('created_at', range.to.toISOString())
    .order('created_at', { ascending: true })
    .limit(50000)
  return (data ?? []) as PageEventRow[]
}

// ── Aggregators (operate on a pre-fetched row set) ─────────────────────────

function aggregatePageViews(rows: PageEventRow[], range: DateRange): PageViewStats {
  const pageViews = rows.filter(r => r.event_type === ANALYTICS_EVENTS.PAGE_VIEW)
  const totalViews = pageViews.length

  const sessionIds = new Set<string>()
  for (const r of pageViews) if (r.session_id) sessionIds.add(r.session_id)

  const perPage = new Map<string, number>()
  for (const r of pageViews) perPage.set(r.page, (perPage.get(r.page) ?? 0) + 1)
  const viewsPerPage = Array.from(perPage, ([page, count]) => ({ page, count }))
    .sort((a, b) => b.count - a.count)

  const perDay = new Map<string, number>()
  for (const r of pageViews) {
    const k = dayKey(r.created_at)
    perDay.set(k, (perDay.get(k) ?? 0) + 1)
  }
  const dailyTrend = eachDay(range.from, range.to).map(date => ({
    date,
    count: perDay.get(date) ?? 0,
  }))

  return { totalViews, uniqueSessions: sessionIds.size, viewsPerPage, dailyTrend }
}

function aggregateArticles(rows: PageEventRow[]): ArticleStat[] {
  const map = new Map<string, ArticleStat>()
  for (const r of rows) {
    if (r.event_type !== ANALYTICS_EVENTS.ARTICLE_VIEW) continue
    const m = r.metadata ?? {}
    const slug = typeof m.slug === 'string' ? m.slug : null
    if (!slug) continue
    const existing = map.get(slug)
    if (existing) {
      existing.views += 1
    } else {
      map.set(slug, {
        slug,
        title:    typeof m.title === 'string' ? m.title : slug,
        category: typeof m.category === 'string' ? m.category : '—',
        views:    1,
      })
    }
  }
  return Array.from(map.values()).sort((a, b) => b.views - a.views).slice(0, 10)
}

function countByEventType(rows: PageEventRow[]): Map<string, number> {
  const m = new Map<string, number>()
  for (const r of rows) m.set(r.event_type, (m.get(r.event_type) ?? 0) + 1)
  return m
}

function aggregateEvents(rows: PageEventRow[], prevRows: PageEventRow[]): EventStat[] {
  const cur = countByEventType(rows)
  const prev = countByEventType(prevRows)
  const keys = new Set([...cur.keys(), ...prev.keys()])
  return Array.from(keys, eventType => {
    const count = cur.get(eventType) ?? 0
    const previousCount = prev.get(eventType) ?? 0
    const trendPct =
      previousCount === 0
        ? count === 0
          ? 0
          : null
        : Math.round(((count - previousCount) / previousCount) * 100)
    return { eventType, count, previousCount, trendPct }
  }).sort((a, b) => b.count - a.count)
}

function aggregateReferrers(rows: PageEventRow[]): ReferrerStat[] {
  const counts = new Map<string, number>()
  for (const r of rows) {
    if (r.event_type !== ANALYTICS_EVENTS.PAGE_VIEW) continue
    const source = referrerDomain(r.referrer)
    counts.set(source, (counts.get(source) ?? 0) + 1)
  }
  return Array.from(counts, ([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count)
}

function aggregateFunnel(rows: PageEventRow[], leadsCount: number): ConversionFunnel {
  let pageViews = 0
  let calculatorUsed = 0
  let ctaClicked = 0
  let formSubmitted = 0
  for (const r of rows) {
    switch (r.event_type) {
      case ANALYTICS_EVENTS.PAGE_VIEW:
        if (r.page === 'home') pageViews += 1
        break
      case ANALYTICS_EVENTS.CALCULATOR_USE:
        calculatorUsed += 1
        break
      case ANALYTICS_EVENTS.CTA_CLICK:
      case ANALYTICS_EVENTS.APPLY_PARTNER_CLICK:
        ctaClicked += 1
        break
      case ANALYTICS_EVENTS.CONTACT_FORM_SUBMIT:
        formSubmitted += 1
        break
    }
  }
  return { pageViews, calculatorUsed, ctaClicked, formSubmitted, leadsCreated: leadsCount }
}

async function countLeads(supabase: SupabaseClient, range: DateRange): Promise<number> {
  const { count } = await supabase
    .from(TABLE.LEADS)
    .select('id', { count: 'exact', head: true })
    .eq('company_id', MOCK_COMPANY_ID)
    .gte('created_at', range.from.toISOString())
    .lte('created_at', range.to.toISOString())
  return count ?? 0
}

// ── Public API ─────────────────────────────────────────────────────────────

export async function getAllAnalytics(
  supabase: SupabaseClient,
  range: DateRange,
): Promise<AnalyticsBundle> {
  const prev = previousRange(range)
  const [rows, prevRows, leadsCount] = await Promise.all([
    fetchEvents(supabase, range),
    fetchEvents(supabase, prev),
    countLeads(supabase, range),
  ])

  return {
    pageViews:   aggregatePageViews(rows, range),
    articles:    aggregateArticles(rows),
    events:      aggregateEvents(rows, prevRows),
    referrers:   aggregateReferrers(rows),
    funnel:      aggregateFunnel(rows, leadsCount),
    totalEvents: rows.length,
  }
}

export async function getPageViewStats(
  supabase: SupabaseClient,
  range: DateRange,
): Promise<PageViewStats> {
  const rows = await fetchEvents(supabase, range)
  return aggregatePageViews(rows, range)
}

export async function getArticleStats(
  supabase: SupabaseClient,
  range: DateRange,
): Promise<ArticleStat[]> {
  const rows = await fetchEvents(supabase, range)
  return aggregateArticles(rows)
}

export async function getEventStats(
  supabase: SupabaseClient,
  range: DateRange,
): Promise<EventStat[]> {
  const prev = previousRange(range)
  const [rows, prevRows] = await Promise.all([
    fetchEvents(supabase, range),
    fetchEvents(supabase, prev),
  ])
  return aggregateEvents(rows, prevRows)
}

export async function getTopReferrers(
  supabase: SupabaseClient,
  range: DateRange,
): Promise<ReferrerStat[]> {
  const rows = await fetchEvents(supabase, range)
  return aggregateReferrers(rows)
}

export async function getDailyTrend(
  supabase: SupabaseClient,
  range: DateRange,
): Promise<{ date: string; count: number }[]> {
  const rows = await fetchEvents(supabase, range)
  return aggregatePageViews(rows, range).dailyTrend
}

export async function getConversionFunnel(
  supabase: SupabaseClient,
  range: DateRange,
): Promise<ConversionFunnel> {
  const [rows, leadsCount] = await Promise.all([
    fetchEvents(supabase, range),
    countLeads(supabase, range),
  ])
  return aggregateFunnel(rows, leadsCount)
}
