'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { QuarterlyRate } from '@/types/database'
import { DataTable, type Column } from '@/components/admin/DataTable'
import { RateModal } from '@/components/admin/RateModal'

interface Props { initialRates: QuarterlyRate[] }

export function RatesClient({ initialRates }: Props) {
  const [rates, setRates] = useState(initialRates)
  const [open, setOpen]   = useState(false)

  function onSaved(saved: QuarterlyRate) {
    setRates(prev => {
      const idx = prev.findIndex(r => r.quarter === saved.quarter && r.year === saved.year)
      if (idx >= 0) {
        const copy = [...prev]
        copy[idx] = saved
        return copy
      }
      return [saved, ...prev]
    })
  }

  const columns: Column<QuarterlyRate>[] = [
    {
      key: 'quarter', label: 'QUARTER', sortable: true,
      render: r => <span className="font-dm-serif text-[16px] text-[#F0EDE6]">Q{r.quarter}</span>,
    },
    { key: 'year', label: 'YEAR', sortable: true,
      render: r => <span className="text-[13px] font-sans text-[#9A9080]">{r.year}</span>,
    },
    { key: 'monthly_rate', label: 'MONTHLY RATE', sortable: true,
      render: r => (
        <span className="font-dm-serif text-[15px] text-gold">
          {(r.monthly_rate * 100).toFixed(2)}%
        </span>
      ),
    },
    { key: 'monthly_rate', label: 'ANNUAL EQUIV.',
      render: r => (
        <span className="text-[13px] font-sans text-[#9A9080]">
          {(r.monthly_rate * 12 * 100).toFixed(1)}%
        </span>
      ),
    },
    { key: 'notes', label: 'NOTES',
      render: r => <span className="text-[12px] font-sans text-[#9A9080]">{r.notes ?? '—'}</span>,
    },
    { key: 'created_at', label: 'SET ON', sortable: true,
      render: r => (
        <span className="text-[12px] font-sans text-[#9A9080]">
          {new Date(r.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
      ),
    },
  ]

  return (
    <>
      <div className="flex justify-end mb-5">
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 text-[14px] font-sans px-4 py-2.5 rounded-[4px] cursor-pointer border-none"
          style={{ background: '#F5A623', color: '#080808' }}
        >
          <Plus size={14} />
          Set Rate
        </button>
      </div>

      {rates.length === 0 ? (
        <div
          className="rounded-[10px] p-12 text-center"
          style={{ background: '#111111', border: '0.5px solid rgba(245,166,35,0.15)' }}
        >
          <p className="text-[#F0EDE6] font-serif text-[20px] mb-2">No rates set yet.</p>
          <p className="text-[#9A9080] text-[13px] font-sans">
            Set a rate before running distributions.
          </p>
        </div>
      ) : (
        <DataTable columns={columns} data={rates} />
      )}

      <RateModal isOpen={open} onClose={() => setOpen(false)} onSaved={onSaved} />
    </>
  )
}
