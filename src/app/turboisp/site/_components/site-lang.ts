'use client'

import { useEffect, useState } from 'react'
import { type Lang } from './constants'

export const SITE_LANG_KEY = 'turboisp-site-lang'

export function isLang(value: string | null | undefined): value is Lang {
  return value === 'en' || value === 'pt' || value === 'fr' || value === 'es'
}

export function useSiteLang() {
  const [lang, setLangState] = useState<Lang>('pt')

  useEffect(() => {
    const saved = window.localStorage.getItem(SITE_LANG_KEY)
    if (isLang(saved)) setLangState(saved)
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang === 'pt' ? 'pt-BR' : lang === 'fr' ? 'fr-CA' : lang === 'es' ? 'es' : 'en'
  }, [lang])

  function setLang(next: Lang) {
    setLangState(next)
    window.localStorage.setItem(SITE_LANG_KEY, next)
  }

  return { lang, setLang }
}
