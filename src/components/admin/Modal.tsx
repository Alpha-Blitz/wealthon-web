'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'

const SIZES = { sm: '420px', md: '560px', lg: '720px' } as const

interface ModalProps {
  isOpen:   boolean
  onClose:  () => void
  title:    string
  size?:    keyof typeof SIZES
  children: React.ReactNode
  footer?:  React.ReactNode
}

export function Modal({ isOpen, onClose, title, size = 'md', children, footer }: ModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (isOpen) {
      document.addEventListener('keydown', handler)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />
      <div
        className="relative w-full flex flex-col"
        style={{
          maxWidth: SIZES[size],
          maxHeight: 'calc(100vh - 80px)',
          background: '#111111',
          border: '0.5px solid rgba(245,166,35,0.3)',
          borderRadius: '8px',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-8 py-6 flex-shrink-0"
          style={{ borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}
        >
          <h2 className="font-serif text-[22px] text-[#F0EDE6]">
            {title}<span style={{ color: '#F5A623' }}>.</span>
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-[4px] text-[#9A9080] hover:text-[#F0EDE6] hover:bg-[rgba(255,255,255,0.06)] transition-colors cursor-pointer bg-transparent border-none"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            className="flex justify-end gap-3 px-8 py-5 flex-shrink-0"
            style={{ borderTop: '0.5px solid rgba(255,255,255,0.06)' }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
