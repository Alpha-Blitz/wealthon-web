'use client'

import { createClient } from '@/lib/supabase/client'
import { TABLE } from '@/config/api'
import {
  ANALYTICS_EVENTS,
  ANALYTICS_DEDUP_WINDOW_MS,
  type AnalyticsEvent,
} from '@/config/constants'

const SESSION_KEY = 'wcv_session'
const DEDUP_PREFIX = 'wcv_dedup:'

function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}

function getSessionId(): string {
  if (!isBrowser()) return ''
  let id = sessionStorage.getItem(SESSION_KEY)
  if (!id) {
    id = crypto.randomUUID()
    sessionStorage.setItem(SESSION_KEY, id)
  }
  return id
}

function shouldSkipDedup(key: string): boolean {
  if (!isBrowser()) return true
  const last = sessionStorage.getItem(DEDUP_PREFIX + key)
  const now  = Date.now()
  if (last && now - Number(last) < ANALYTICS_DEDUP_WINDOW_MS) return true
  sessionStorage.setItem(DEDUP_PREFIX + key, String(now))
  return false
}

async function insert(payload: Record<string, unknown>): Promise<void> {
  if (!isBrowser() || !isProduction()) return
  try {
    const supabase = createClient()
    await supabase.from(TABLE.PAGE_EVENTS).insert(payload)
  } catch {
    // Fire and forget — never surface tracking failures.
  }
}

export async function trackPageView(page: string): Promise<void> {
  if (!isBrowser()) return
  const sessionId = getSessionId()
  if (shouldSkipDedup(`${sessionId}:${page}:${ANALYTICS_EVENTS.PAGE_VIEW}`)) return
  await insert({
    event_type: ANALYTICS_EVENTS.PAGE_VIEW,
    page,
    session_id: sessionId,
    referrer:   document.referrer || null,
    user_agent: navigator.userAgent,
  })
}

export async function trackEvent(
  eventType: AnalyticsEvent,
  page: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  if (!isBrowser()) return
  const sessionId = getSessionId()
  if (shouldSkipDedup(`${sessionId}:${page}:${eventType}`)) return
  await insert({
    event_type: eventType,
    page,
    metadata: metadata ?? null,
    session_id: sessionId,
    referrer: document.referrer || null,
  })
}

export function currentPagePath(): string {
  if (!isBrowser()) return 'unknown'
  return window.location.pathname || '/'
}
