'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { createArticle, updateArticle, publishArticle, type Article, type ArticleInput } from '@/lib/admin/content'
import { ARTICLE_CATEGORIES } from '@/config/constants'
import { FormField, inputStyle, selectStyle } from '@/components/admin/FormField'
import { ROUTES } from '@/config/routes'
import { CONTENT } from '@/config/content'

const C = CONTENT.admin.content.editor

interface Props { article: Article | null }

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export function ArticleEditor({ article }: Props) {
  const router = useRouter()
  const [form, setForm] = useState<Omit<ArticleInput, 'created_by' | 'slug'>>({
    title:    article?.title    ?? '',
    author:   article?.author   ?? '',
    category: article?.category ?? ARTICLE_CATEGORIES[0],
    status:   article?.status   ?? 'draft',
    body:     article?.body     ?? '',
  })
  const [preview, setPreview] = useState(false)
  const [saving, setSaving]   = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  async function handleSave() {
    if (!form.title) { setError('Title is required.'); return }
    setSaving(true); setError(null)
    const supabase = createClient()
    const input: ArticleInput = {
      ...form,
      slug:       article?.slug ?? slugify(form.title),
      created_by: null,
    }
    const res = article
      ? await updateArticle(supabase, article.id, input)
      : await createArticle(supabase, input)
    setSaving(false)
    if (res.error) { setError(res.error); return }
    router.push(ROUTES.ADMIN.CONTENT)
  }

  async function handlePublish() {
    if (!article) { await handleSave(); return }
    setPublishing(true); setError(null)
    const supabase = createClient()
    const res = await publishArticle(supabase, article.id)
    setPublishing(false)
    if (res.error) { setError(res.error); return }
    router.push(ROUTES.ADMIN.CONTENT)
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3 mb-1">
        <button onClick={() => router.push(ROUTES.ADMIN.CONTENT)}
          className="text-[13px] font-sans text-[#9A9080] hover:text-[#F5A623] transition-colors cursor-pointer bg-transparent border-none">
          ← Back
        </button>
        <h1 className="font-serif text-[24px] text-[#F0EDE6]">{article ? C.editTitle : C.newTitle}</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FormField label={C.title}>
          <input style={inputStyle} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
        </FormField>
        <FormField label={C.author}>
          <input style={inputStyle} value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))} />
        </FormField>
        <FormField label={C.category}>
          <select style={selectStyle} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
            {ARTICLE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </FormField>
      </div>

      {/* Body editor with preview toggle */}
      <div className="rounded-[8px] overflow-hidden"
        style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-1 px-3 py-2"
          style={{ background: '#111111', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <button onClick={() => setPreview(false)}
            className="px-3 py-1 rounded-[3px] text-[12px] font-sans cursor-pointer border-none transition-all"
            style={{ background: !preview ? 'rgba(245,166,35,0.12)' : 'transparent', color: !preview ? '#F5A623' : '#9A9080' }}>
            {C.edit}
          </button>
          <button onClick={() => setPreview(true)}
            className="px-3 py-1 rounded-[3px] text-[12px] font-sans cursor-pointer border-none transition-all"
            style={{ background: preview ? 'rgba(245,166,35,0.12)' : 'transparent', color: preview ? '#F5A623' : '#9A9080' }}>
            {C.preview}
          </button>
        </div>
        {preview ? (
          <div className="p-5 min-h-[300px] text-[14px] font-sans text-[#F0EDE6] whitespace-pre-wrap leading-relaxed"
            style={{ background: '#0d0d0d' }}>
            {form.body || <span className="text-[#68625A]">Nothing to preview.</span>}
          </div>
        ) : (
          <textarea
            value={form.body}
            onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
            placeholder="Write in Markdown…"
            className="w-full text-[14px] font-mono text-[#F0EDE6] p-5 outline-none min-h-[300px] resize-y"
            style={{ background: '#0d0d0d', border: 'none', color: '#F0EDE6' }}
          />
        )}
      </div>

      {error && <p className="text-[12px] font-sans" style={{ color: '#EF4444' }}>{error}</p>}

      <div className="flex gap-3">
        <button onClick={handleSave} disabled={saving}
          className="px-5 py-2.5 rounded-[4px] text-[14px] font-sans cursor-pointer border-none disabled:opacity-60"
          style={{ background: 'rgba(255,255,255,0.06)', color: '#F0EDE6' }}>
          {saving ? C.saving : C.saveDraft}
        </button>
        <button onClick={handlePublish} disabled={publishing || saving}
          className="px-5 py-2.5 rounded-[4px] text-[14px] font-sans cursor-pointer border-none disabled:opacity-60"
          style={{ background: '#F5A623', color: '#080808' }}>
          {publishing ? C.publishing : C.publish}
        </button>
      </div>
    </div>
  )
}
