import { createClient } from '@/lib/supabase/server'
import { getAllPartners } from '@/lib/admin/partners'
import { CONTENT } from '@/config/content'
import { DocumentsClient } from './DocumentsClient'

export default async function DocumentsPage() {
  const supabase = await createClient()
  const { data: partners } = await getAllPartners(supabase)

  return (
    <div className="p-6 max-w-[1000px]">
      <h1 className="font-serif text-[28px] text-[#F0EDE6] mb-6">{CONTENT.admin.documents.title}</h1>
      <DocumentsClient partners={partners ?? []} />
    </div>
  )
}
