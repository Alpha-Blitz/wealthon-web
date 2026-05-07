'use client'

import { useEffect } from 'react'

export function ScrollAnimationProvider() {
  useEffect(() => {
    const observer = new IntersectionObserver(
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

    document.querySelectorAll('.fade-up').forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return null
}
