import type { SupabaseClient } from '@supabase/supabase-js'
import { TABLE } from '@/config/api'
import { ok, type Result } from './index'

export interface ServiceStatus {
  name:   string
  ok:     boolean
  detail: string | undefined
}

export async function checkDatabaseService(supabase: SupabaseClient): Promise<{ ok: boolean; detail?: string }> {
  const { error } = await supabase.from(TABLE.PARTNERS).select('id').limit(1)
  return error ? { ok: false, detail: error.message } : { ok: true }
}

export async function checkAuthService(supabase: SupabaseClient): Promise<{ ok: boolean; detail?: string }> {
  const { data, error } = await supabase.auth.getSession()
  return { ok: !error && !!data.session, detail: error?.message }
}

export async function checkStorageService(supabase: SupabaseClient): Promise<{ ok: boolean; detail?: string }> {
  const { error } = await supabase.storage.getBucket('partner-documents')
  return error ? { ok: false, detail: error.message } : { ok: true }
}

export async function runServiceChecks(supabase: SupabaseClient): Promise<Result<ServiceStatus[]>> {
  const [db, auth, storage] = await Promise.all([
    checkDatabaseService(supabase),
    checkAuthService(supabase),
    checkStorageService(supabase),
  ])

  return ok([
    { name: 'Database', ok: db.ok,      detail: db.detail      },
    { name: 'Auth',     ok: auth.ok,    detail: auth.detail    },
    { name: 'Storage',  ok: storage.ok, detail: storage.detail },
    { name: 'Website',  ok: true,       detail: undefined      },
  ])
}
