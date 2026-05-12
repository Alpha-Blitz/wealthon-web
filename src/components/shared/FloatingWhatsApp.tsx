'use client'

import Image from 'next/image'
import { trackEvent, currentPagePath } from '@/lib/analytics'
import { ANALYTICS_EVENTS } from '@/config/constants'

const WA_URL =
  'https://wa.me/919035373664?text=Hi%20Wealthon%20Capital%20Ventures%2C%20I%20visited%20wealthonventures.com%20and%20I%27d%20like%20to%20learn%20more%20about%20capital%20partnership%20opportunities.'

export function FloatingWhatsApp() {
  const handleClick = () => {
    trackEvent(ANALYTICS_EVENTS.WHATSAPP_CLICK, currentPagePath())
  }

  return (
    <a
      href={WA_URL}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-50 group"
    >
      {/* Pulse ring */}
      <span
        className="absolute inset-0 rounded-full animate-ping opacity-20"
        style={{ background: '#F5A623' }}
      />

      {/* Bubble */}
      <span
        className="relative flex w-14 h-14 items-center justify-center rounded-full transition-transform duration-200 group-hover:scale-110"
        style={{
          background: 'linear-gradient(135deg, #F5A623 0%, #E8941A 100%)',
          boxShadow: '0 4px 24px rgba(245,166,35,0.45), 0 1px 4px rgba(0,0,0,0.3)',
        }}
      >
        <Image
          src="/whatsapp.png"
          alt="WhatsApp"
          width={30}
          height={30}
          className="w-7 h-7 object-contain"
        />
      </span>
    </a>
  )
}
