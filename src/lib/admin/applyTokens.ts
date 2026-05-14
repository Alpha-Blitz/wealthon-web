import type { SupabaseClient } from '@supabase/supabase-js'
import { TABLE } from '@/config/api'
import { ok, err, type Result } from './index'
import { logAction } from './audit'

export interface ApplyToken {
  id:                string
  token:             string
  prospect_name:     string | null
  prospect_whatsapp: string | null
  prospect_email:    string | null
  lead_id:           string | null
  created_by:        string | null
  expires_at:        string
  used_at:           string | null
  partner_id:        string | null
  created_at:        string
}

export type TokenLookupResult =
  | { status: 'valid';   token: ApplyToken }
  | { status: 'expired'; token: ApplyToken }
  | { status: 'used';    token: ApplyToken }
  | { status: 'invalid' }

export async function lookupToken(
  supabase: SupabaseClient,
  token: string,
): Promise<TokenLookupResult> {
  const { data } = await supabase
    .from(TABLE.APPLY_TOKENS)
    .select('*')
    .eq('token', token)
    .maybeSingle()
  if (!data) return { status: 'invalid' }
  const t = data as ApplyToken
  if (t.used_at) return { status: 'used', token: t }
  if (new Date(t.expires_at).getTime() < Date.now()) return { status: 'expired', token: t }
  return { status: 'valid', token: t }
}

export interface CreateTokenInput {
  prospectName:     string
  prospectWhatsapp: string
  prospectEmail:    string
  leadId?:          string | null
  expiryDays:       number
}

export async function createApplyToken(
  supabase: SupabaseClient,
  input: CreateTokenInput,
): Promise<Result<ApplyToken>> {
  const { data: { user } } = await supabase.auth.getUser()
  const expiresAt = new Date(Date.now() + input.expiryDays * 24 * 60 * 60 * 1000).toISOString()
  const { data, error } = await supabase
    .from(TABLE.APPLY_TOKENS)
    .insert({
      prospect_name:     input.prospectName,
      prospect_whatsapp: input.prospectWhatsapp,
      prospect_email:    input.prospectEmail,
      lead_id:           input.leadId ?? null,
      created_by:        user?.id ?? null,
      expires_at:        expiresAt,
    })
    .select()
    .single()
  if (error || !data) return err(error?.message ?? 'Failed to create token')
  await logAction(supabase, 'apply_token.create', 'apply_token', data.id, {
    after: { prospectEmail: input.prospectEmail, leadId: input.leadId ?? null, expiresAt },
  })
  return ok(data as ApplyToken)
}

export async function markTokenUsed(
  supabase: SupabaseClient,
  tokenId: string,
  partnerId: string,
): Promise<Result<void>> {
  const { error } = await supabase
    .from(TABLE.APPLY_TOKENS)
    .update({ used_at: new Date().toISOString(), partner_id: partnerId })
    .eq('id', tokenId)
  if (error) return err(error.message)
  await logAction(supabase, 'apply_token.use', 'apply_token', tokenId, {
    after: { partnerId },
  })
  return ok(undefined)
}
