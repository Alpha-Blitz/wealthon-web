import { createClient } from '@/lib/supabase/server'
import { getPartnerByUserId } from '@/lib/db/partners'
import { getSecurities, getDocumentSignedUrl } from '@/lib/db/securities'
import { getTransactions } from '@/lib/db/transactions'
import { SecuritiesClient } from './SecuritiesClient'
import { mockPartner, mockSecurity, mockTransactions } from '@/lib/mock/data'
import type { Transaction } from '@/types/database'

export default async function SecuritiesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let security    = mockSecurity
  let partnerName = mockPartner.full_name
  let agreementUrl: string | null = null
  let transactions: Transaction[] = mockTransactions

  if (user) {
    const p = await getPartnerByUserId(supabase, user.id)
    if (p.data) {
      partnerName = p.data.full_name
      const s = await getSecurities(supabase, p.data.id)
      if (s.data?.[0]) {
        security = s.data[0]
        const url = await getDocumentSignedUrl(supabase, p.data.id, 'agreement')
        if (url.data) agreementUrl = url.data
      }
      const txRes = await getTransactions(supabase, p.data.id, 100)
      transactions = txRes.data ?? []
    }
  }

  return (
    <SecuritiesClient
      security={security}
      partnerName={partnerName}
      agreementUrl={agreementUrl}
      transactions={transactions}
    />
  )
}
