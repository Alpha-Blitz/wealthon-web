import { createClient } from '@/lib/supabase/server'
import { getAuditLog } from '@/lib/admin/audit'
import { getAdminTeam } from '@/lib/admin/users'
import { CONTENT } from '@/config/content'
import { TeamClient } from './TeamClient'

const C = CONTENT.admin.team

export default async function TeamPage() {
  const supabase = await createClient()

  const [auditRes, teamRes] = await Promise.all([
    getAuditLog(supabase, 200),
    getAdminTeam(supabase),
  ])

  return (
    <div className="p-6 max-w-[1400px]">
      <h1 className="font-serif text-[28px] text-[#F0EDE6] mb-6">{C.title}</h1>
      <TeamClient admins={teamRes.data ?? []} auditLog={auditRes.data ?? []} />
    </div>
  )
}
