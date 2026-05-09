import type { SupabaseClient } from '@supabase/supabase-js'
import type { Notification } from '@/types/database'
import { MOCK_COMPANY_ID } from '@/config/constants'
import { TABLE } from '@/config/api'
import { ok, err, type Result } from './index'
import { logAction } from './audit'

export interface NotificationInput {
  partner_id: string | null
  title:      string
  body:       string
  type:       'update' | 'distribution' | 'alert' | 'announcement'
}

export async function getNotifications(
  supabase: SupabaseClient,
  limit = 50
): Promise<Result<Notification[]>> {
  const { data, error } = await supabase
    .from(TABLE.NOTIFICATIONS)
    .select('*')
    .eq('company_id', MOCK_COMPANY_ID)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) return err(error.message)
  return ok(data as Notification[])
}

export async function sendNotification(
  supabase: SupabaseClient,
  input: NotificationInput
): Promise<Result<Notification>> {
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from(TABLE.NOTIFICATIONS)
    .insert({
      company_id: MOCK_COMPANY_ID,
      partner_id: input.partner_id,
      title:      input.title,
      body:       input.body,
      type:       input.type,
      is_sent:    true,
      sent_at:    new Date().toISOString(),
      created_by: user?.id ?? null,
    })
    .select()
    .single()

  if (error || !data) return err(error?.message ?? 'Failed to send notification')

  await logAction(supabase, 'notification.send', 'notification', data.id, {
    after: { type: input.type, partner_id: input.partner_id, title: input.title },
  })

  return ok(data as Notification)
}
