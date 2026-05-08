'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export function ScrollAnimationProvider() {
  const pathname = usePathname()

  useEffect(() => {
    let observer: IntersectionObserver | null = null

    // Small delay lets Next.js finish painting new DOM nodes after navigation
    const timer = setTimeout(() => {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const delay = parseInt(
                (entry.target as HTMLElement).dataset.delay ?? '0',
                10
              )
              setTimeout(() => entry.target.classList.add('visible'), delay)
            }
          })
        },
        { threshold: 0.12 }
      )
      document.querySelectorAll('.fade-up').forEach((el) => observer!.observe(el))
    }, 60)

    return () => {
      clearTimeout(timer)
      observer?.disconnect()
    }
  }, [pathname])

  return null
}
