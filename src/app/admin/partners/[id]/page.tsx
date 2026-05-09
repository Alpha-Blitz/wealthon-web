import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getPartnerById } from '@/lib/admin/partners'
import { getTransactions } from '@/lib/admin/transactions'
import { getPnLReports, getMonthlyPnL } from '@/lib/admin/pnl'
import { ROUTES } from '@/config/routes'
import { CONTENT } from '@/config/content'
import { AdminSkeleton } from '@/components/admin/AdminSkeleton'
import { PartnerDetailClient } from './PartnerDetailClient'

const C = CONTENT.admin.partnerDetail

interface Props { params: Promise<{ id: string }> }

async function PartnerContent({ id }: { id: string }) {
  const supabase = await createClient()

  const [partnerRes, txRes, rptRes, monthlyRes] = await Promise.all([
    getPartnerById(supabase, id),
    getTransactions(supabase, id),
    getPnLReports(supabase, id),
    getMonthlyPnL(supabase, id, new Date().getFullYear()),
  ])

  if (partnerRes.error || !partnerRes.data) notFound()

  return (
    <PartnerDetailClient
      partner={partnerRes.data}
      transactions={txRes.data ?? []}
      pnlReports={rptRes.data ?? []}
      monthlyPnL={monthlyRes.data ?? []}
    />
  )
}

export default async function PartnerDetailPage({ params }: Props) {
  const { id } = await params

  return (
    <div className="p-6 max-w-[1200px]">
      <Link href={ROUTES.ADMIN.PARTNERS} className="text-[13px] font-sans text-[#9A9080] hover:text-[#F5A623] transition-colors mb-5 inline-block">
        {C.back}
      </Link>
      <Suspense fallback={<AdminSkeleton cols={4} rows={6} />}>
        <PartnerContent id={id} />
      </Suspense>
    </div>
  )
}
