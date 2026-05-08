import { type LucideIcon } from 'lucide-react'

interface MetricCardProps {
  icon: LucideIcon
  label: string
  value: React.ReactNode
  sub: string
  valueColor?: string
}

export function MetricCard({ icon: Icon, label, value, sub, valueColor = '#F5A623' }: MetricCardProps) {
  return (
    <div
      className="rounded-[8px] p-6 flex flex-col gap-4 relative overflow-hidden"
      style={{
        background: '#111111',
        border: '0.5px solid rgba(245,166,35,0.15)',
      }}
    >
      {/* Gold top gradient */}
      <div
        className="absolute inset-x-0 top-0 h-[60px] pointer-events-none"
        style={{ background: 'linear-gradient(180deg, rgba(245,166,35,0.06) 0%, transparent 100%)' }}
      />

      {/* Icon + label row */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ border: '1px solid rgba(245,166,35,0.35)', color: '#F5A623' }}
        >
          <Icon size={18} />
        </div>
        <p className="text-[11px] font-sans uppercase tracking-[0.1em] leading-tight" style={{ color: '#9E9484' }}>
          {label}
        </p>
      </div>

      {/* Value */}
      <p className="font-dm-serif text-[32px] font-semibold leading-none" style={{ color: valueColor }}>
        {value}
      </p>

      {/* Sub-label */}
      <p className="text-[13px] font-sans font-light" style={{ color: '#9E9484' }}>
        {sub}
      </p>
    </div>
  )
}
