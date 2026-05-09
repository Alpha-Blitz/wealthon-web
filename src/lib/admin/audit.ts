import type { SupabaseClient } from '@supabase/supabase-js'
import { MOCK_COMPANY_ID } from '@/config/constants'
import { TABLE } from '@/config/api'
import type { AuditLog } from '@/types/database'
import { ok, err, type Result } from './index'

export async function getAuditLog(
  supabase: SupabaseClient,
  limit = 100
): Promise<Result<AuditLog[]>> {
  const { data, error } = await supabase
    .from(TABLE.AUDIT_LOG)
    .select('*')
    .eq('company_id', MOCK_COMPANY_ID)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) return err(error.message)
  return ok(data as AuditLog[])
}

export async function logAction(
  supabase: SupabaseClient,
  action: string,
  entityType: string,
  entityId: string | null,
  details?: { before?: Record<string, unknown>; after?: Record<string, unknown> }
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from(TABLE.AUDIT_LOG).insert({
    company_id:  MOCK_COMPANY_ID,
    admin_id:    user.id,
    action,
    entity_type: entityType,
    entity_id:   entityId,
    before_data: details?.before ?? null,
    after_data:  details?.after  ?? null,
  })
}
