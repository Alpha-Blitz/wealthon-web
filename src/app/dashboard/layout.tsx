import Image from 'next/image'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getPartnerByUserId } from '@/lib/db/partners'
import { checkIsAdmin } from '@/lib/admin/users'
import { PartnerProvider } from '@/context/PartnerContext'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { Topbar } from '@/components/dashboard/Topbar'
import { BottomNav } from '@/components/dashboard/BottomNav'
import { CONTENT } from '@/config/content'
import { ROUTES } from '@/config/routes'
import { mockPartner } from '@/lib/mock/data'

if (process.env.NODE_ENV === 'production' && process.env.DEV_BYPASS_AUTH === 'true') {
  throw new Error('DEV_BYPASS_AUTH must not be set in production')
}

async function signOutAction() {
  'use server'
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect(ROUTES.LOGIN)
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const devBypass = process.env.DEV_BYPASS_AUTH === 'true'

  if (devBypass) {
    return (
      <PartnerProvider partner={mockPartner}>
        <div className="flex h-screen bg-[#080808] overflow-hidden">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <Topbar />
            <main className="flex-1 overflow-y-auto pb-[72px] md:pb-0">
              {children}
            </main>
          </div>
          <BottomNav />
        </div>
      </PartnerProvider>
    )
  }

  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) return null // middleware redirects before we get here

  const { data: partner, error } = await getPartnerByUserId(supabase, session.user.id)

  if (error || !partner) {
    // checkIsAdmin uses service role — bypasses RLS on admin_roles
    const isAdmin = await checkIsAdmin(session.user.id)
    if (isAdmin) redirect(ROUTES.ADMIN.ROOT)

    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080808] px-6">
        <div
          className="w-full max-w-[420px] text-center rounded-[8px] p-10"
          style={{ background: '#111111', border: '0.5px solid rgba(245,166,35,0.2)' }}
        >
          <Image src="/navlogo.png" alt="Wealthon" width={140} height={32} className="h-8 w-auto mx-auto mb-6" />
          <h2 className="font-serif text-[24px] text-[#F0EDE6] mb-3">{CONTENT.pending.heading}</h2>
          <p className="text-[14px] font-sans font-light text-[#9E9484] leading-[1.7] mb-8">
            {CONTENT.pending.body}
          </p>
          <form action={signOutAction}>
            <button
              type="submit"
              className="text-[13px] font-sans text-[#9E9484] border border-[rgba(255,255,255,0.1)] rounded-[4px] px-4 py-2 hover:text-[#F0EDE6] transition-colors cursor-pointer bg-transparent"
            >
              {CONTENT.pending.logout}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <PartnerProvider partner={partner}>
      <div className="flex h-screen bg-[#080808] overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-y-auto pb-[72px] md:pb-0">
            {children}
          </main>
        </div>
        <BottomNav />
      </div>
    </PartnerProvider>
  )
}
