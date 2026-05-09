'use client'

import { useState } from 'react'
import { KeyRound, Ban } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { createPartnerAccount, resetPassword, suspendAccount, type AdminUser } from '@/lib/admin/users'
import { SlideOver } from '@/components/admin/SlideOver'
import { ConfirmModal } from '@/components/admin/ConfirmModal'
import { DataTable, type Column } from '@/components/admin/DataTable'
import { FormField, inputStyle, selectStyle } from '@/components/admin/FormField'
import { StatusPill } from '@/components/shared/StatusPill'
import { CONTENT } from '@/config/content'
import type { Partner } from '@/types/database'

const C = CONTENT.admin.users

interface Props {
  initialUsers: AdminUser[]
  partners:     Partner[]
}

export function UsersClient({ initialUsers, partners }: Props) {
  const [users, setUsers]         = useState(initialUsers)
  const [slideOpen, setSlideOpen] = useState(false)
  const [suspendUser, setSuspend] = useState<AdminUser | null>(null)
  const [form, setForm]           = useState({ email: '', partnerId: '', sendInvite: true })
  const [saving, setSaving]       = useState(false)
  const [suspending, setSuspending] = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [resetLink, setResetLink] = useState<string | null>(null)

  async function handleCreate() {
    if (!form.email) { setError('Email is required.'); return }
    setSaving(true); setError(null)
    const supabase = createClient()
    const res = await createPartnerAccount(supabase, form.email, form.partnerId || null, form.sendInvite)
    setSaving(false)
    if (res.error) { setError(res.error); return }
    setSlideOpen(false)
    // Refresh: just close, users list would update on next server render
  }

  async function handleReset(u: AdminUser) {
    const supabase = createClient()
    const res = await resetPassword(supabase, u.email)
    if (res.data) setResetLink(res.data)
    else setError(res.error ?? 'Failed')
  }

  async function handleSuspend() {
    if (!suspendUser) return
    setSuspending(true)
    const supabase = createClient()
    const res = await suspendAccount(supabase, suspendUser.id)
    setSuspending(false)
    if (!res.error) setUsers(us => us.map(u => u.id === suspendUser.id ? { ...u, status: 'suspended' } : u))
    setSuspend(null)
  }

  const columns: Column<AdminUser>[] = [
    {
      key: 'full_name', label: C.columns.name,
      render: u => (
        <div>
          <p className="text-[13px] font-sans text-[#F0EDE6]">{u.full_name ?? u.email.split('@')[0]}</p>
          <p className="text-[11px] font-sans text-[#9A9080]">{u.email}</p>
        </div>
      ),
    },
    { key: 'status', label: C.columns.status, render: u => <StatusPill status={u.status} /> },
    {
      key: 'last_sign_in', label: C.columns.lastLogin, sortable: true,
      render: u => u.last_sign_in
        ? <span className="text-[12px] font-sans text-[#9A9080]">{new Date(u.last_sign_in).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
        : <span className="text-[#68625A] text-[12px]">Never</span>,
    },
    {
      key: 'partner_name', label: C.columns.partner,
      render: u => <span className="text-[12px] font-sans text-[#9A9080]">{u.partner_name ?? '—'}</span>,
    },
    {
      key: 'actions' as keyof AdminUser, label: C.columns.actions,
      render: u => (
        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
          <button onClick={() => handleReset(u)} title={C.reset}
            className="p-1.5 text-[#9A9080] hover:text-[#F5A623] transition-colors cursor-pointer bg-transparent border-none">
            <KeyRound size={14} />
          </button>
          {u.status !== 'suspended' && (
            <button onClick={() => setSuspend(u)} title={C.suspend}
              className="p-1.5 text-[#9A9080] hover:text-[#EF4444] transition-colors cursor-pointer bg-transparent border-none">
              <Ban size={14} />
            </button>
          )}
        </div>
      ),
    },
  ]

  return (
    <>
      <div className="flex justify-end mb-5">
        <button onClick={() => { setForm({ email: '', partnerId: '', sendInvite: true }); setError(null); setSlideOpen(true) }}
          className="text-[14px] font-sans px-4 py-2.5 rounded-[4px] cursor-pointer border-none"
          style={{ background: '#F5A623', color: '#080808' }}>
          {C.addButton}
        </button>
      </div>

      {resetLink && (
        <div className="mb-4 p-3 rounded-[6px] text-[12px] font-mono break-all"
          style={{ background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.2)', color: '#F5A623' }}>
          Reset link: {resetLink}
          <button onClick={() => setResetLink(null)} className="ml-3 text-[#9A9080] cursor-pointer bg-transparent border-none">✕</button>
        </div>
      )}

      <DataTable columns={columns} data={users} />

      <SlideOver isOpen={slideOpen} onClose={() => setSlideOpen(false)} title={C.form.title}>
        <div className="flex flex-col gap-4">
          <FormField label={C.form.email} required>
            <input type="email" style={inputStyle} value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </FormField>
          <FormField label={C.form.partner}>
            <select style={selectStyle} value={form.partnerId}
              onChange={e => setForm(f => ({ ...f, partnerId: e.target.value }))}>
              <option value="">No partner link</option>
              {partners.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
            </select>
          </FormField>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.sendInvite}
              onChange={e => setForm(f => ({ ...f, sendInvite: e.target.checked }))}
              className="accent-[#F5A623]" />
            <span className="text-[13px] font-sans text-[#9A9080]">{C.form.sendInvite}</span>
          </label>
          {error && <p className="text-[12px] font-sans" style={{ color: '#EF4444' }}>{error}</p>}
          <button onClick={handleCreate} disabled={saving}
            className="w-full py-3 rounded-[4px] text-[14px] font-sans cursor-pointer border-none disabled:opacity-60"
            style={{ background: '#F5A623', color: '#080808' }}>
            {saving ? C.form.creating : C.form.create}
          </button>
        </div>
      </SlideOver>

      <ConfirmModal isOpen={!!suspendUser} onClose={() => setSuspend(null)} onConfirm={handleSuspend}
        title="Suspend Account" description={`Suspend ${suspendUser?.email}? They will not be able to log in.`}
        confirmLabel="Suspend" loading={suspending} />
    </>
  )
}
