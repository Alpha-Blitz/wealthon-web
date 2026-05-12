import { Navbar } from '@/components/marketing/Navbar'
import { HeroSection } from '@/components/marketing/HeroSection'
import { WhatWeDo } from '@/components/marketing/WhatWeDo'
import { HowItWorks } from '@/components/marketing/HowItWorks'
import { TrustSignals } from '@/components/marketing/TrustSignals'
import { TheEdge } from '@/components/marketing/TheEdge'
import { Calculator } from '@/components/marketing/Calculator'
import { WhoWeWorkWith } from '@/components/marketing/WhoWeWorkWith'
import { Leadership } from '@/components/marketing/Leadership'
import { ContactForm } from '@/components/marketing/ContactForm'
import { Footer } from '@/components/marketing/Footer'
import { FloatingWhatsApp } from '@/components/shared/FloatingWhatsApp'
import { PageTracker } from '@/components/shared/PageTracker'

export default function Home() {
  return (
    <>
      <PageTracker page="home" />
      <Navbar />
      <main>
        <HeroSection />
        <WhatWeDo />
        <HowItWorks />
        <TrustSignals />
        <TheEdge />
        <Calculator />
        <WhoWeWorkWith />
        <Leadership />
        <ContactForm />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </>
  )
}
