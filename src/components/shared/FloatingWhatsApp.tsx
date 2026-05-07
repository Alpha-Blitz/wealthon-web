'use client'

import { MessageCircle } from 'lucide-react'

const WA_URL =
  'https://wa.me/919035373664?text=Hi%20Wealthon%20Capital%20Ventures%2C%20I%20visited%20wealthonventures.com%20and%20I%27d%20like%20to%20learn%20more%20about%20capital%20partnership%20opportunities.'

export function FloatingWhatsApp() {
  return (
    <a
      href={WA_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gold rounded-full flex items-center justify-center hover:scale-105 transition-transform duration-200"
      style={{ boxShadow: '0 4px 20px rgba(245,166,35,0.4)' }}
    >
      <MessageCircle size={24} className="text-[#080808]" />
    </a>
  )
}
