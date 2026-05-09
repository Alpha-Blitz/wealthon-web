'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { sendNotification } from '@/lib/admin/notifications'
import { DataTable, type Column } from '@/components/admin/DataTable'
import { FormField, inputStyle, selectStyle } from '@/components/admin/FormField'
import { CONTENT } from '@/config/content'
import type { Partner, Notification } from '@/types/database'

const C = CONTENT.admin.notifications
const TYPES = ['announcement', 'update', 'alert', 'distribution'] as const

interface Props {
  partners:    Partner[]
  initialSent: Notification[]
}

export function NotificationsClient({ partners, initialSent }: Props) {
  const [sent, setSent]         = useState(initialSent)
  const [partnerId, setPartner] = useState('')
  const [type, setType]         = useState<typeof TYPES[number]>('announcement')
  const [title, setTitle]       = useState('')
  const [body, setBody]         = useState('')
  const [sending, setSending]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [success, setSuccess]   = useState(false)

  async function handleSend() {
    if (!body.trim()) { setError('Message is required.'); return }
    setSending(true); setError(null); setSuccess(false)
    const supabase = createClient()
    const res = await sendNotification(supabase, {
      partner_id: partnerId || null,
      title:      title.trim() || `${type.charAt(0).toUpperCase() + type.slice(1)} from Wealthon`,
      body,
      type,
    })
    setSending(false)
    if (res.error) { setError(res.error); return }
    setSent(s => [res.data!, ...s])
    setTitle(''); setBody(''); setPartner(''); setType('announcement')
    setSuccess(true)
  }

  const columns: Column<Notification>[] = [
    {
      key: 'partner_id', label: C.columns.recipient,
      render: n => {
        const partner = n.partner_id ? partners.find(p => p.id === n.partner_id) : null
        return <span className="text-[13px] font-sans text-[#F0EDE6]">{partner?.full_name ?? C.allPartners}</span>
      },
    },
    {
      key: 'body', label: C.columns.message,
      render: n => <span className="text-[12px] font-sans text-[#9A9080] line-clamp-1">{n.body ?? n.message}</span>,
    },
    {
      key: 'type', label: C.columns.type,
      render: n => (
        <span className="text-[11px] font-sans uppercase tracking-[0.06em] px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(245,166,35,0.1)', color: '#F5A623' }}>
          {n.type}
        </span>
      ),
    },
    {
      key: 'sent_at', label: C.columns.sentAt, sortable: true,
      render: n => n.sent_at
        ? <span className="text-[12px] font-sans text-[#9A9080]">{new Date(n.sent_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
        : <span className="text-[#68625A]">—</span>,
    },
    {
      key: 'is_sent', label: C.columns.opened,
      render: n => <span className="text-[12px] font-sans" style={{ color: n.is_sent ? '#22C55E' : '#9A9080' }}>{n.is_sent ? 'Sent' : 'Pending'}</span>,
    },
  ]

  return (
    <div className="flex flex-col gap-6 max-w-[1000px]">
      <div className="rounded-[8px] p-6 flex flex-col gap-4"
        style={{ background: '#111111', border: '0.5px solid rgba(245,166,35,0.15)' }}>
        <h3 className="font-serif text-[18px] text-[#F0EDE6]">{C.compose}<span className="text-gold">.</span></h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label={C.recipient}>
            <select style={selectStyle} value={partnerId} onChange={e => setPartner(e.target.value)}>
              <option value="">{C.allPartners}</option>
              {partners.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
            </select>
          </FormField>
          <FormField label={C.type}>
            <select style={selectStyle} value={type} onChange={e => setType(e.target.value as typeof TYPES[number])}>
              {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </FormField>
        </div>

        <FormField label={C.recipient + ' (optional)'}>
          <input style={inputStyle} value={title} onChange={e => setTitle(e.target.value)} placeholder="Short subject line…" />
        </FormField>

        <FormField label={C.message} required>
          <textarea
            style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="Notification message…"
          />
        </FormField>

        {error   && <p className="text-[12px] font-sans" style={{ color: '#EF4444' }}>{error}</p>}
        {success && <p className="text-[12px] font-sans" style={{ color: '#22C55E' }}>Notification sent.</p>}

        <button onClick={handleSend} disabled={sending}
          className="self-start px-5 py-2.5 rounded-[4px] text-[14px] font-sans cursor-pointer border-none disabled:opacity-60"
          style={{ background: '#F5A623', color: '#080808' }}>
          {sending ? C.sending : C.send}
        </button>
      </div>

      <div className="rounded-[8px] p-5"
        style={{ background: '#111111', border: '0.5px solid rgba(245,166,35,0.15)' }}>
        <h3 className="font-serif text-[18px] text-[#F0EDE6] mb-4">{C.sentLog}<span className="text-gold">.</span></h3>
        <DataTable columns={columns} data={sent} pageSize={15} />
      </div>
    </div>
  )
}
