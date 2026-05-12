'use client'

import { useEffect } from 'react'
import { trackPageView, trackEvent } from '@/lib/analytics'
import type { AnalyticsEvent } from '@/config/constants'

interface Props {
  page: string
  event?: {
    type:      AnalyticsEvent
    metadata?: Record<string, unknown>
  }
}

export function PageTracker({ page, event }: Props) {
  useEffect(() => {
    trackPageView(page)
    if (event) trackEvent(event.type, page, event.metadata)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  return null
}
