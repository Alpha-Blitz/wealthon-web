'use client'

import { CONTENT } from '@/config/content'

const C = CONTENT.admin.partnerDetail

export function DocumentsTab() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[{ key: 'agreement', label: C.documents.agreement }, { key: 'security', label: C.documents.security }].map(doc => (
        <div key={doc.key} className="rounded-[8px] p-5 flex flex-col gap-3"
          style={{ background: '#111111', border: '1px dashed rgba(245,166,35,0.2)' }}>
          <p className="text-[13px] font-sans text-[#F0EDE6]">{doc.label}</p>
          <p className="text-[12px] font-sans text-[#9A9080]">{C.documents.empty}</p>
          <button className="text-[12px] font-sans px-3 py-2 rounded-[4px] cursor-pointer w-fit"
            style={{ border: '1px solid rgba(245,166,35,0.3)', color: '#F5A623', background: 'transparent' }}>
            {C.documents.upload}
          </button>
          <p className="text-[11px] font-sans text-[#9A9080]">{C.documents.maxSize}</p>
        </div>
      ))}
    </div>
  )
}
