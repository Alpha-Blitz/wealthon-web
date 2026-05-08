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
} as const

export type Route = (typeof ROUTES)[keyof typeof ROUTES]
