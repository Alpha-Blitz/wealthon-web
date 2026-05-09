import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getArticles } from '@/lib/admin/content'
import { ArticleEditor } from '@/components/admin/ArticleEditor'

interface Props { params: Promise<{ id: string }> }

export default async function EditArticlePage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: articles } = await getArticles(supabase)
  const article = (articles ?? []).find(a => a.id === id)
  if (!article) notFound()

  return (
    <div className="p-6 max-w-[900px]">
      <ArticleEditor article={article} />
    </div>
  )
}
