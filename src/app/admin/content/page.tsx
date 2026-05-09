import { createClient } from '@/lib/supabase/server'
import { getArticles } from '@/lib/admin/content'
import { CONTENT } from '@/config/content'
import { ContentClient } from './ContentClient'

export default async function ContentPage() {
  const supabase = await createClient()
  const { data: articles } = await getArticles(supabase)

  return (
    <div className="p-6 max-w-[1200px]">
      <h1 className="font-serif text-[28px] text-[#F0EDE6] mb-6">{CONTENT.admin.content.title}</h1>
      <ContentClient initialArticles={articles ?? []} />
    </div>
  )
}
