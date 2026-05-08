import { cn } from '@/lib/utils'

interface LoadingStateProps {
  className?: string
  rows?: number
}

export function LoadingState({ className, rows = 3 }: LoadingStateProps) {
  return (
    <div className={cn('flex flex-col gap-3 animate-pulse', className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-10 rounded-[4px]"
          style={{
            background: 'rgba(245,166,35,0.06)',
            width: i === 0 ? '100%' : i === rows - 1 ? '60%' : '80%',
          }}
        />
      ))}
    </div>
  )
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn('rounded-[8px] p-6 animate-pulse', className)}
      style={{ background: '#111111', border: '0.5px solid rgba(245,166,35,0.15)' }}
    >
      <div className="h-3 w-24 rounded mb-4" style={{ background: 'rgba(245,166,35,0.1)' }} />
      <div className="h-8 w-32 rounded mb-2" style={{ background: 'rgba(245,166,35,0.08)' }} />
      <div className="h-3 w-40 rounded" style={{ background: 'rgba(255,255,255,0.04)' }} />
    </div>
  )
}
