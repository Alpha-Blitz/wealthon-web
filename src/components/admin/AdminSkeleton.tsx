export function AdminSkeleton({ rows = 3, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="p-6 flex flex-col gap-4 max-w-[1400px] animate-pulse">
      {/* Header skeleton */}
      <div className="h-8 w-48 rounded-[4px]" style={{ background: 'rgba(255,255,255,0.06)' }} />

      {/* Metric cards */}
      <div className={`grid grid-cols-2 lg:grid-cols-${cols} gap-4`}>
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="rounded-[8px] p-5 h-24"
            style={{ background: '#111111', border: '0.5px solid rgba(245,166,35,0.1)' }}>
            <div className="h-3 w-24 rounded mb-3" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <div className="h-6 w-32 rounded" style={{ background: 'rgba(255,255,255,0.06)' }} />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="rounded-[8px] p-5"
        style={{ background: '#111111', border: '0.5px solid rgba(245,166,35,0.1)' }}>
        <div className="h-4 w-40 rounded mb-5" style={{ background: 'rgba(255,255,255,0.06)' }} />
        <div className="flex flex-col gap-3">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="h-10 rounded" style={{ background: 'rgba(255,255,255,0.04)' }} />
          ))}
        </div>
      </div>
    </div>
  )
}
