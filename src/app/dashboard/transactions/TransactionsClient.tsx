'use client'

import { useState, useMemo } from 'react'
import { Download, ChevronLeft, ChevronRight } from 'lucide-react'
import { StatusPill } from '@/components/shared/StatusPill'
import { formatINR } from '@/lib/utils'
import { CONTENT } from '@/config/content'
import type { Transaction, Partner } from '@/types/database'

const PAGE_SIZE = 10
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function fmtDate(s: string) {
  const d = new Date(s)
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`
}

const TYPE_LABELS: Record<string, string> = {
  investment: 'Investment', distribution: 'Distribution', fee: 'Fee',
  pnl_update: 'P&L Update', withdrawal: 'Withdrawal',
}

interface Props { transactions: Transaction[]; partner: Partner }

export function TransactionsClient({ transactions, partner }: Props) {
  const [typeFilter, setTypeFilter] = useState('all')
  const [page, setPage] = useState(1)
  const C = CONTENT.transactions

  const filtered = useMemo(() =>
    typeFilter === 'all' ? transactions : transactions.filter(t => t.type === typeFilter),
    [transactions, typeFilter]
  )

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageRows   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // Summary metrics
  const totalInvested    = transactions.filter(t => t.type === 'investment').reduce((s, t) => s + t.amount, 0)
  const totalDistributed = transactions.filter(t => t.type === 'distribution').reduce((s, t) => s + t.amount, 0)
  const netPnl           = partner.invested_amount > 0
    ? transactions.reduce((s, t) => s + t.amount, 0)
    : 0

  return (
    <div className="p-6 flex flex-col gap-6 max-w-[1400px]">

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: C.totalInvested,    value: formatINR(totalInvested),    color: '#F5A623', sign: '' },
          { label: C.totalDistributed, value: formatINR(totalDistributed), color: '#22C55E', sign: '+' },
          { label: C.netPnl,           value: formatINR(Math.abs(netPnl)), color: netPnl >= 0 ? '#22C55E' : '#EF4444', sign: netPnl >= 0 ? '+' : '-' },
        ].map(({ label, value, color, sign }) => (
          <div
            key={label}
            className="rounded-[8px] p-5"
            style={{ background: '#111111', border: '0.5px solid rgba(245,166,35,0.15)' }}
          >
            <p className="text-[11px] font-sans uppercase tracking-[0.1em] text-[#9E9484] mb-2">{label}</p>
            <p className="font-dm-serif text-[28px] font-semibold" style={{ color }}>
              {sign}{value}
            </p>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {['all', 'investment', 'distribution', 'fee', 'pnl_update', 'withdrawal'].map(type => (
            <button
              key={type}
              onClick={() => { setTypeFilter(type); setPage(1) }}
              className="px-3 py-1.5 rounded-[4px] text-[12px] font-sans transition-all cursor-pointer border"
              style={{
                background: typeFilter === type ? 'rgba(245,166,35,0.12)' : 'transparent',
                color:      typeFilter === type ? '#F5A623' : '#9E9484',
                borderColor: typeFilter === type ? 'rgba(245,166,35,0.4)' : 'rgba(255,255,255,0.08)',
              }}
            >
              {type === 'all' ? 'All Types' : TYPE_LABELS[type]}
            </button>
          ))}
        </div>
        <button
          className="flex items-center gap-2 px-3 py-1.5 rounded-[4px] text-[12px] font-sans text-[#9E9484] border cursor-pointer bg-transparent"
          style={{ borderColor: 'rgba(255,255,255,0.08)' }}
        >
          <Download size={13} />
          {C.exportCsv}
        </button>
      </div>

      {/* Table */}
      <div
        className="rounded-[8px] overflow-hidden"
        style={{ border: '0.5px solid rgba(245,166,35,0.15)' }}
      >
        {/* Header */}
        <div
          className="grid text-[11px] font-sans uppercase tracking-[0.08em] px-4 py-2.5"
          style={{
            background: '#0F0F0F',
            color: '#F5A623',
            gridTemplateColumns: '100px 130px 130px 120px 1fr',
          }}
        >
          {[C.columns.date, C.columns.type, C.columns.amount, C.columns.status, C.columns.notes].map(col => (
            <span key={col}>{col}</span>
          ))}
        </div>

        {/* Rows */}
        {pageRows.map((tx, i) => (
          <div
            key={tx.id}
            className="grid px-4 py-2 font-sans items-center"
            style={{
              gridTemplateColumns: '100px 130px 130px 120px 1fr',
              background: i % 2 === 0 ? '#111111' : '#0D0D0D',
              borderTop: '1px solid rgba(255,255,255,0.04)',
            }}
          >
            <span className="text-[#9E9484] text-[11px]">{fmtDate(tx.date)}</span>
            <span><StatusPill status={tx.type} /></span>
            <span className="text-[13px] tabular-nums" style={{ color: tx.amount >= 0 ? '#22C55E' : '#EF4444', fontWeight: 500 }}>
              {tx.amount >= 0 ? '+' : ''}{formatINR(tx.amount)}
            </span>
            <span><StatusPill status={tx.status} /></span>
            <span className="text-[#9E9484] text-[11px] truncate pr-2">{tx.notes || '—'}</span>
          </div>
        ))}

        {pageRows.length === 0 && (
          <div className="px-4 py-8 text-center text-[14px] font-sans text-[#68625A]" style={{ background: '#111111' }}>
            No transactions found.
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-[12px] font-sans text-[#9E9484]">
          {C.showing} {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)} {C.to}{' '}
          {Math.min(page * PAGE_SIZE, filtered.length)} {C.of} {filtered.length} {C.transactionsLabel}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="w-8 h-8 flex items-center justify-center rounded-[4px] text-[#9E9484] hover:text-[#F0EDE6] disabled:opacity-30 cursor-pointer bg-transparent border-none"
          >
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
            <button
              key={n}
              onClick={() => setPage(n)}
              className="w-8 h-8 flex items-center justify-center rounded-[4px] text-[12px] font-sans cursor-pointer border-none"
              style={{
                background: page === n ? 'rgba(245,166,35,0.12)' : 'transparent',
                color: page === n ? '#F5A623' : '#9E9484',
              }}
            >
              {n}
            </button>
          ))}
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="w-8 h-8 flex items-center justify-center rounded-[4px] text-[#9E9484] hover:text-[#F0EDE6] disabled:opacity-30 cursor-pointer bg-transparent border-none"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
