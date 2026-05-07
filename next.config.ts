import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.wealthonventures.com',
      },
    ],
  },
}

export default nextConfig
