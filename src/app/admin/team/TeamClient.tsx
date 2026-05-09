'use client'

import { useState, useMemo } from 'react'
import { DataTable, type Column } from '@/components/admin/DataTable'
import { CONTENT } from '@/config/content'
import type { AuditLog } from '@/types/database'

const C = CONTENT.admin.team

interface AdminMember {
  id:        string
  name:      string
  email:     string
  initials:  string
  role:      string
  section:   string
}

interface Props {
  admins:   AdminMember[]
  auditLog: AuditLog[]
}

const columns: Column<AuditLog>[] = [
  {
    key: 'created_at', label: C.columns.time, sortable: true,
    render: row => (
      <span className="text-[12px] font-sans text-[#9A9080] tabular-nums whitespace-nowrap">
        {new Date(row.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
      </span>
    ),
  },
  {
    key: 'action', label: C.columns.action,
    render: row => <span className="text-[12px] font-mono text-[#F5A623]">{row.action}</span>,
  },
  {
    key: 'entity_type', label: C.columns.entity,
    render: row => (
      <div>
        <span className="text-[12px] font-sans text-[#F0EDE6]">{row.entity_type ?? '—'}</span>
        {row.entity_id && (
          <p className="text-[10px] font-mono text-[#68625A] truncate max-w-[120px]">{row.entity_id}</p>
        )}
      </div>
    ),
  },
  {
    key: 'admin_id', label: C.columns.by,
    render: row => (
      <span className="text-[11px] font-mono text-[#9A9080] truncate max-w-[100px] block">{row.admin_id?.slice(0, 8) ?? '—'}</span>
    ),
  },
  {
    key: 'after_data', label: C.columns.details,
    render: row => {
      const detail = row.after_data ?? row.before_data
      if (!detail) return <span className="text-[11px] font-sans text-[#68625A]">—</span>
      const text = Object.entries(detail).slice(0, 2).map(([k, v]) => `${k}: ${String(v).slice(0, 20)}`).join(', ')
      return <span className="text-[11px] font-sans text-[#9A9080] truncate max-w-[160px] block">{text}</span>
    },
  },
]

export function TeamClient({ admins, auditLog }: Props) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return auditLog
    return auditLog.filter(row =>
      row.action.toLowerCase().includes(q) ||
      (row.entity_type ?? '').toLowerCase().includes(q) ||
      (row.entity_id ?? '').toLowerCase().includes(q)
    )
  }, [auditLog, search])

  return (
    <div className="flex flex-col gap-6">
      {/* Admin cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {admins.map(admin => (
          <div key={admin.id} className="rounded-[8px] p-5 flex items-center gap-4"
            style={{ background: '#111111', border: '0.5px solid rgba(245,166,35,0.15)' }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-[14px] font-sans font-medium flex-shrink-0"
              style={{ background: 'rgba(245,166,35,0.12)', color: '#F5A623' }}>
              {admin.initials}
            </div>
            <div className="min-w-0">
              <p className="text-[14px] font-sans text-[#F0EDE6] truncate">{admin.name}</p>
              <p className="text-[11px] font-sans text-[#9A9080] truncate">{admin.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-sans uppercase tracking-[0.08em] px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(245,166,35,0.12)', color: '#F5A623' }}>
                  {admin.role}
                </span>
                {admin.section && (
                  <span className="text-[10px] font-sans text-[#68625A]">{admin.section}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Audit log */}
      <div className="rounded-[8px] p-5"
        style={{ background: '#111111', border: '0.5px solid rgba(245,166,35,0.15)' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-[18px] text-[#F0EDE6]">{C.auditTitle}<span className="text-gold">.</span></h3>
          <input
            type="text" placeholder="Search actions…" value={search}
            onChange={e => setSearch(e.target.value)}
            className="text-[13px] font-sans text-[#F0EDE6] px-3 py-2 rounded-[6px] outline-none"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', width: 200 }}
          />
        </div>
        <DataTable columns={columns} data={filtered} pageSize={20} />
      </div>
    </div>
  )
}
