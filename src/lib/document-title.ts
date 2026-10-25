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

/** Language lives in localStorage, so the crawler tag is updated after the switch. */
export function useMetaDescription(description: string) {
  useEffect(() => {
    const text = description.trim()
    if (!text) return

    const apply = () => {
      const tags = [...document.querySelectorAll('meta[name="description"]')]
      const [first, ...rest] = tags
      if (!first) {
        const tag = document.createElement('meta')
        tag.setAttribute('name', 'description')
        tag.setAttribute('content', text)
        document.head.appendChild(tag)
        return
      }
      if (first.getAttribute('content') !== text) first.setAttribute('content', text)
      for (const extra of rest) extra.remove()
    }

    apply()
    const observer = new MutationObserver(apply)
    observer.observe(document.head, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [description])
}
