import { cn } from '@/lib/utils'

const PILL_STYLES: Record<string, { bg: string; text: string; border: string; label: string }> = {
  active:      { bg: 'rgba(34,197,94,0.12)',  text: '#22C55E', border: 'rgba(34,197,94,0.3)',  label: 'Active' },
  completed:   { bg: 'rgba(34,197,94,0.12)',  text: '#22C55E', border: 'rgba(34,197,94,0.3)',  label: 'Completed' },
  pending:     { bg: 'rgba(245,158,11,0.12)', text: '#F59E0B', border: 'rgba(245,158,11,0.3)', label: 'Pending' },
  processing:  { bg: 'rgba(59,130,246,0.12)', text: '#3B82F6', border: 'rgba(59,130,246,0.3)', label: 'Processing' },
  paused:      { bg: 'rgba(107,114,128,0.12)',text: '#6B7280', border: 'rgba(107,114,128,0.3)',label: 'Paused' },
  exited:      { bg: 'rgba(239,68,68,0.12)',  text: '#EF4444', border: 'rgba(239,68,68,0.3)',  label: 'Exited' },
  cancelled:   { bg: 'rgba(239,68,68,0.12)',  text: '#EF4444', border: 'rgba(239,68,68,0.3)',  label: 'Cancelled' },
  held:        { bg: 'rgba(245,166,35,0.12)', text: '#F5A623', border: 'rgba(245,166,35,0.3)', label: 'Held as collateral' },
  returned:    { bg: 'rgba(107,114,128,0.12)',text: '#6B7280', border: 'rgba(107,114,128,0.3)',label: 'Returned' },
  encashed:    { bg: 'rgba(239,68,68,0.12)',  text: '#EF4444', border: 'rgba(239,68,68,0.3)',  label: 'Encashed' },
  investment:  { bg: 'rgba(34,197,94,0.12)',  text: '#22C55E', border: 'rgba(34,197,94,0.3)',  label: 'Investment' },
  distribution:{ bg: 'rgba(245,166,35,0.12)', text: '#F5A623', border: 'rgba(245,166,35,0.3)', label: 'Distribution' },
  fee:         { bg: 'rgba(239,68,68,0.12)',  text: '#EF4444', border: 'rgba(239,68,68,0.3)',  label: 'Fee' },
  pnl_update:  { bg: 'rgba(59,130,246,0.12)', text: '#3B82F6', border: 'rgba(59,130,246,0.3)', label: 'P&L Update' },
  withdrawal:  { bg: 'rgba(239,68,68,0.12)',  text: '#EF4444', border: 'rgba(239,68,68,0.3)',  label: 'Withdrawal' },
}

const FALLBACK = { bg: 'rgba(107,114,128,0.12)', text: '#6B7280', border: 'rgba(107,114,128,0.3)', label: '' }

interface StatusPillProps {
  status: string
  className?: string
  labelOverride?: string
}

export function StatusPill({ status, className, labelOverride }: StatusPillProps) {
  const style = PILL_STYLES[status.toLowerCase()] ?? FALLBACK
  const label = labelOverride ?? (style.label || status)

  return (
    <span
      className={cn('inline-flex items-center px-[10px] py-[3px] rounded-full text-[11px] font-sans tracking-[0.05em] whitespace-nowrap', className)}
      style={{ background: style.bg, color: style.text, border: `1px solid ${style.border}` }}
    >
      {label}
    </span>
  )
}
