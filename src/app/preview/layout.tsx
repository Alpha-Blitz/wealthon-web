import { PartnerProvider } from '@/context/PartnerContext'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { Topbar } from '@/components/dashboard/Topbar'
import { BottomNav } from '@/components/dashboard/BottomNav'
import { mockPartner } from '@/lib/mock/data'

export default function PreviewLayout({ children }: { children: React.ReactNode }) {
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
