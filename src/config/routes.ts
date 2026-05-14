export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  TRANSACTIONS: '/dashboard/transactions',
  PNL: '/dashboard/pnl',
  SECURITIES: '/dashboard/securities',
  PROFILE: '/dashboard/profile',
  INSIGHTS: '/insights',
  CONTACT: '/#contact',
  APPLY:   '/apply',

  ADMIN: {
    ROOT:          '/admin',
    PARTNERS:      '/admin/partners',
    PARTNER_DETAIL: (id: string) => `/admin/partners/${id}` as const,
    PIPELINE:      '/admin/pipeline',
    FINANCIALS:    '/admin/financials',
    DOCUMENTS:     '/admin/documents',
    DISTRIBUTIONS: '/admin/distributions',
    RATES:         '/admin/rates',
    TEAM:          '/admin/team',
    PNL_ENTRY:     '/admin/pnl-entry',
    USERS:         '/admin/users',
    CONTENT:       '/admin/content',
    CONTENT_NEW:   '/admin/content/new',
    CONTENT_EDIT:         (id: string) => `/admin/content/${id}/edit` as const,
    PARTNER_NEW_FROM_LEAD: (leadId: string) => `/admin/partners/new?from_lead=${leadId}` as const,
    NOTIFICATIONS: '/admin/notifications',
    SYSTEM:        '/admin/system',
  },
} as const

export type Route = string
