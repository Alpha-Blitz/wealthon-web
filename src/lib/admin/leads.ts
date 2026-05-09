import type { SupabaseClient } from '@supabase/supabase-js'
import type { Lead } from '@/types/database'
import { MOCK_COMPANY_ID } from '@/config/constants'
import { TABLE } from '@/config/api'
import { ok, err, type Result } from './index'
import { logAction } from './audit'

export async function getLeads(supabase: SupabaseClient): Promise<Result<Lead[]>> {
  const { data, error } = await supabase
    .from(TABLE.LEADS)
    .select('*')
    .eq('company_id', MOCK_COMPANY_ID)
    .order('created_at', { ascending: false })
  if (error) return err(error.message)
  return ok(data as Lead[])
}

export interface LeadInput {
  name:       string
  email?:     string
  phone?:     string
  source?:    Lead['source']
  stage?:     Lead['stage']
  notes?:     string
  referred_by?: string | null
}

export async function addLead(supabase: SupabaseClient, input: LeadInput): Promise<Result<Lead>> {
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from(TABLE.LEADS)
    .insert({ ...input, company_id: MOCK_COMPANY_ID, assigned_to: user?.id ?? null })
    .select()
    .single()
  if (error || !data) return err(error?.message ?? 'Failed')
  await logAction(supabase, 'lead.create', 'lead', data.id, { after: data })
  return ok(data as Lead)
}

export async function updateLead(
  supabase: SupabaseClient,
  id: string,
  input: Partial<LeadInput>
): Promise<Result<Lead>> {
  const { data: before } = await supabase.from(TABLE.LEADS).select('*').eq('id', id).single()
  const { data, error } = await supabase
    .from(TABLE.LEADS)
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('company_id', MOCK_COMPANY_ID)
    .select()
    .single()
  if (error || !data) return err(error?.message ?? 'Failed')
  await logAction(supabase, 'lead.update', 'lead', id, { before, after: data })
  return ok(data as Lead)
}

export async function updateLeadStage(
  supabase: SupabaseClient,
  id: string,
  stage: Lead['stage']
): Promise<Result<Lead>> {
  return updateLead(supabase, id, { stage })
}

export async function deleteLead(supabase: SupabaseClient, id: string): Promise<Result<void>> {
  const { data: before } = await supabase.from(TABLE.LEADS).select('*').eq('id', id).single()
  const { error } = await supabase
    .from(TABLE.LEADS)
    .delete()
    .eq('id', id)
    .eq('company_id', MOCK_COMPANY_ID)
  if (error) return err(error.message)
  await logAction(supabase, 'lead.delete', 'lead', id, { before })
  return ok(undefined)
}
