'use client'

import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'
import { CONTENT } from '@/config/content'

interface ConfirmModalProps {
  isOpen:       boolean
  onClose:      () => void
  onConfirm:    () => void
  title:        string
  description:  string
  confirmLabel: string
  loading?:     boolean
}

export function ConfirmModal({
  isOpen, onClose, onConfirm,
  title, description, confirmLabel, loading,
}: ConfirmModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (isOpen) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-[400px] rounded-[10px] p-6"
        style={{ background: '#111111', border: '0.5px solid rgba(245,166,35,0.2)' }}
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center mb-4"
          style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)' }}
        >
          <AlertTriangle size={18} style={{ color: '#EF4444' }} />
        </div>

        <h3 className="font-serif text-[20px] text-[#F0EDE6] mb-2">{title}</h3>
        <p className="text-[14px] font-sans font-light text-[#9A9080] mb-6 leading-[1.6]">{description}</p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 border border-[rgba(255,255,255,0.1)] text-[#9A9080] text-[14px] font-sans py-2.5 rounded-[4px] hover:text-[#F0EDE6] transition-colors cursor-pointer bg-transparent"
          >
            {CONTENT.admin.confirm.cancel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 text-[14px] font-sans py-2.5 rounded-[4px] transition-colors cursor-pointer border-none disabled:opacity-60"
            style={{ background: '#EF4444', color: '#fff' }}
          >
            {loading ? 'Deleting…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
