'use client'

import { createContext, useContext } from 'react'
import type { Partner } from '@/types/database'

const PartnerContext = createContext<Partner | null>(null)

export function PartnerProvider({ partner, children }: { partner: Partner; children: React.ReactNode }) {
  return <PartnerContext.Provider value={partner}>{children}</PartnerContext.Provider>
}

export function usePartner(): Partner {
  const ctx = useContext(PartnerContext)
  if (!ctx) throw new Error('usePartner must be used inside PartnerProvider')
  return ctx
}
