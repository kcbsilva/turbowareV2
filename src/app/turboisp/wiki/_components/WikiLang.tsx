'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Lang } from '../_content'
import { LANGS } from '../../site/_components/constants'

const STORAGE_KEY = 'turboisp-wiki-lang'

type WikiLangValue = {
  lang: Lang
  setLang: (lang: Lang) => void
}

const WikiLangContext = createContext<WikiLangValue | null>(null)

export function WikiProviders({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('pt')

  useLayoutEffect(() => {
    const html = document.documentElement
    const hadDark = html.classList.contains('dark')
    html.classList.add('wiki-light')
    html.classList.remove('dark')
    return () => {
      html.classList.remove('wiki-light')
      if (hadDark) html.classList.add('dark')
    }
  }, [])

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    if (saved === 'en' || saved === 'pt' || saved === 'fr') setLangState(saved)
  }, [])

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    window.localStorage.setItem(STORAGE_KEY, next)
  }, [])

  const value = useMemo(() => ({ lang, setLang }), [lang, setLang])

  return <WikiLangContext.Provider value={value}>{children}</WikiLangContext.Provider>
}

export function useWikiLang() {
  const ctx = useContext(WikiLangContext)
  if (!ctx) throw new Error('useWikiLang must be used inside WikiProviders')
  return ctx
}

export { LANGS }
