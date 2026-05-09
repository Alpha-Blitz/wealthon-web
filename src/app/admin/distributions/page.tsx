import { CONTENT } from '@/config/content'
import { DistributionsClient } from './DistributionsClient'

const C = CONTENT.admin.distributions

export default function DistributionsPage() {
  return (
    <div className="p-6 max-w-[1200px]">
      <h1 className="font-serif text-[28px] text-[#F0EDE6] mb-6">{C.title}</h1>
      <DistributionsClient />
    </div>
  )
}
