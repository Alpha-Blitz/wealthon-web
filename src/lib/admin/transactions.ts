import type { SupabaseClient } from '@supabase/supabase-js'
import type { Transaction } from '@/types/database'
import { MOCK_COMPANY_ID } from '@/config/constants'
import { TABLE } from '@/config/api'
import { ok, err, type Result } from './index'
import { logAction } from './audit'

export async function getTransactions(
  supabase: SupabaseClient,
  partnerId: string,
  limit = 50
): Promise<Result<Transaction[]>> {
  const { data, error } = await supabase
    .from(TABLE.TRANSACTIONS)
    .select('*')
    .eq('partner_id', partnerId)
    .eq('company_id', MOCK_COMPANY_ID)
    .order('date', { ascending: false })
    .limit(limit)
  if (error) return err(error.message)
  return ok(data as Transaction[])
}

export interface TransactionInput {
  partner_id: string
  date:       string
  type:       Transaction['type']
  amount:     number
  status:     Transaction['status']
  notes?:     string
}

export async function addTransaction(
  supabase: SupabaseClient,
  input: TransactionInput
): Promise<Result<Transaction>> {
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from(TABLE.TRANSACTIONS)
    .insert({ ...input, company_id: MOCK_COMPANY_ID, created_by: user?.id ?? null })
    .select()
    .single()
  if (error || !data) return err(error?.message ?? 'Failed')
  await logAction(supabase, 'transaction.create', 'transaction', data.id, { after: data })
  return ok(data as Transaction)
}

export async function updateTransaction(
  supabase: SupabaseClient,
  id: string,
  input: Partial<TransactionInput>
): Promise<Result<Transaction>> {
  const { data: before } = await supabase.from(TABLE.TRANSACTIONS).select('*').eq('id', id).single()
  const { data, error } = await supabase
    .from(TABLE.TRANSACTIONS)
    .update(input)
    .eq('id', id)
    .eq('company_id', MOCK_COMPANY_ID)
    .select()
    .single()
  if (error || !data) return err(error?.message ?? 'Failed')
  await logAction(supabase, 'transaction.update', 'transaction', id, { before, after: data })
  return ok(data as Transaction)
}

export async function deleteTransaction(supabase: SupabaseClient, id: string): Promise<Result<void>> {
  const { data: before } = await supabase.from(TABLE.TRANSACTIONS).select('*').eq('id', id).single()
  const { error } = await supabase
    .from(TABLE.TRANSACTIONS)
    .delete()
    .eq('id', id)
    .eq('company_id', MOCK_COMPANY_ID)
  if (error) return err(error.message)
  await logAction(supabase, 'transaction.delete', 'transaction', id, { before })
  return ok(undefined)
}
