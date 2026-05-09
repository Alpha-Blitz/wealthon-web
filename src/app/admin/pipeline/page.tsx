import { createClient } from '@/lib/supabase/server'
import { getLeads } from '@/lib/admin/leads'
import { getAllPartners } from '@/lib/admin/partners'
import { PipelineClient } from './PipelineClient'

export default async function PipelinePage() {
  const supabase = await createClient()
  const [leadsRes, partnersRes] = await Promise.all([
    getLeads(supabase),
    getAllPartners(supabase),
  ])

  return (
    <div className="p-6 max-w-[1400px]">
      <PipelineClient
        initialLeads={leadsRes.data ?? []}
        partners={partnersRes.data ?? []}
      />
    </div>
  )
}
