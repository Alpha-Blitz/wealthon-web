'use client'

import { Plus } from 'lucide-react'
import { DataTable, type Column } from '@/components/admin/DataTable'
import { CONTENT } from '@/config/content'
import type { PnLReport } from '@/types/database'

const C = CONTENT.admin.partnerDetail

interface Props {
  pnlReports: (PnLReport & { id: string })[]
  rptColumns:  Column<PnLReport & { id: string }>[]
  onAdd:       () => void
}

export function PnLReportsTab({ pnlReports, rptColumns, onAdd }: Props) {
  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={onAdd}
          className="text-[13px] font-sans px-4 py-2 rounded-[4px] cursor-pointer border-none"
          style={{ background: '#F5A623', color: '#080808' }}>
          <Plus size={13} className="inline mr-1" />{C.addReport}
        </button>
      </div>
      <DataTable columns={rptColumns} data={pnlReports} />
    </div>
  )
}
