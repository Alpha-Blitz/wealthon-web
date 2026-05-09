import { ArticleEditor } from '@/components/admin/ArticleEditor'

export default function NewArticlePage() {
  return (
    <div className="p-6 max-w-[900px]">
      <ArticleEditor article={null} />
    </div>
  )
}
