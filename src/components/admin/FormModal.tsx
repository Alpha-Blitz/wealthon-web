'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'

interface FormModalProps {
  isOpen:   boolean
  onClose:  () => void
  title:    string
  children: React.ReactNode
  width?:   string
}

export function FormModal({ isOpen, onClose, title, children, width = 'max-w-[520px]' }: FormModalProps) {
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
        className={`relative w-full ${width} rounded-[10px] flex flex-col max-h-[90vh]`}
        style={{ background: '#111111', border: '0.5px solid rgba(245,166,35,0.2)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5 flex-shrink-0"
          style={{ borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}
        >
          <h2 className="font-serif text-[20px] text-[#F0EDE6]">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-[4px] text-[#9A9080] hover:text-[#F0EDE6] hover:bg-[rgba(255,255,255,0.06)] transition-colors cursor-pointer bg-transparent border-none"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>
      </div>
    </div>
  )
}
