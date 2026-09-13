'use client'

import { useEffect } from 'react'

/** Turboware is dark-only (Vercel-style black). */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.documentElement.classList.add('dark')
    localStorage.setItem('tw-theme', 'dark')
  }, [])

  return <>{children}</>
}
