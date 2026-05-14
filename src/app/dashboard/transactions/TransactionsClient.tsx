'use client'

import { useState, useMemo } from 'react'
import { Download, ChevronLeft, ChevronRight, FileText } from 'lucide-react'
import { StatusPill } from '@/components/shared/StatusPill'
import { formatINR, formatINRCompact } from '@/lib/utils'
import { CONTENT } from '@/config/content'
import { calculateRunningBalance, sumByType } from '@/lib/admin/calculations'
import { TRANSACTION_TYPE_LABELS, type TransactionTypeKey } from '@/config/constants'
import type { Transaction, Partner } from '@/types/database'

const PAGE_SIZE = 10
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function fmtDate(s: string) {
  const d = new Date(s)
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`
}

const FILTER_TYPES = ['all', 'capital_in', 'distribution', 'reinvest', 'capital_out'] as const
type FilterType = (typeof FILTER_TYPES)[number]

interface Props { transactions: Transaction[]; partner: Partner }

export function TransactionsClient({ transactions, partner }: Props) {
  const [typeFilter, setTypeFilter] = useState<FilterType>('all')
  const [page, setPage] = useState(1)
  const C = CONTENT.transactions

  const enriched = useMemo(
    () => calculateRunningBalance(transactions, partner.payout_preference),
    [transactions, partner.payout_preference],
  )

  const filtered = useMemo(() => {
    if (typeFilter === 'all') return enriched
    // Map legacy types alongside new ones so filter "capital_in" also shows old "investment"
    const aliases: Record<FilterType, string[]> = {
      all:          [],
      capital_in:   ['capital_in', 'investment'],
      distribution: ['distribution'],
      reinvest:     ['reinvest', 'pnl_update'],
      capital_out:  ['capital_out', 'withdrawal'],
    }
    return enriched.filter(t => aliases[typeFilter].includes(t.type))
  }, [enriched, typeFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageRows   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const totalIn  = sumByType(transactions, ['capital_in', 'investment'])
  const totalOut = sumByType(transactions, ['capital_out', 'withdrawal', 'distribution'])
  const netBalance = partner.invested_amount

  return (
    <div className="p-6 flex flex-col gap-6 max-w-[1400px]">

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'TOTAL IN',     value: formatINR(totalIn),     color: '#F5A623', sign: '+' },
          { label: 'TOTAL OUT',    value: formatINR(totalOut),    color: '#9A9080', sign: '-' },
          { label: 'NET BALANCE',  value: formatINR(netBalance),  color: '#F5A623', sign: '' },
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
          {FILTER_TYPES.map(type => (
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
              {type === 'all' ? 'All Types' : TRANSACTION_TYPE_LABELS[type as TransactionTypeKey]}
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
        <div
          className="grid text-[11px] font-sans uppercase tracking-[0.08em] px-4 py-2.5"
          style={{
            background: '#0F0F0F',
            color: '#F5A623',
            gridTemplateColumns: '110px 140px 1fr 130px 110px 110px',
          }}
        >
          <span>{C.columns.date}</span>
          <span>{C.columns.type}</span>
          <span>DESCRIPTION</span>
          <span>{C.columns.amount}</span>
          <span>BALANCE</span>
          <span>INVOICE</span>
        </div>

        {pageRows.map((tx, i) => {
          const label = TRANSACTION_TYPE_LABELS[tx.type as TransactionTypeKey] ?? tx.type
          return (
            <div
              key={tx.id}
              className="grid px-4 py-2.5 font-sans items-center"
              style={{
                gridTemplateColumns: '110px 140px 1fr 130px 110px 110px',
                background: i % 2 === 0 ? '#111111' : '#0D0D0D',
                borderTop: '1px solid rgba(255,255,255,0.04)',
              }}
            >
              <span className="text-[#9E9484] text-[11px]">{fmtDate(tx.date)}</span>
              <span><StatusPill status={label} /></span>
              <span className="text-[12px] text-[#F0EDE6] truncate pr-2">{tx.notes || '—'}</span>
              <span className="text-[13px] tabular-nums" style={{
                color: tx.amount >= 0 ? '#F0EDE6' : '#EF4444', fontWeight: 500,
              }}>
                {tx.amount >= 0 ? '+' : ''}{formatINR(tx.amount)}
              </span>
              <span className="text-[12px] tabular-nums text-gold">
                {tx.running_balance !== null ? formatINRCompact(tx.running_balance) : '—'}
              </span>
              <span>
                {tx.invoice_url ? (
                  <a
                    href={tx.invoice_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[12px] font-sans text-gold hover:text-gold-secondary"
                  >
                    <FileText size={12} />
                    Download
                  </a>
                ) : (
                  <span className="text-[12px] text-[#7F7566]">—</span>
                )}
              </span>
            </div>
          )
        })}

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
