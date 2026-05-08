import { createClient } from '@/lib/supabase/server'
import { getPartnerByUserId } from '@/lib/db/partners'
import { getSecurities, getDocumentSignedUrl } from '@/lib/db/securities'
import { SecuritiesClient } from './SecuritiesClient'
import { mockPartner, mockSecurity } from '@/lib/mock/data'

export default async function SecuritiesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let security   = mockSecurity
  let partnerName = mockPartner.full_name
  let agreementUrl: string | null = null

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
    }
  }

  return (
    <SecuritiesClient
      security={security}
      partnerName={partnerName}
      agreementUrl={agreementUrl}
    />
  )
}
