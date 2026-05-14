import { createClient } from '@/lib/supabase/server'
import { getEnrichedLeads } from '@/lib/admin/leads'
import { getAllPartners } from '@/lib/admin/partners'
import { getFinancialConfig } from '@/lib/admin/settings'
import { PipelineClient } from './PipelineClient'

export default async function PipelinePage() {
  const supabase = await createClient()
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://www.wealthonventures.com'
  const config = await getFinancialConfig(supabase)
  const [leadsRes, partnersRes] = await Promise.all([
    getEnrichedLeads(supabase, baseUrl, config.defaultMonthlyRate),
    getAllPartners(supabase),
  ])

  return (
    <div className="p-6 max-w-[1400px]">
      <PipelineClient
        initialLeads={leadsRes.data ?? []}
        partners={partnersRes.data ?? []}
        applyExpiryDays={config.applyFormExpiryDays}
        lockInMonths={config.lockInMonths}
      />
    </div>
  )
}
