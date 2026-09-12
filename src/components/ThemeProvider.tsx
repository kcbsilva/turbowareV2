'use client'

import { useEffect } from 'react'

/** Turboware is light-only. Strip leftover dark class / saved preference. */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.documentElement.classList.remove('dark')
    localStorage.removeItem('tw-theme')
  }, [])

  return <>{children}</>
}
