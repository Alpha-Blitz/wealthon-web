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

/**
 * Enriched lead view used by the pipeline kanban. Joins apply_tokens so we
 * can split the DB-level 'proposal' stage into agreement_signed (no token)
 * vs. application_submitted (token used → pending partner).
 */
export interface EnrichedLead extends Lead {
  uiStage:           'new' | 'contacted' | 'terms_discussed' | 'agreement_signed' | 'application_submitted' | 'active_partner'
  tokenId:           string | null
  tokenUrl:          string | null
  tokenUsedAt:       string | null
  pendingPartnerId:  string | null
  intendedCapital:   number | null
  monthlyPayout:     number | null
}

interface TokenJoin {
  id:         string
  token:      string
  lead_id:    string | null
  used_at:    string | null
  partner_id: string | null
  expires_at: string
  created_at: string
}

interface PartnerJoin {
  id:               string
  invested_amount:  number | null
  profit_share_ratio: number | null
}

interface PendingTxJoin {
  partner_id: string
  amount:     number
}

export async function getEnrichedLeads(
  supabase: SupabaseClient,
  baseUrl: string,
  defaultMonthlyRate: number,
): Promise<Result<EnrichedLead[]>> {
  const [{ data: leads, error: lerr }, { data: tokens }, { data: pendingTx }] = await Promise.all([
    supabase.from(TABLE.LEADS)
      .select('*')
      .eq('company_id', MOCK_COMPANY_ID)
      .order('created_at', { ascending: false }),
    supabase.from(TABLE.APPLY_TOKENS)
      .select('id,token,lead_id,used_at,partner_id,expires_at,created_at')
      .order('created_at', { ascending: false }),
    supabase.from(TABLE.TRANSACTIONS)
      .select('partner_id,amount')
      .eq('company_id', MOCK_COMPANY_ID)
      .eq('type', 'capital_in')
      .eq('status', 'pending'),
  ])
  if (lerr) return err(lerr.message)

  // Look up partners referenced by tokens (for profit_share_ratio + invested_amount)
  const tokenList = (tokens ?? []) as TokenJoin[]
  const partnerIds = Array.from(new Set(tokenList.map(t => t.partner_id).filter((x): x is string => !!x)))
  let partnersById: Record<string, PartnerJoin> = {}
  if (partnerIds.length > 0) {
    const { data: ptr } = await supabase
      .from(TABLE.PARTNERS)
      .select('id,invested_amount,profit_share_ratio')
      .in('id', partnerIds)
    for (const p of (ptr ?? []) as PartnerJoin[]) partnersById[p.id] = p
  }

  const pendingTxByPartner: Record<string, number> = {}
  for (const t of (pendingTx ?? []) as PendingTxJoin[]) {
    pendingTxByPartner[t.partner_id] = (pendingTxByPartner[t.partner_id] ?? 0) + t.amount
  }

  // Newest-token-per-lead (since the query is ordered desc)
  const tokenByLeadId = new Map<string, TokenJoin>()
  for (const t of tokenList) {
    if (t.lead_id && !tokenByLeadId.has(t.lead_id)) tokenByLeadId.set(t.lead_id, t)
  }

  const enriched: EnrichedLead[] = ((leads ?? []) as Lead[]).map(lead => {
    const tk = tokenByLeadId.get(lead.id) ?? null
    const partner = tk?.partner_id ? partnersById[tk.partner_id] : null
    const intendedCapital = partner?.invested_amount && partner.invested_amount > 0
      ? partner.invested_amount
      : tk?.partner_id ? pendingTxByPartner[tk.partner_id] ?? null : null
    const profitShare = partner?.profit_share_ratio ?? 75
    const monthlyPayout = intendedCapital
      ? Math.round(intendedCapital * defaultMonthlyRate * (profitShare / 100))
      : null

    let uiStage: EnrichedLead['uiStage']
    switch (lead.stage) {
      case 'new':       uiStage = 'new';             break
      case 'contacted': uiStage = 'contacted';       break
      case 'qualified': uiStage = 'terms_discussed'; break
      case 'proposal':  uiStage = tk ? 'application_submitted' : 'agreement_signed'; break
      case 'converted': uiStage = 'active_partner';  break
      default:          uiStage = 'new'
    }

    return {
      ...lead,
      uiStage,
      tokenId:    tk?.id    ?? null,
      tokenUrl:   tk ? `${baseUrl}/apply/${tk.token}` : null,
      tokenUsedAt:tk?.used_at ?? null,
      pendingPartnerId: tk?.partner_id ?? null,
      intendedCapital,
      monthlyPayout,
    }
  })
  partnersById = partnersById // pin
  return ok(enriched)
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
