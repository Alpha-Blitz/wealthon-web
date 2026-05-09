import type { SupabaseClient } from '@supabase/supabase-js'
import type { PnLReport } from '@/types/database'
import { MOCK_COMPANY_ID, PARTNER_PROFIT_SHARE } from '@/config/constants'
import { TABLE } from '@/config/api'
import { ok, err, type Result } from './index'
import { logAction } from './audit'

export async function getDistributionRun(
  supabase: SupabaseClient,
  quarter: number,
  year: number
): Promise<Result<PnLReport[]>> {
  const { data, error } = await supabase
    .from(TABLE.PNL_REPORTS)
    .select('*, partners(full_name, initials, tier, invested_amount, status)')
    .eq('company_id', MOCK_COMPANY_ID)
    .eq('quarter', quarter)
    .eq('year', year)
  if (error) return err(error.message)
  return ok(data as unknown as PnLReport[])
}

export async function markPartnerPaid(
  supabase: SupabaseClient,
  reportId: string,
  partnerId: string,
  amount: number
): Promise<Result<void>> {
  const { data: { user } } = await supabase.auth.getUser()

  const { error: txError } = await supabase
    .from(TABLE.TRANSACTIONS)
    .insert({
      company_id: MOCK_COMPANY_ID,
      partner_id: partnerId,
      date:       new Date().toISOString().split('T')[0],
      type:       'distribution',
      amount,
      status:     'completed',
      notes:      'Quarterly distribution',
      created_by: user?.id ?? null,
    })
  if (txError) return err(txError.message)

  const { error: rptError } = await supabase
    .from(TABLE.PNL_REPORTS)
    .update({ distribution_status: 'paid', distribution_amount: amount })
    .eq('id', reportId)
    .eq('company_id', MOCK_COMPANY_ID)
  if (rptError) return err(rptError.message)

  await logAction(supabase, 'distribution.paid', 'pnl_report', reportId, {
    after: { distribution_status: 'paid', distribution_amount: amount },
  })
  return ok(undefined)
}

export async function confirmDistributionRun(
  supabase: SupabaseClient,
  quarter: number,
  year: number
): Promise<Result<void>> {
  await logAction(supabase, 'distribution.run_confirmed', 'distribution_run', null, {
    after: { quarter, year, profit_share: PARTNER_PROFIT_SHARE },
  })
  return ok(undefined)
}
