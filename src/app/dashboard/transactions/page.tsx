import { createClient } from '@/lib/supabase/server'
import { getPartnerByUserId } from '@/lib/db/partners'
import { getTransactions } from '@/lib/db/transactions'
import { TransactionsClient } from './TransactionsClient'
import { mockPartner, mockTransactions } from '@/lib/mock/data'

export default async function TransactionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let transactions = mockTransactions
  let partner = mockPartner

  if (user) {
    const p = await getPartnerByUserId(supabase, user.id)
    if (p.data) {
      partner = p.data
      const t = await getTransactions(supabase, p.data.id)
      if (t.data) transactions = t.data
    }
  }

  return <TransactionsClient transactions={transactions} partner={partner} />
}
