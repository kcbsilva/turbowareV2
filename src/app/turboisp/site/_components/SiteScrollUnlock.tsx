'use client'

import { useEffect } from 'react'

/** Worktop root layout locks body scroll; marketing pages need window scroll for in-view animations. */
export function SiteScrollUnlock() {
  useEffect(() => {
    document.documentElement.classList.add('turboisp-site-root')
    return () => document.documentElement.classList.remove('turboisp-site-root')
  }, [])
  return null
}
