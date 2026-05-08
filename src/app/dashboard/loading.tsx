export default function DashboardLoading() {
  return (
    <div className="flex h-screen bg-[#080808] overflow-hidden">
      {/* Sidebar skeleton */}
      <div
        className="hidden md:flex flex-col w-[220px] flex-shrink-0 h-full px-4 py-6 gap-3"
        style={{ background: '#0C0C0C', borderRight: '0.5px solid rgba(245,166,35,0.08)' }}
      >
        <div className="h-8 w-28 rounded-[4px] mb-4" style={{ background: 'rgba(255,255,255,0.04)' }} />
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-9 rounded-[6px]" style={{ background: 'rgba(255,255,255,0.04)' }} />
        ))}
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar skeleton */}
        <div
          className="h-14 flex-shrink-0 flex items-center px-6"
          style={{ borderBottom: '0.5px solid rgba(245,166,35,0.08)' }}
        >
          <div className="ml-auto flex items-center gap-3">
            <div className="h-5 w-24 rounded" style={{ background: 'rgba(255,255,255,0.04)' }} />
            <div className="h-8 w-8 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
          </div>
        </div>

        {/* Content skeleton */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          <div className="h-6 w-40 rounded" style={{ background: 'rgba(255,255,255,0.04)' }} />
          {/* Metric cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="rounded-[8px] p-5 h-28"
                style={{ background: '#111111', border: '0.5px solid rgba(245,166,35,0.08)' }}
              />
            ))}
          </div>
          {/* Chart + activity */}
          <div className="flex flex-col md:flex-row gap-4">
            <div
              className="flex-1 rounded-[8px] h-64"
              style={{ background: '#111111', border: '0.5px solid rgba(245,166,35,0.08)' }}
            />
            <div
              className="md:w-[45%] rounded-[8px] h-64"
              style={{ background: '#111111', border: '0.5px solid rgba(245,166,35,0.08)' }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
