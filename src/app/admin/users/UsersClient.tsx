'use client'

import { useState, useEffect, useRef } from 'react'
import { KeyRound, Ban, Copy, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { resetPassword, suspendAccount, type AdminUser } from '@/lib/admin/users'
import { Modal } from '@/components/admin/Modal'
import { ConfirmModal } from '@/components/admin/ConfirmModal'
import { DataTable, type Column } from '@/components/admin/DataTable'
import { FormField, inputStyle, selectStyle } from '@/components/admin/FormField'
import { StatusPill } from '@/components/shared/StatusPill'
import { CONTENT } from '@/config/content'
import type { Partner } from '@/types/database'

const C = CONTENT.admin.users

const USERNAME_PATTERN = /^[a-z0-9._]{3,30}$/

function passwordStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0
  if (pw.length >= 8)  score++
  if (pw.length >= 12) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^a-zA-Z0-9]/.test(pw)) score++
  if (score <= 1) return { score, label: 'Weak',   color: '#EF4444' }
  if (score <= 2) return { score, label: 'Fair',   color: '#F59E0B' }
  if (score <= 3) return { score, label: 'Good',   color: '#F5A623' }
  return                { score, label: 'Strong', color: '#22C55E' }
}

interface Props {
  initialUsers: AdminUser[]
  partners:     Partner[]
}

export function UsersClient({ initialUsers, partners }: Props) {
  const [users, setUsers]         = useState(initialUsers)
  const [modalOpen, setModal]     = useState(false)
  const [suspendUser, setSuspend] = useState<AdminUser | null>(null)
  const [form, setForm]           = useState({ username: '', password: '', confirm: '', partnerId: '' })
  const [saving, setSaving]       = useState(false)
  const [suspending, setSuspending] = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [resetLink, setResetLink] = useState<string | null>(null)
  const [createdUsername, setCreatedUsername] = useState<string | null>(null)
  const [copied, setCopied]       = useState(false)

  // Username availability debounce
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const u = form.username
    if (!u) { setUsernameStatus('idle'); return }
    if (!USERNAME_PATTERN.test(u)) { setUsernameStatus('invalid'); return }
    setUsernameStatus('checking')
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/admin/check-username?username=${encodeURIComponent(u)}`)
        const { available } = await res.json()
        setUsernameStatus(available ? 'available' : 'taken')
      } catch {
        setUsernameStatus('idle')
      }
    }, 500)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [form.username])

  function openCreate() {
    setForm({ username: '', password: '', confirm: '', partnerId: '' })
    setError(null)
    setCreatedUsername(null)
    setUsernameStatus('idle')
    setModal(true)
  }

  async function handleCreate() {
    if (!form.username || !USERNAME_PATTERN.test(form.username)) {
      setError('Username must be 3–30 characters: letters, numbers, . and _ only.')
      return
    }
    if (usernameStatus === 'taken') { setError('Username is already taken.'); return }
    if (!form.partnerId) { setError('Select a partner to link this account to.'); return }
    if (!form.password) { setError('Password is required.'); return }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return }

    setSaving(true); setError(null)
    const res = await fetch('/api/admin/create-partner-account', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: form.username, password: form.password, partnerId: form.partnerId }),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) { setError(data.error ?? 'Failed to create account'); return }
    setCreatedUsername(data.username)
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

  async function copyUsername() {
    if (!createdUsername) return
    await navigator.clipboard.writeText(createdUsername)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const pwStrength = passwordStrength(form.password)

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
        <button onClick={openCreate}
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

      <Modal isOpen={modalOpen} onClose={() => setModal(false)} title={C.form.title} size="sm">
        {createdUsername ? (
          <div className="flex flex-col items-center gap-5 py-4 text-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)' }}>
              <Check size={22} style={{ color: '#22C55E' }} />
            </div>
            <div>
              <p className="text-[14px] font-sans text-[#F0EDE6] mb-1">Account created.</p>
              <p className="text-[12px] font-sans text-[#9A9080]">Share the username with the partner.</p>
            </div>
            <button
              onClick={copyUsername}
              className="flex items-center gap-2 px-4 py-2.5 rounded-[6px] text-[14px] font-mono transition-colors cursor-pointer border-none"
              style={{ background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.2)', color: '#F5A623' }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {createdUsername}
            </button>
            <button onClick={() => setModal(false)}
              className="text-[13px] font-sans text-[#9A9080] hover:text-[#F0EDE6] cursor-pointer bg-transparent border-none transition-colors">
              Close
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <FormField label="Partner" required>
              <select style={selectStyle} value={form.partnerId}
                onChange={e => setForm(f => ({ ...f, partnerId: e.target.value }))}>
                <option value="">Select partner…</option>
                {partners.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
              </select>
            </FormField>

            <FormField label="Username" required>
              <div className="relative">
                <input
                  type="text" style={inputStyle}
                  value={form.username}
                  onChange={e => setForm(f => ({ ...f, username: e.target.value.toLowerCase() }))}
                  placeholder="e.g. prathik or suhan_k"
                  autoCapitalize="none"
                />
                {form.username && (
                  <span className="absolute right-0 bottom-2 text-[11px] font-sans"
                    style={{
                      color: usernameStatus === 'available' ? '#22C55E'
                           : usernameStatus === 'taken'     ? '#EF4444'
                           : usernameStatus === 'invalid'   ? '#EF4444'
                           : '#9A9080',
                    }}>
                    {usernameStatus === 'checking'  ? 'checking…'
                   : usernameStatus === 'available' ? '✓ available'
                   : usernameStatus === 'taken'     ? '✗ taken'
                   : usernameStatus === 'invalid'   ? '✗ invalid'
                   : ''}
                  </span>
                )}
              </div>
              <p className="text-[11px] font-sans text-[#68625A] mt-1">3–30 chars: letters, numbers, . and _</p>
            </FormField>

            <FormField label="Password" required>
              <input
                type="password" style={inputStyle}
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="Min 8 characters"
              />
              {form.password && (
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex gap-0.5 flex-1">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className="flex-1 h-[3px] rounded-full transition-colors"
                        style={{ background: i <= pwStrength.score ? pwStrength.color : 'rgba(255,255,255,0.08)' }} />
                    ))}
                  </div>
                  <span className="text-[11px] font-sans" style={{ color: pwStrength.color }}>{pwStrength.label}</span>
                </div>
              )}
            </FormField>

            <FormField label="Confirm Password" required>
              <input
                type="password" style={inputStyle}
                value={form.confirm}
                onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                placeholder="Repeat password"
              />
              {form.confirm && form.password !== form.confirm && (
                <p className="text-[11px] font-sans mt-1" style={{ color: '#EF4444' }}>Passwords do not match</p>
              )}
            </FormField>

            {error && <p className="text-[12px] font-sans" style={{ color: '#EF4444' }}>{error}</p>}

            <button onClick={handleCreate} disabled={saving || usernameStatus === 'checking'}
              className="w-full py-3 rounded-[4px] text-[14px] font-sans cursor-pointer border-none disabled:opacity-60 mt-2"
              style={{ background: '#F5A623', color: '#080808' }}>
              {saving ? C.form.creating : C.form.create}
            </button>
          </div>
        )}
      </Modal>

      <ConfirmModal isOpen={!!suspendUser} onClose={() => setSuspend(null)} onConfirm={handleSuspend}
        title="Suspend Account" description={`Suspend ${suspendUser?.email}? They will not be able to log in.`}
        confirmLabel="Suspend" loading={suspending} />
    </>
  )
}
