'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { deleteArticle, type Article } from '@/lib/admin/content'
import { DataTable, type Column } from '@/components/admin/DataTable'
import { ConfirmModal } from '@/components/admin/ConfirmModal'
import { ContentAnalytics } from '@/components/admin/ContentAnalytics'
import { StatusPill } from '@/components/shared/StatusPill'
import { ROUTES } from '@/config/routes'
import { CONTENT } from '@/config/content'

const C = CONTENT.admin.content
type Tab = 'articles' | 'analytics'

interface Props { initialArticles: Article[] }

export function ContentClient({ initialArticles }: Props) {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('articles')
  const [articles, setArticles] = useState(initialArticles)
  const [delItem, setDelItem]   = useState<Article | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!delItem) return
    setDeleting(true)
    const supabase = createClient()
    const res = await deleteArticle(supabase, delItem.id)
    setDeleting(false)
    if (!res.error) setArticles(as => as.filter(a => a.id !== delItem.id))
    setDelItem(null)
  }

  const columns: Column<Article>[] = [
    {
      key: 'title', label: C.columns.title, sortable: true,
      render: a => <span className="text-[13px] font-sans text-[#F0EDE6] line-clamp-1">{a.title}</span>,
    },
    { key: 'author', label: C.columns.author,
      render: a => <span className="text-[12px] font-sans text-[#9A9080]">{a.author}</span> },
    { key: 'category', label: C.columns.category,
      render: a => <span className="text-[12px] font-sans text-[#9A9080]">{a.category}</span> },
    { key: 'status', label: C.columns.status, render: a => <StatusPill status={a.status} /> },
    {
      key: 'created_at', label: C.columns.date, sortable: true,
      render: a => <span className="text-[12px] font-sans text-[#9A9080]">{new Date(a.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>,
    },
    {
      key: 'actions' as keyof Article, label: C.columns.actions,
      render: a => (
        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
          <button onClick={() => router.push(ROUTES.ADMIN.CONTENT_EDIT(a.id))}
            className="p-1.5 text-[#9A9080] hover:text-[#F5A623] transition-colors cursor-pointer bg-transparent border-none">
            <Pencil size={14} />
          </button>
          <button onClick={() => setDelItem(a)}
            className="p-1.5 text-[#9A9080] hover:text-[#EF4444] transition-colors cursor-pointer bg-transparent border-none">
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <>
      {/* Tab bar */}
      <div
        className="flex items-center gap-6 mb-6"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        {(['articles', 'analytics'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="pb-3 text-[13px] font-sans tracking-[0.04em] cursor-pointer bg-transparent border-none"
            style={{
              color: tab === t ? '#F5A623' : '#9A9080',
              borderBottom: tab === t ? '2px solid #F5A623' : '2px solid transparent',
              marginBottom: '-1px',
            }}
          >
            {C.tabs[t]}
          </button>
        ))}
      </div>

      {tab === 'articles' && (
        <>
          <div className="flex justify-end mb-5">
            <button onClick={() => router.push(ROUTES.ADMIN.CONTENT_NEW)}
              className="text-[14px] font-sans px-4 py-2.5 rounded-[4px] cursor-pointer border-none"
              style={{ background: '#F5A623', color: '#080808' }}>
              {C.addButton}
            </button>
          </div>

          <DataTable
            columns={columns}
            data={articles}
            onRowClick={a => router.push(ROUTES.ADMIN.CONTENT_EDIT(a.id))}
          />

          <ConfirmModal isOpen={!!delItem} onClose={() => setDelItem(null)} onConfirm={handleDelete}
            title="Delete Article" description="This will permanently delete this article."
            confirmLabel="Delete" loading={deleting} />
        </>
      )}

      {tab === 'analytics' && <ContentAnalytics />}
    </>
  )
}
