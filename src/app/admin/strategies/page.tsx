import { createClient } from '@/lib/supabase/server'
import { getStrategies } from '@/lib/admin/strategies'
import { CONTENT } from '@/config/content'
import { StrategiesClient } from './StrategiesClient'

export default async function StrategiesPage() {
  const supabase = await createClient()
  const { data: strategies } = await getStrategies(supabase)

  return (
    <div className="p-6 max-w-[1200px]">
      <h1 className="font-serif text-[28px] text-[#F0EDE6] mb-6">{CONTENT.admin.strategies.title}</h1>
      <StrategiesClient initialStrategies={strategies ?? []} />
    </div>
  )
}
