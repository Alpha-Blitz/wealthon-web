'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Shield, Camera, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { usePartner } from '@/context/PartnerContext'
import { StatusPill } from '@/components/shared/StatusPill'
import { CONTENT } from '@/config/content'
import { PARTNER_TIERS } from '@/config/constants'
import { createClient } from '@/lib/supabase/client'
import { updatePartnerAvatarUrl } from '@/lib/db/partners'

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function fmtDate(s: string): string {
  const d = new Date(s)
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`
}

export default function ProfilePage() {
  const partner = usePartner()
  const router  = useRouter()
  const C       = CONTENT.profile
  const tierDef = PARTNER_TIERS[partner.tier as keyof typeof PARTNER_TIERS]

  const [toast, setToast]           = useState<string | null>(null)
  const [avatarSrc, setAvatarSrc]   = useState<string | null>(partner.avatar_url)
  const [uploading, setUploading]   = useState(false)
  const fileInputRef                = useRef<HTMLInputElement>(null)

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 4000)
  }

  function handleEdit() {
    showToast(C.editNote)
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const maxMb = 5
    if (file.size > maxMb * 1024 * 1024) {
      showToast(`Image must be under ${maxMb}MB.`)
      return
    }

    setUploading(true)
    const supabase = createClient()
    const ext  = file.name.split('.').pop() ?? 'jpg'
    const path = `${partner.id}/avatar.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true, contentType: file.type })

    if (uploadError) {
      showToast('Upload failed. Try again.')
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
    const urlWithCacheBust = `${publicUrl}?t=${Date.now()}`

    await updatePartnerAvatarUrl(supabase, partner.id, publicUrl)

    setAvatarSrc(urlWithCacheBust)
    setUploading(false)
    router.refresh()
  }

  return (
    <div className="p-6 flex flex-col gap-6 max-w-[640px]">

      {/* Toast */}
      {toast && (
        <div
          className="fixed top-6 right-6 z-50 max-w-[360px] px-4 py-3 rounded-[6px] text-[13px] font-sans text-[#F0EDE6] shadow-lg"
          style={{ background: '#1a1a1a', border: '1px solid rgba(245,166,35,0.3)' }}
        >
          {toast}
        </div>
      )}

      <h1 className="font-serif text-[28px] text-[#F0EDE6]">{C.title}</h1>

      {/* Avatar + name */}
      <div className="flex items-center gap-5">
        {/* Avatar with upload overlay */}
        <div className="relative w-16 h-16 flex-shrink-0 group">
          {avatarSrc ? (
            <Image
              src={avatarSrc}
              alt={partner.initials}
              fill
              className="rounded-full object-cover"
              style={{ border: '2px solid rgba(245,166,35,0.4)' }}
            />
          ) : (
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-[20px] font-sans font-medium"
              style={{
                background: 'rgba(245,166,35,0.1)',
                border: '2px solid rgba(245,166,35,0.4)',
                color: '#F5A623',
              }}
            >
              {partner.initials}
            </div>
          )}

          {/* Upload overlay */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border-none"
            style={{ background: 'rgba(0,0,0,0.6)' }}
            aria-label="Change profile photo"
          >
            {uploading
              ? <Loader2 size={16} className="text-white animate-spin" />
              : <Camera size={16} className="text-white" />
            }
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>

        <div>
          <p className="font-serif text-[22px] text-[#F0EDE6]">{partner.full_name}</p>
          <div className="flex items-center gap-2 mt-1">
            <StatusPill status={partner.status} />
            <span
              className="inline-flex items-center px-[10px] py-[3px] rounded-full text-[11px] font-sans tracking-[0.05em]"
              style={{
                background: 'rgba(245,166,35,0.12)',
                color: '#F5A623',
                border: '1px solid rgba(245,166,35,0.3)',
              }}
            >
              {tierDef?.label ?? partner.tier}
            </span>
          </div>
          <p className="text-[11px] font-sans text-[#9E9484] mt-1.5">Tap avatar to change photo</p>
        </div>
      </div>

      {/* Details card */}
      <div
        className="rounded-[8px] divide-y"
        style={{ background: '#111111', border: '0.5px solid rgba(245,166,35,0.15)' }}
      >
        {[
          { label: C.name,      value: partner.full_name },
          ...(partner.username ? [{ label: 'Username', value: `@${partner.username}` }] : []),
          { label: C.email,     value: partner.email },
          { label: C.phone,     value: partner.phone ?? '—' },
          { label: C.entryDate, value: fmtDate(partner.entry_date) },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="flex items-center justify-between px-6 py-4"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
          >
            <span className="text-[12px] font-sans text-[#9E9484]">{label}</span>
            <span className="text-[14px] font-sans text-[#F0EDE6]">{value}</span>
          </div>
        ))}
      </div>

      <button
        onClick={handleEdit}
        className="self-start px-5 py-2.5 rounded-[4px] text-[13px] font-sans border cursor-pointer bg-transparent transition-colors hover:border-[rgba(245,166,35,0.4)] hover:text-[#F0EDE6]"
        style={{ borderColor: 'rgba(255,255,255,0.12)', color: '#9E9484' }}
      >
        {C.editButton}
      </button>

      {/* Security note */}
      <div className="flex items-start gap-2">
        <Shield size={13} className="text-[#68625A] flex-shrink-0 mt-0.5" />
        <p className="text-[11px] font-sans font-light text-[#68625A] leading-[1.6]">
          Your information is encrypted and never shared with third parties.
        </p>
      </div>
    </div>
  )
}
