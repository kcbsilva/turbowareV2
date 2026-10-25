'use client'

import { useEffect } from 'react'

export function turbowareTitle(page: string) {
  const name = page.trim()
  return name ? `Turboware - ${name}` : 'Turboware'
}

export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = title
  }, [title])
}
