import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ROUTES } from '@/config/routes'
import { checkIsAdmin } from '@/lib/admin/users'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminTopbar } from '@/components/admin/AdminTopbar'

if (process.env.NODE_ENV === 'production' && process.env.DEV_BYPASS_AUTH === 'true') {
  throw new Error('DEV_BYPASS_AUTH must not be set in production')
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect(ROUTES.LOGIN)

  // checkIsAdmin uses service role — bypasses RLS on admin_roles
  const isAdmin = await checkIsAdmin(session.user.id)

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080808] px-6">
        <div
          className="w-full max-w-[400px] text-center rounded-[8px] p-10"
          style={{ background: '#111111', border: '0.5px solid rgba(245,166,35,0.2)' }}
        >
          <p className="text-[11px] font-sans uppercase tracking-[0.15em] text-gold mb-3">Access Denied</p>
          <h2 className="font-serif text-[24px] text-[#F0EDE6] mb-3">Admin access only.</h2>
          <p className="text-[14px] font-sans font-light text-[#9A9080] mb-6">
            Your account does not have admin permissions.
          </p>
          <a
            href={ROUTES.LOGIN}
            className="text-[13px] font-sans text-gold hover:text-gold-secondary transition-colors"
          >
            ← Sign in with a different account
          </a>
        </div>
      </div>
    )
  }

  const adminName: string =
    (session.user.user_metadata?.full_name as string | undefined)
    ?? session.user.email?.split('@')[0]
    ?? 'Admin'

  return (
    <div className="noise flex h-screen bg-[#080808] overflow-hidden relative">
      <AdminSidebar adminName={adminName} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminTopbar adminName={adminName} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
