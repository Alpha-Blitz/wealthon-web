import { createClient } from '@/lib/supabase/server'
import { getAdminUsers } from '@/lib/admin/users'
import { getAllPartners } from '@/lib/admin/partners'
import { CONTENT } from '@/config/content'
import { UsersClient } from './UsersClient'

export default async function UsersPage() {
  const supabase = await createClient()
  const [usersRes, partnersRes] = await Promise.all([
    getAdminUsers(supabase),
    getAllPartners(supabase),
  ])

  return (
    <div className="p-6 max-w-[1200px]">
      <h1 className="font-serif text-[28px] text-[#F0EDE6] mb-6">{CONTENT.admin.users.title}</h1>
      <UsersClient initialUsers={usersRes.data ?? []} partners={partnersRes.data ?? []} />
    </div>
  )
}
