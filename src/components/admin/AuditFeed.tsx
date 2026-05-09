import type { AuditLog } from '@/types/database'

const MONTH = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function fmtTime(iso: string): string {
  const d = new Date(iso)
  return `${d.getDate()} ${MONTH[d.getMonth()]} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

function fmtAction(action: string): string {
  return action.replace('.', ' › ').replace(/_/g, ' ')
}

interface AuditFeedProps {
  entries: AuditLog[]
  limit?:  number
}

export function AuditFeed({ entries, limit = 8 }: AuditFeedProps) {
  const shown = entries.slice(0, limit)
  return (
    <div className="flex flex-col">
      {shown.map((entry, i) => (
        <div
          key={entry.id}
          className="flex items-start gap-3 py-3"
          style={{ borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : undefined }}
        >
          <div
            className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
            style={{ background: '#F5A623' }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-sans text-[#F0EDE6] capitalize">
              {fmtAction(entry.action)}
            </p>
            <p className="text-[11px] font-sans text-[#9A9080] mt-0.5">
              {entry.entity_type} · {fmtTime(entry.created_at)}
            </p>
          </div>
        </div>
      ))}
      {shown.length === 0 && (
        <p className="text-[13px] font-sans text-[#9A9080] py-4">No recent activity.</p>
      )}
    </div>
  )
}
