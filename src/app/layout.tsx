import type { Metadata } from 'next'
import { Playfair_Display, Inter, DM_Serif_Display } from 'next/font/google'
import { ScrollAnimationProvider } from '@/components/shared/ScrollAnimationProvider'
import './globals.css'

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  display: 'swap',
})

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  display: 'swap',
})

const dmSerif = DM_Serif_Display({
  variable: '--font-dm-serif',
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Wealthon Capital Ventures | Where capital finds direction.',
  description:
    'A founder-led proprietary trading firm. Profit-sharing structure across Forex, Commodities and Crypto. Capital partnerships by referral and relationship only.',
  keywords:
    'proprietary trading, forex, commodities, crypto, capital partnership, profit sharing, Bangalore',
  metadataBase: new URL('https://www.wealthonventures.com'),
  openGraph: {
    title: 'Wealthon Capital Ventures',
    description: 'Where capital finds direction.',
    url: 'https://www.wealthonventures.com',
    siteName: 'Wealthon Capital Ventures',
    images: [{ url: '/og.png', width: 1200, height: 630 }],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wealthon Capital Ventures',
    description: 'Where capital finds direction.',
    images: ['/og.png'],
  },
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable} ${dmSerif.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        <ScrollAnimationProvider />
        {children}
      </body>
    </html>
  )
}
