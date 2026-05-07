'use client'

const WA_URL =
  'https://wa.me/919035373664?text=Hi%20Wealthon%20Capital%20Ventures%2C%20I%20visited%20wealthonventures.com%20and%20I%27d%20like%20to%20learn%20more%20about%20capital%20partnership%20opportunities.'

export function FloatingWhatsApp() {
  return (
    <a
      href={WA_URL}
      target="_blank"
      rel="noopener noreferrer"
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
        {/* WhatsApp phone SVG */}
        <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M16 5.5C10.2 5.5 5.5 10.2 5.5 16c0 2.1.58 4.06 1.6 5.73l.23.37-1.02 3.74 3.84-.99.36.21A10.43 10.43 0 0 0 16 26.5c5.8 0 10.5-4.7 10.5-10.5S21.8 5.5 16 5.5Zm-4.15 6.3c.2 0 .41.01.58.02.2.01.43.04.63.5.25.56.78 1.92.85 2.06.07.14.12.3.02.48-.1.18-.14.3-.28.46-.14.16-.3.35-.42.47-.14.13-.29.28-.12.55.17.27.73 1.2 1.57 1.95 1.08.96 1.99 1.26 2.27 1.4.28.13.44.11.6-.07.17-.18.7-.81.88-1.09.18-.27.37-.23.62-.14.25.09 1.6.75 1.87.89.27.14.45.2.52.32.06.11.06.66-.15 1.29-.22.64-1.26 1.22-1.73 1.27-.44.05-.85.07-2.77-.58-2.33-.8-3.8-3.15-3.92-3.3-.12-.14-.97-1.3-.97-2.47 0-1.18.62-1.75.84-1.99.22-.24.47-.3.63-.3Z"
            fill="#080808"
          />
        </svg>
      </span>
    </a>
  )
}
