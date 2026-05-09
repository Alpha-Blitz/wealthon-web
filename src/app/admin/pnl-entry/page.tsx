import { createClient } from '@/lib/supabase/server'
import { getAllPartners } from '@/lib/admin/partners'
import { getPnLEntryHistory } from '@/lib/admin/pnl'
import { PnlEntryClient } from './PnlEntryClient'

export default async function PnlEntryPage() {
  const supabase = await createClient()
  const [partnersRes, historyRes] = await Promise.all([
    getAllPartners(supabase),
    getPnLEntryHistory(supabase, 100),
  ])

  return (
    <div className="p-6">
      <PnlEntryClient
        partners={partnersRes.data ?? []}
        recentEntries={historyRes.data ?? []}
      />
    </div>
  )
}
