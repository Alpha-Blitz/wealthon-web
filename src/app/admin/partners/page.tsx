import { createClient } from '@/lib/supabase/server'
import { getAllPartners } from '@/lib/admin/partners'
import { PartnersClient } from './PartnersClient'

export default async function PartnersPage() {
  const supabase = await createClient()
  const { data: partners } = await getAllPartners(supabase)

  return (
    <div className="p-6 max-w-[1400px]">
      <PartnersClient initialPartners={partners ?? []} />
    </div>
  )
}
