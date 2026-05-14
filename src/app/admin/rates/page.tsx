import { createClient } from '@/lib/supabase/server'
import { getAllRates } from '@/lib/admin/rates'
import { RatesClient } from './RatesClient'

export default async function RatesPage() {
  const supabase = await createClient()
  const { data: rates } = await getAllRates(supabase)
  return (
    <div className="p-6 max-w-[1200px]">
      <h1 className="font-serif text-[28px] text-[#F0EDE6] mb-1">Quarterly Rates<span className="text-gold">.</span></h1>
      <p className="text-[#9A9080] text-[13px] font-sans font-light mb-6">
        The rate applied to all partner distributions each quarter.
      </p>
      <RatesClient initialRates={rates ?? []} />
    </div>
  )
}
