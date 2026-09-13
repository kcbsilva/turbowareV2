'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  ADMIN_LANGS,
  parseAdminLang,
  translate,
  type AdminLang,
  type MsgKey,
} from '@/lib/admin-i18n'
import { cn } from '@/lib/utils'

const STORAGE_KEY = 'turboware-admin-lang'

type AdminLangValue = {
  lang: AdminLang
  setLang: (lang: AdminLang) => void
  t: (key: MsgKey, vars?: Record<string, string | number>) => string
}

const AdminLangContext = createContext<AdminLangValue | null>(null)

export function AdminLangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<AdminLang>('pt-BR')

  useEffect(() => {
    setLangState(parseAdminLang(window.localStorage.getItem(STORAGE_KEY)))
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang === 'pt-BR' ? 'pt-BR' : 'en'
  }, [lang])

  const setLang = useCallback((next: AdminLang) => {
    setLangState(next)
    window.localStorage.setItem(STORAGE_KEY, next)
  }, [])

  const t = useCallback(
    (key: MsgKey, vars?: Record<string, string | number>) => translate(lang, key, vars),
    [lang],
  )

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t])
  return <AdminLangContext.Provider value={value}>{children}</AdminLangContext.Provider>
}

export function useAdminLang() {
  const ctx = useContext(AdminLangContext)
  if (!ctx) throw new Error('useAdminLang must be used inside AdminLangProvider')
  return ctx
}

export function AdminLangToggle({ className }: { className?: string }) {
  const { lang, setLang, t } = useAdminLang()
  return (
    <div
      className={cn('flex overflow-hidden rounded-md border border-border', className)}
      role="group"
      aria-label={t('lang.aria')}
    >
      {ADMIN_LANGS.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          onClick={() => setLang(code)}
          className={cn(
            'px-2 py-1 text-[10px] font-bold transition-colors',
            lang === code
              ? 'bg-foreground text-background'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
