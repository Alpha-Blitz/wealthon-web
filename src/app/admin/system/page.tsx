import { CONTENT } from '@/config/content'
import { SystemClient } from './SystemClient'

export default function SystemPage() {
  return (
    <div className="p-6 max-w-[1000px]">
      <h1 className="font-serif text-[28px] text-[#F0EDE6] mb-6">{CONTENT.admin.system.title}</h1>
      <SystemClient />
    </div>
  )
}
