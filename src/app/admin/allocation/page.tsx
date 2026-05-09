import { createClient } from '@/lib/supabase/server'
import { getAllPartners } from '@/lib/admin/partners'
import { AllocationClient } from './AllocationClient'

export default async function AllocationPage() {
  const supabase = await createClient()
  const { data: partners } = await getAllPartners(supabase)

  return (
    <div className="p-6">
      <AllocationClient partners={partners ?? []} />
    </div>
  )
}
