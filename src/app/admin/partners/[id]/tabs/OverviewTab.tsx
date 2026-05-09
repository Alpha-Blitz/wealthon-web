'use client'

import dynamic from 'next/dynamic'
import { DataTable, type Column } from '@/components/admin/DataTable'
import { ChartSkeleton } from '@/components/admin/ChartSkeleton'
import type { Transaction } from '@/types/database'

const BarChart = dynamic(
  () => import('@/components/charts/BarChart').then(m => ({ default: m.BarChart })),
  { ssr: false, loading: () => <ChartSkeleton height={240} /> }
)

interface BarDataPoint { month: string; profit: number }

interface Props {
  barData:      BarDataPoint[]
  transactions: Transaction[]
  txColumns:    Column<Transaction>[]
}

export function OverviewTab({ barData, transactions, txColumns }: Props) {
  return (
    <div className="flex flex-col gap-5">
      {barData.length > 0 && (
        <div className="rounded-[8px] p-5" style={{ background: '#111111', border: '0.5px solid rgba(245,166,35,0.15)' }}>
          <h3 className="font-serif text-[16px] text-[#F0EDE6] mb-4">Monthly P&L<span className="text-gold">.</span></h3>
          <BarChart data={barData} />
        </div>
      )}
      <div className="rounded-[8px] p-5" style={{ background: '#111111', border: '0.5px solid rgba(245,166,35,0.15)' }}>
        <h3 className="font-serif text-[16px] text-[#F0EDE6] mb-4">Recent Transactions<span className="text-gold">.</span></h3>
        <DataTable columns={txColumns} data={transactions.slice(0, 5)} />
      </div>
    </div>
  )
}
