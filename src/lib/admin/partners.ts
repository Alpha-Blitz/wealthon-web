import type { SupabaseClient } from '@supabase/supabase-js'
import type { Partner } from '@/types/database'
import { MOCK_COMPANY_ID } from '@/config/constants'
import { TABLE } from '@/config/api'
import { ok, err, type Result } from './index'
import { logAction } from './audit'

export async function getAllPartners(supabase: SupabaseClient): Promise<Result<Partner[]>> {
  const { data, error } = await supabase
    .from(TABLE.PARTNERS)
    .select('*')
    .eq('company_id', MOCK_COMPANY_ID)
    .order('created_at', { ascending: false })
  if (error) return err(error.message)
  return ok(data as Partner[])
}

export async function getPartnerById(supabase: SupabaseClient, id: string): Promise<Result<Partner>> {
  const { data, error } = await supabase
    .from(TABLE.PARTNERS)
    .select('*')
    .eq('id', id)
    .eq('company_id', MOCK_COMPANY_ID)
    .single()
  if (error || !data) return err(error?.message ?? 'Not found')
  return ok(data as Partner)
}

export interface PartnerInput {
  full_name:       string
  initials?:       string
  email?:          string
  phone?:          string
  tier:            'L1' | 'L2' | 'L3' | 'L4'
  invested_amount?: number
  entry_date:      string
  status?:         'active' | 'paused' | 'exited'
  notes?:          string
}

export async function createPartner(supabase: SupabaseClient, input: PartnerInput): Promise<Result<Partner>> {
  const initials = input.initials ?? input.full_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const { data, error } = await supabase
    .from(TABLE.PARTNERS)
    .insert({ ...input, initials, company_id: MOCK_COMPANY_ID })
    .select()
    .single()
  if (error || !data) return err(error?.message ?? 'Failed to create')
  await logAction(supabase, 'partner.create', 'partner', data.id, { after: data })
  return ok(data as Partner)
}

export async function updatePartner(
  supabase: SupabaseClient,
  id: string,
  input: Partial<PartnerInput>
): Promise<Result<Partner>> {
  const { data: before } = await supabase.from(TABLE.PARTNERS).select('*').eq('id', id).single()
  const { data, error } = await supabase
    .from(TABLE.PARTNERS)
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('company_id', MOCK_COMPANY_ID)
    .select()
    .single()
  if (error || !data) return err(error?.message ?? 'Failed to update')
  await logAction(supabase, 'partner.update', 'partner', id, { before, after: data })
  return ok(data as Partner)
}

export async function deletePartner(supabase: SupabaseClient, id: string): Promise<Result<void>> {
  const { data: before } = await supabase.from(TABLE.PARTNERS).select('*').eq('id', id).single()
  const { error } = await supabase
    .from(TABLE.PARTNERS)
    .delete()
    .eq('id', id)
    .eq('company_id', MOCK_COMPANY_ID)
  if (error) return err(error.message)
  await logAction(supabase, 'partner.delete', 'partner', id, { before })
  return ok(undefined)
}

export interface PartnerMetrics {
  totalAUM:        number
  activeCount:     number
  quarterlyDistributions: number
  nextPayoutDate:  string
}

export async function getPartnerMetrics(supabase: SupabaseClient): Promise<Result<PartnerMetrics>> {
  const { data: partners, error } = await supabase
    .from(TABLE.PARTNERS)
    .select('invested_amount, status')
    .eq('company_id', MOCK_COMPANY_ID)
  if (error) return err(error.message)

  const totalAUM    = (partners ?? []).reduce((s, p) => s + (p.invested_amount ?? 0), 0)
  const activeCount = (partners ?? []).filter(p => p.status === 'active').length

  const now = new Date()
  const endMonth = [3, 6, 9, 12].find(m => m > now.getMonth() + 1) ?? 3
  const endYear  = endMonth === 3 && now.getMonth() > 8 ? now.getFullYear() + 1 : now.getFullYear()
  const nextPayoutDate = new Date(endYear, endMonth - 1, [3,6,9].includes(endMonth) ? 30 : 31)
    .toISOString().split('T')[0]

  const { data: dist } = await supabase
    .from(TABLE.PNL_REPORTS)
    .select('distribution_amount')
    .eq('company_id', MOCK_COMPANY_ID)
    .eq('year', now.getFullYear())
    .eq('quarter', Math.ceil((now.getMonth() + 1) / 3))
  const quarterlyDistributions = (dist ?? []).reduce((s, r) => s + (r.distribution_amount ?? 0), 0)

  return ok({ totalAUM, activeCount, quarterlyDistributions, nextPayoutDate })
}
