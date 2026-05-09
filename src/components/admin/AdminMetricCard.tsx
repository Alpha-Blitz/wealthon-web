import type { LucideIcon } from 'lucide-react'

interface AdminMetricCardProps {
  icon:       LucideIcon
  label:      string
  value:      React.ReactNode
  sub?:       string
  valueColor?: string
}

export function AdminMetricCard({ icon: Icon, label, value, sub, valueColor = '#F5A623' }: AdminMetricCardProps) {
  return (
    <div
      className="rounded-[8px] p-5 flex flex-col gap-4"
      style={{
        background: '#111111',
        border: '0.5px solid rgba(245,166,35,0.15)',
        backgroundImage: 'linear-gradient(180deg, rgba(245,166,35,0.04) 0%, transparent 60%)',
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ border: '1px solid rgba(245,166,35,0.3)', background: 'rgba(245,166,35,0.06)' }}
        >
          <Icon size={18} style={{ color: '#F5A623' }} />
        </div>
        <p className="text-[11px] font-sans uppercase tracking-[0.1em] text-[#8A8070]">{label}</p>
      </div>

      <div>
        <p className="font-dm-serif text-[32px] leading-none" style={{ color: valueColor }}>
          {value}
        </p>
        {sub && (
          <p className="text-[12px] font-sans font-light text-[#8A8070] mt-1.5">{sub}</p>
        )}
      </div>
    </div>
  )
}
