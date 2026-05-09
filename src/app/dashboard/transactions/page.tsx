import { createClient } from '@/lib/supabase/server'
import { getPartnerByUserId } from '@/lib/db/partners'
import { getTransactions } from '@/lib/db/transactions'
import { TransactionsClient } from './TransactionsClient'
import { mockPartner, mockTransactions } from '@/lib/mock/data'

export default async function TransactionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const devBypass = process.env.DEV_BYPASS_AUTH === 'true'

  if (devBypass || !user) {
    return <TransactionsClient transactions={mockTransactions} partner={mockPartner} />
  }

  const { data: partner } = await getPartnerByUserId(supabase, user.id)
  if (!partner) return null

  const { data: transactions } = await getTransactions(supabase, partner.id)

  return <TransactionsClient transactions={transactions ?? []} partner={partner} />
}
