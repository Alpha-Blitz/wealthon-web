import type { SupabaseClient } from '@supabase/supabase-js'
import { MOCK_COMPANY_ID } from '@/config/constants'
import { TABLE } from '@/config/api'
import { ok, err, type Result } from './index'
import { logAction } from './audit'

export interface AdminUser {
  id:           string
  email:        string
  full_name:    string | null
  last_sign_in: string | null
  status:       'active' | 'suspended'
  partner_id:   string | null
  partner_name: string | null
}

export interface AdminMember {
  id:       string
  name:     string
  email:    string
  initials: string
  role:     string
  section:  string
}

type SupabaseAdmin = {
  auth: {
    admin: {
      listUsers: () => Promise<{ data: { users: Array<{ id: string; email?: string; user_metadata?: Record<string, unknown>; last_sign_in_at?: string }> }; error: unknown }>
      createUser: (opts: Record<string, unknown>) => Promise<{ data: { user?: { id: string } }; error?: { message: string } }>
      generateLink: (opts: Record<string, unknown>) => Promise<{ data: { properties?: { action_link?: string } }; error?: { message: string } }>
      updateUserById: (id: string, opts: Record<string, unknown>) => Promise<{ error?: { message: string } }>
      getUserById: (id: string) => Promise<{ data: { user: { email?: string; user_metadata?: Record<string, unknown> } | null }; error?: unknown }>
    }
  }
}

function adminClient(supabase: SupabaseClient): SupabaseAdmin {
  return supabase as unknown as SupabaseAdmin
}

export async function getAdminRole(
  supabase: SupabaseClient,
  userId: string,
): Promise<{ role: string; user_id: string } | null> {
  const { data } = await supabase
    .from(TABLE.ADMIN_ROLES)
    .select('role, user_id')
    .eq('user_id', userId)
    .maybeSingle()
  return data ?? null
}

export async function getAdminUsers(supabase: SupabaseClient): Promise<Result<AdminUser[]>> {
  const { data: partners, error: pErr } = await supabase
    .from(TABLE.PARTNERS)
    .select('id, user_id, full_name')
    .eq('company_id', MOCK_COMPANY_ID)
  if (pErr) return err(pErr.message)

  const partnerMap = new Map((partners ?? []).map(p => [p.user_id, p]))

  const { data: { users }, error } = await adminClient(supabase).auth.admin.listUsers()
  if (error) return err('Requires service role key')

  const result: AdminUser[] = (users ?? []).map(u => {
    const partner = partnerMap.get(u.id)
    return {
      id:           u.id,
      email:        u.email ?? '',
      full_name:    (u.user_metadata?.full_name as string | null) ?? null,
      last_sign_in: u.last_sign_in_at ?? null,
      status:       (u.user_metadata?.suspended as boolean) ? 'suspended' : 'active',
      partner_id:   partner?.id ?? null,
      partner_name: partner?.full_name ?? null,
    }
  })

  return ok(result)
}

export async function getAdminTeam(supabase: SupabaseClient): Promise<Result<AdminMember[]>> {
  const { data: adminRows, error } = await supabase
    .from(TABLE.ADMIN_ROLES)
    .select('id, user_id, role, default_section')
    .eq('company_id', MOCK_COMPANY_ID)
  if (error) return err(error.message)

  const members = await Promise.all(
    (adminRows ?? []).map(async row => {
      const { data: { user } } = await adminClient(supabase).auth.admin.getUserById(row.user_id)
        .catch(() => ({ data: { user: null } }))
      const name = (user?.user_metadata?.full_name as string | null) ?? user?.email?.split('@')[0] ?? 'Admin'
      const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
      return {
        id:       row.user_id,
        name,
        email:    user?.email ?? '',
        initials,
        role:     row.role,
        section:  row.default_section ?? '',
      }
    })
  )

  return ok(members)
}

export async function createPartnerAccount(
  supabase: SupabaseClient,
  email: string,
  partnerId: string | null,
  sendInvite: boolean
): Promise<Result<string>> {
  const tempPassword = Math.random().toString(36).slice(-10) + 'A1!'
  const { data, error } = await adminClient(supabase).auth.admin.createUser({
    email,
    password:      tempPassword,
    email_confirm: sendInvite,
  })
  if (error || !data.user) return err(error?.message ?? 'Failed')

  if (partnerId) {
    await supabase
      .from(TABLE.PARTNERS)
      .update({ user_id: data.user.id })
      .eq('id', partnerId)
      .eq('company_id', MOCK_COMPANY_ID)
  }

  await logAction(supabase, 'user.create', 'user', data.user.id, { after: { email, partnerId } })
  return ok(data.user.id)
}

export async function resetPassword(
  supabase: SupabaseClient,
  email: string
): Promise<Result<string>> {
  const { data, error } = await adminClient(supabase).auth.admin.generateLink({ type: 'recovery', email })
  if (error) return err(error.message)
  await logAction(supabase, 'user.password_reset', 'user', null, { after: { email } })
  return ok(data?.properties?.action_link ?? '')
}

export async function suspendAccount(
  supabase: SupabaseClient,
  userId: string
): Promise<Result<void>> {
  const { error } = await adminClient(supabase).auth.admin.updateUserById(userId, {
    user_metadata: { suspended: true },
  })
  if (error) return err(error.message)
  await logAction(supabase, 'user.suspend', 'user', userId)
  return ok(undefined)
}
