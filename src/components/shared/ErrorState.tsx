import { AlertCircle } from 'lucide-react'
import { CONTENT } from '@/config/content'

interface ErrorStateProps {
  message?: string
  onRetry?: () => void
}

export function ErrorState({ message = CONTENT.errors.generic, onRetry }: ErrorStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-4 rounded-[8px] p-8 text-center"
      style={{ background: '#111111', border: '0.5px solid rgba(239,68,68,0.2)' }}
    >
      <AlertCircle size={28} style={{ color: '#EF4444' }} />
      <p className="text-[14px] font-sans font-light" style={{ color: '#F0EDE6' }}>
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-[13px] font-sans px-4 py-2 rounded-[4px] transition-colors cursor-pointer border-none"
          style={{ background: 'rgba(239,68,68,0.12)', color: '#EF4444' }}
        >
          {CONTENT.errors.retry}
        </button>
      )}
    </div>
  )
}
