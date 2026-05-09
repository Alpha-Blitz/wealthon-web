import { createClient } from '@/lib/supabase/server'
import { getAllPartners } from '@/lib/admin/partners'
import { getNotifications } from '@/lib/admin/notifications'
import { CONTENT } from '@/config/content'
import { NotificationsClient } from './NotificationsClient'

export default async function NotificationsPage() {
  const supabase = await createClient()
  const [partnersRes, notifRes] = await Promise.all([
    getAllPartners(supabase),
    getNotifications(supabase, 50),
  ])

  return (
    <div className="p-6 max-w-[1200px]">
      <h1 className="font-serif text-[28px] text-[#F0EDE6] mb-6">{CONTENT.admin.notifications.title}</h1>
      <NotificationsClient
        partners={partnersRes.data ?? []}
        initialSent={notifRes.data ?? []}
      />
    </div>
  )
}
