import type { SupabaseClient } from '@supabase/supabase-js'
import type { Security } from '@/types/database'
import { ok, err, type Result } from './index'

export async function getSecurities(
  supabase: SupabaseClient,
  partnerId: string
): Promise<Result<Security[]>> {
  const { data, error } = await supabase
    .from('securities')
    .select('*')
    .eq('partner_id', partnerId)
    .order('created_at', { ascending: false })

  if (error) return err(error.message)
  return ok((data ?? []) as Security[])
}

export async function getDocumentSignedUrl(
  supabase: SupabaseClient,
  partnerId: string,
  type: 'agreement' | 'cheque'
): Promise<Result<string>> {
  const path = `${partnerId}/${type}.pdf`
  const { data, error } = await supabase.storage
    .from('documents')
    .createSignedUrl(path, 3600) // 1-hour expiry

  if (error || !data?.signedUrl) return err(error?.message ?? 'Document not available')
  return ok(data.signedUrl)
}
