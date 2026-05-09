'use client'

import { Plus } from 'lucide-react'
import { DataTable, type Column } from '@/components/admin/DataTable'
import { CONTENT } from '@/config/content'
import type { Transaction } from '@/types/database'

const C = CONTENT.admin.partnerDetail

interface Props {
  transactions: Transaction[]
  txColumns:    Column<Transaction>[]
  onAdd:        () => void
}

export function TransactionsTab({ transactions, txColumns, onAdd }: Props) {
  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={onAdd}
          className="text-[13px] font-sans px-4 py-2 rounded-[4px] cursor-pointer border-none transition-colors"
          style={{ background: '#F5A623', color: '#080808' }}>
          <Plus size={13} className="inline mr-1" />{C.addTransaction}
        </button>
      </div>
      <DataTable columns={txColumns} data={transactions} />
    </div>
  )
}
