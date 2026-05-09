// Admin-specific types — distinct from DB row types in database.ts

export type { AdminUser, AdminMember } from '@/lib/admin/users'
export type { Article, ArticleInput } from '@/lib/admin/content'
export type { CompanyMetrics, MonthlyAggregate, DistributionSummary } from '@/lib/admin/financials'
export type { NotificationInput } from '@/lib/admin/notifications'
export type { ServiceStatus } from '@/lib/admin/system'
export type { PartnerInput } from '@/lib/admin/partners'
export type { TransactionInput } from '@/lib/admin/transactions'
export type { LeadInput } from '@/lib/admin/leads'
export type { StrategyInput } from '@/lib/admin/strategies'
