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
  ADMIN_LANGS,
  parseAdminLang,
  translate,
  type AdminLang,
  type MsgKey,
} from '@/lib/admin-i18n'
import { turbowareTitle, useDocumentTitle } from '@/lib/document-title'
import { cn } from '@/lib/utils'

const STORAGE_KEY = 'turboware-admin-lang'

type AdminLangValue = {
  lang: AdminLang
  setLang: (lang: AdminLang) => void
  t: (key: MsgKey, vars?: Record<string, string | number>) => string
}

const AdminLangContext = createContext<AdminLangValue | null>(null)

function adminTitleKey(pathname: string): MsgKey {
  if (pathname.startsWith('/admin/login')) return 'login.submit'
  if (pathname.startsWith('/admin/reset-password')) return 'login.resetTitle'
  if (pathname.startsWith('/admin/clients/new')) return 'title.clientsNew'
  if (/^\/admin\/clients\/[^/]+/.test(pathname)) return 'title.client'
  if (pathname.startsWith('/admin/clients')) return 'title.clients'
  if (pathname.startsWith('/admin/licenses/new')) return 'licenses.new'
  if (/^\/admin\/licenses\/[^/]+/.test(pathname)) return 'title.license'
  if (pathname.startsWith('/admin/licenses')) return 'title.licenses'
  if (pathname.startsWith('/admin/tickets')) return 'title.tickets'
  if (pathname.startsWith('/admin/invoices')) return 'title.invoices'
  if (pathname.startsWith('/admin/products')) return 'title.products'
  if (pathname.startsWith('/admin/team') || pathname.startsWith('/admin/settings/team')) return 'title.team'
  if (pathname.startsWith('/admin/security') || pathname.startsWith('/admin/settings/security')) return 'title.security'
  if (pathname.startsWith('/admin/settings')) return 'title.settings'
  if (pathname === '/admin') return 'title.dashboard'
  return 'title.admin'
}

function AdminDocumentTitle() {
  const pathname = usePathname()
  const { t } = useAdminLang()
  useDocumentTitle(turbowareTitle(t(adminTitleKey(pathname))))
  return null
}

export function AdminLangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<AdminLang>('pt-BR')

  useEffect(() => {
    setLangState(parseAdminLang(window.localStorage.getItem(STORAGE_KEY)))
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang === 'pt-BR' ? 'pt-BR' : lang === 'fr' ? 'fr-CA' : lang === 'es' ? 'es' : 'en'
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
  return (
    <AdminLangContext.Provider value={value}>
      <AdminDocumentTitle />
      {children}
    </AdminLangContext.Provider>
  )
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
