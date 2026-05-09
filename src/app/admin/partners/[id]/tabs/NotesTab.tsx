'use client'

import { CONTENT } from '@/config/content'

const C = CONTENT.admin.partnerDetail

interface Props {
  noteText:     string
  setNoteText:  (text: string) => void
  partnerNotes: string | null | undefined
}

export function NotesTab({ noteText, setNoteText, partnerNotes }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-3">
        <textarea
          value={noteText}
          onChange={e => setNoteText(e.target.value)}
          placeholder={C.notePlaceholder}
          className="flex-1 text-[14px] font-sans text-[#F0EDE6] px-3 py-2.5 rounded-[6px] outline-none resize-none"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', minHeight: 80 }}
        />
        <button onClick={() => setNoteText('')}
          className="self-end px-4 py-2.5 text-[13px] font-sans rounded-[4px] cursor-pointer border-none"
          style={{ background: '#F5A623', color: '#080808' }}>
          {C.addNote}
        </button>
      </div>
      {partnerNotes && (
        <div className="rounded-[6px] p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-[13px] font-sans text-[#F0EDE6] leading-[1.6]">{partnerNotes}</p>
        </div>
      )}
    </div>
  )
}
