'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, Download, Trash2, FileText } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { CONTENT } from '@/config/content'
import { MAX_DOCUMENT_SIZE_BYTES, ACCEPTED_DOCUMENT_TYPES } from '@/config/constants'
import type { Partner } from '@/types/database'

const C = CONTENT.admin.documents
const MAX_SIZE = MAX_DOCUMENT_SIZE_BYTES

const DOC_TYPES = [
  { key: 'agreement', label: C.agreement },
  { key: 'security',  label: C.security  },
]

interface DocState { url: string | null; uploading: boolean; deleting: boolean }
type Docs = Record<string, DocState>

interface Props { partners: Partner[] }

export function DocumentsClient({ partners }: Props) {
  const [partnerId, setPartnerId] = useState('')
  const [docs, setDocs]           = useState<Docs>({})
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const fileRefs                  = useRef<Record<string, HTMLInputElement | null>>({})

  const loadDocs = useCallback(async (id: string) => {
    setLoading(true)
    const supabase = createClient()
    const newDocs: Docs = {}
    for (const { key } of DOC_TYPES) {
      const path = `${id}/${key}.pdf`
      const { data } = await supabase.storage.from('partner-documents').createSignedUrl(path, 3600)
      newDocs[key] = { url: data?.signedUrl ?? null, uploading: false, deleting: false }
    }
    setDocs(newDocs)
    setLoading(false)
  }, [])

  async function handlePartnerChange(id: string) {
    setPartnerId(id)
    setError(null)
    if (id) await loadDocs(id)
    else setDocs({})
  }

  async function handleUpload(docKey: string, file: File) {
    if (!ACCEPTED_DOCUMENT_TYPES.includes(file.type as typeof ACCEPTED_DOCUMENT_TYPES[number])) { setError('PDF files only.'); return }
    if (file.size > MAX_SIZE) { setError('File exceeds 10 MB limit.'); return }
    setError(null)
    setDocs(d => ({ ...d, [docKey]: { ...d[docKey], uploading: true } }))
    const supabase = createClient()
    const path = `${partnerId}/${docKey}.pdf`
    const { error: uploadErr } = await supabase.storage.from('partner-documents').upload(path, file, { upsert: true })
    if (uploadErr) {
      setError(uploadErr.message)
      setDocs(d => ({ ...d, [docKey]: { ...d[docKey], uploading: false } }))
      return
    }
    const { data } = await supabase.storage.from('partner-documents').createSignedUrl(path, 3600)
    setDocs(d => ({ ...d, [docKey]: { url: data?.signedUrl ?? null, uploading: false, deleting: false } }))
  }

  async function handleDelete(docKey: string) {
    setDocs(d => ({ ...d, [docKey]: { ...d[docKey], deleting: true } }))
    const supabase = createClient()
    await supabase.storage.from('partner-documents').remove([`${partnerId}/${docKey}.pdf`])
    setDocs(d => ({ ...d, [docKey]: { url: null, uploading: false, deleting: false } }))
  }

  return (
    <div className="max-w-[700px]">
      <div className="mb-5">
        <label className="text-[11px] font-sans uppercase tracking-[0.08em] text-[#9A9080] mb-1.5 block">Partner</label>
        <select
          value={partnerId}
          onChange={e => handlePartnerChange(e.target.value)}
          className="w-full text-[14px] font-sans text-[#F0EDE6] px-3 py-2.5 rounded-[6px] outline-none cursor-pointer"
          style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.08)' }}>
          <option value="">{C.selectPartner}</option>
          {partners.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
        </select>
      </div>

      {error && <p className="mb-4 text-[12px] font-sans" style={{ color: '#EF4444' }}>{error}</p>}

      {loading && <p className="text-[13px] font-sans text-[#9A9080]">Loading…</p>}

      {partnerId && !loading && (
        <div className="flex flex-col gap-4">
          {DOC_TYPES.map(({ key, label }) => {
            const doc = docs[key] ?? { url: null, uploading: false, deleting: false }
            return (
              <div key={key} className="rounded-[8px] p-5"
                style={{ background: '#111111', border: '0.5px solid rgba(245,166,35,0.15)' }}>
                <p className="text-[13px] font-sans text-[#F0EDE6] mb-3">{label}</p>

                {doc.url ? (
                  <div className="flex items-center gap-3">
                    <FileText size={16} className="text-[#F5A623] flex-shrink-0" />
                    <span className="text-[12px] font-sans text-[#9A9080] flex-1">{key}.pdf</span>
                    <a href={doc.url} download className="flex items-center gap-1.5 text-[12px] font-sans px-3 py-1.5 rounded-[4px] cursor-pointer"
                      style={{ background: 'rgba(245,166,35,0.1)', color: '#F5A623' }}>
                      <Download size={12} /> {C.download}
                    </a>
                    <button onClick={() => handleDelete(key)} disabled={doc.deleting}
                      className="p-1.5 text-[#9A9080] hover:text-[#EF4444] transition-colors cursor-pointer bg-transparent border-none">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ) : (
                  <label
                    className="flex flex-col items-center gap-2 p-6 rounded-[6px] cursor-pointer transition-colors"
                    style={{ border: '1px dashed rgba(245,166,35,0.2)', background: 'rgba(245,166,35,0.03)' }}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleUpload(key, f) }}>
                    <input
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      ref={el => { fileRefs.current[key] = el }}
                      onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(key, f) }}
                    />
                    {doc.uploading ? (
                      <p className="text-[13px] font-sans text-[#9A9080]">Uploading…</p>
                    ) : (
                      <>
                        <Upload size={20} className="text-[#9A9080]" />
                        <p className="text-[13px] font-sans text-[#9A9080] text-center">{C.dragDrop}</p>
                        <p className="text-[11px] font-sans text-[#68625A]">{C.maxSize}</p>
                      </>
                    )}
                  </label>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
