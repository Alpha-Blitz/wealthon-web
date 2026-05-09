'use client'

import { useState, useCallback, useRef } from 'react'
import { Upload, Download, Trash2, FileText } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { uploadDocument, deleteDocument, getDocumentUrl, type DocumentType } from '@/lib/admin/documents'
import { ConfirmModal } from '@/components/admin/ConfirmModal'
import { CONTENT } from '@/config/content'
import { MAX_DOCUMENT_SIZE_BYTES } from '@/config/constants'

const C = CONTENT.admin.partnerDetail

const DOC_TYPES: { key: DocumentType; label: string }[] = [
  { key: 'agreement', label: C.documents.agreement },
  { key: 'security',  label: C.documents.security  },
]

interface DocState { url: string | null; uploading: boolean; deleting: boolean }
type Docs = Record<DocumentType, DocState>

const INITIAL_DOCS: Docs = {
  agreement: { url: null, uploading: false, deleting: false },
  security:  { url: null, uploading: false, deleting: false },
}

interface Props { partnerId: string }

export function DocumentsTab({ partnerId }: Props) {
  const [docs, setDocs]           = useState<Docs>(INITIAL_DOCS)
  const [loaded, setLoaded]       = useState(false)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [confirmKey, setConfirmKey] = useState<DocumentType | null>(null)
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const loadDocs = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const results = await Promise.all(
      DOC_TYPES.map(({ key }) => getDocumentUrl(supabase, partnerId, key))
    )
    const next: Docs = { ...INITIAL_DOCS }
    DOC_TYPES.forEach(({ key }, i) => {
      next[key] = { url: results[i].data ?? null, uploading: false, deleting: false }
    })
    setDocs(next)
    setLoading(false)
    setLoaded(true)
  }, [partnerId])

  if (!loaded && !loading) loadDocs()

  async function handleUpload(type: DocumentType, file: File) {
    if (file.type !== 'application/pdf') { setError('PDF files only.'); return }
    if (file.size > MAX_DOCUMENT_SIZE_BYTES) { setError('File exceeds 10 MB limit.'); return }
    setError(null)
    setDocs(d => ({ ...d, [type]: { ...d[type], uploading: true } }))
    const supabase = createClient()
    const res = await uploadDocument(supabase, partnerId, file, type)
    if (res.error) {
      setError(res.error)
      setDocs(d => ({ ...d, [type]: { ...d[type], uploading: false } }))
      return
    }
    setDocs(d => ({ ...d, [type]: { url: res.data, uploading: false, deleting: false } }))
  }

  async function handleDelete(type: DocumentType) {
    setDocs(d => ({ ...d, [type]: { ...d[type], deleting: true } }))
    const supabase = createClient()
    await deleteDocument(supabase, partnerId, type)
    setDocs(d => ({ ...d, [type]: { url: null, uploading: false, deleting: false } }))
    setConfirmKey(null)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {error && (
        <p className="col-span-full text-[12px] font-sans" style={{ color: '#EF4444' }}>{error}</p>
      )}

      {loading && (
        <p className="col-span-full text-[13px] font-sans text-[#9A9080]">Loading…</p>
      )}

      {DOC_TYPES.map(({ key, label }) => {
        const doc = docs[key]
        return (
          <div key={key} className="rounded-[8px] p-5 flex flex-col gap-3"
            style={{ background: '#111111', border: '1px solid rgba(245,166,35,0.15)' }}>
            <p className="text-[13px] font-sans text-[#F0EDE6]">{label}</p>

            {doc.url ? (
              <div className="flex items-center gap-3">
                <FileText size={16} className="text-[#F5A623] flex-shrink-0" />
                <span className="text-[12px] font-sans text-[#9A9080] flex-1">{key}.pdf</span>
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[12px] font-sans px-3 py-1.5 rounded-[4px] cursor-pointer"
                  style={{ background: 'rgba(245,166,35,0.1)', color: '#F5A623' }}
                >
                  <Download size={12} /> {C.documents.download}
                </a>
                <button
                  onClick={() => setConfirmKey(key)}
                  disabled={doc.deleting}
                  className="p-1.5 text-[#9A9080] hover:text-[#EF4444] transition-colors cursor-pointer bg-transparent border-none"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ) : (
              <label
                className="flex flex-col items-center gap-2 p-6 rounded-[6px] cursor-pointer transition-colors"
                style={{ border: '1px dashed rgba(245,166,35,0.2)', background: 'rgba(245,166,35,0.03)' }}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleUpload(key, f) }}
              >
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
                    <p className="text-[13px] font-sans text-[#9A9080] text-center">{C.documents.empty}</p>
                    <p className="text-[11px] font-sans text-[#68625A]">{C.documents.maxSize}</p>
                  </>
                )}
              </label>
            )}
          </div>
        )
      })}

      <ConfirmModal
        isOpen={confirmKey !== null}
        onClose={() => setConfirmKey(null)}
        onConfirm={() => confirmKey && handleDelete(confirmKey)}
        title="Delete document?"
        description={`This will permanently remove the ${confirmKey ?? ''}.pdf file.`}
        confirmLabel="Delete"
      />
    </div>
  )
}
