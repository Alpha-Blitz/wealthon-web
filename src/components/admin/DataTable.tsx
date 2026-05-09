'use client'

import { useState } from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'

export interface Column<T> {
  key:       keyof T | string
  label:     string
  render?:   (row: T) => React.ReactNode
  sortable?: boolean
  width?:    string
}

interface DataTableProps<T extends { id: string }> {
  columns:     Column<T>[]
  data:        T[]
  onRowClick?: (row: T) => void
  loading?:    boolean
  emptyText?:  string
  pageSize?:   number
}

export function DataTable<T extends { id: string }>({
  columns, data, onRowClick, loading, emptyText = 'No records found.', pageSize = 20,
}: DataTableProps<T>) {
  const [sortKey, setSortKey]   = useState<string | null>(null)
  const [sortDir, setSortDir]   = useState<'asc' | 'desc'>('asc')
  const [page, setPage]         = useState(0)

  function handleSort(key: string) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
    setPage(0)
  }

  const sorted = [...data].sort((a, b) => {
    if (!sortKey) return 0
    const av = (a as Record<string, unknown>)[sortKey]
    const bv = (b as Record<string, unknown>)[sortKey]
    if (av == null && bv == null) return 0
    if (av == null) return 1
    if (bv == null) return -1
    const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true })
    return sortDir === 'asc' ? cmp : -cmp
  })

  const totalPages = Math.ceil(sorted.length / pageSize)
  const paged      = sorted.slice(page * pageSize, (page + 1) * pageSize)

  return (
    <div className="w-full">
      <div className="overflow-x-auto rounded-[8px]" style={{ border: '0.5px solid rgba(245,166,35,0.15)' }}>
        <table className="w-full border-collapse">
          <thead>
            <tr style={{ background: '#0F0F0F' }}>
              {columns.map(col => (
                <th
                  key={String(col.key)}
                  className="text-left px-4 py-3 text-[11px] font-sans uppercase tracking-[0.08em]"
                  style={{ color: '#F5A623', width: col.width, cursor: col.sortable ? 'pointer' : 'default', userSelect: 'none' }}
                  onClick={() => col.sortable && handleSort(String(col.key))}
                >
                  <span className="flex items-center gap-1.5">
                    {col.label}
                    {col.sortable && (
                      sortKey === String(col.key)
                        ? sortDir === 'asc' ? <ChevronUp size={11} /> : <ChevronDown size={11} />
                        : <ChevronsUpDown size={11} className="opacity-30" />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-[#9A9080] text-[14px]">
                  Loading…
                </td>
              </tr>
            ) : paged.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-[#9A9080] text-[14px]">
                  {emptyText}
                </td>
              </tr>
            ) : paged.map((row, i) => (
              <tr
                key={row.id}
                onClick={() => onRowClick?.(row)}
                style={{
                  background: i % 2 === 0 ? '#111111' : '#0D0D0D',
                  borderTop: '1px solid rgba(255,255,255,0.04)',
                  cursor: onRowClick ? 'pointer' : 'default',
                }}
                className={onRowClick ? 'hover:bg-[rgba(245,166,35,0.04)] transition-colors' : ''}
              >
                {columns.map(col => (
                  <td
                    key={String(col.key)}
                    className="px-4 py-3 text-[14px] font-sans text-[#F0EDE6]"
                  >
                    {col.render
                      ? col.render(row)
                      : String((row as Record<string, unknown>)[String(col.key)] ?? '—')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-3 px-1">
          <span className="text-[12px] text-[#9A9080] font-sans">
            {page * pageSize + 1}–{Math.min((page + 1) * pageSize, data.length)} of {data.length}
          </span>
          <div className="flex gap-1">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className="w-7 h-7 rounded-[4px] text-[12px] font-sans transition-colors cursor-pointer border-none"
                style={{
                  background: i === page ? 'rgba(245,166,35,0.15)' : 'transparent',
                  color: i === page ? '#F5A623' : '#9A9080',
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
