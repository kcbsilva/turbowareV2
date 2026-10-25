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
import { usePathname } from 'next/navigation'
import {
  CLIENT_LANGS,
  clientHtmlLang,
  parseClientLang,
  translateClient,
  type ClientLang,
  type ClientMsgKey,
} from '@/lib/client-i18n'
import { turbowareTitle, useDocumentTitle } from '@/lib/document-title'
import { cn } from '@/lib/utils'

const STORAGE_KEY = 'turboware-client-lang'

type ClientLangValue = {
  lang: ClientLang
  setLang: (lang: ClientLang) => void
  t: (key: ClientMsgKey, vars?: Record<string, string | number>) => string
}

const ClientLangContext = createContext<ClientLangValue | null>(null)

function titleKey(pathname: string): ClientMsgKey {
  if (pathname.startsWith('/client/login')) return 'login.title'
  if (pathname.startsWith('/client/activate')) return 'nav.activate'
  if (pathname.startsWith('/client/tickets')) return 'nav.tickets'
  if (pathname.startsWith('/client/payment-methods')) return 'nav.billing'
  if (pathname.startsWith('/client/profile')) return 'nav.profile'
  return 'nav.dashboard'
}

function ClientDocumentTitle() {
  const pathname = usePathname()
  const { t } = useClientLang()
  useDocumentTitle(turbowareTitle(t(titleKey(pathname))))
  return null
}

export function ClientLangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<ClientLang>('pt-BR')

  useEffect(() => {
    setLangState(parseClientLang(window.localStorage.getItem(STORAGE_KEY)))
  }, [])

  useEffect(() => {
    document.documentElement.lang = clientHtmlLang(lang)
  }, [lang])

  const setLang = useCallback((next: ClientLang) => {
    setLangState(next)
    window.localStorage.setItem(STORAGE_KEY, next)
  }, [])

  const t = useCallback(
    (key: ClientMsgKey, vars?: Record<string, string | number>) => translateClient(lang, key, vars),
    [lang],
  )

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t])
  return (
    <ClientLangContext.Provider value={value}>
      <ClientDocumentTitle />
      {children}
    </ClientLangContext.Provider>
  )
}

export function useClientLang() {
  const ctx = useContext(ClientLangContext)
  if (!ctx) throw new Error('useClientLang must be used inside ClientLangProvider')
  return ctx
}

export function ClientLangToggle({ className, variant = 'dark' }: { className?: string; variant?: 'dark' | 'light' }) {
  const { lang, setLang, t } = useClientLang()
  return (
    <div
      className={cn(
        'flex overflow-hidden rounded-md border',
        variant === 'dark' ? 'border-white/10' : 'border-border',
        className,
      )}
      role="group"
      aria-label={t('lang.aria')}
    >
      {CLIENT_LANGS.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          onClick={() => setLang(code)}
          className={cn(
            'px-2 py-1 text-[10px] font-bold transition-colors',
            lang === code
              ? variant === 'dark'
                ? 'bg-white text-black'
                : 'bg-foreground text-background'
              : variant === 'dark'
                ? 'text-neutral-500 hover:text-neutral-200'
                : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
