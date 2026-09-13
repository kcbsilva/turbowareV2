'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAdminLang } from '@/components/admin/AdminLangProvider'
import type { MsgKey } from '@/lib/admin-i18n'

const TABS: { href: string; labelKey: MsgKey }[] = [
  { href: '/admin/settings/team', labelKey: 'nav.team' },
  { href: '/admin/settings/security', labelKey: 'nav.security' },
  { href: '/admin/settings/contracts', labelKey: 'settings.templates' },
]

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { t } = useAdminLang()

  return (
    <div className="flex h-full min-h-0 flex-col">
      <nav
        aria-label={t('nav.settings')}
        className="flex h-10 shrink-0 items-center gap-1 overflow-x-auto border-b border-border px-4"
      >
        {TABS.map((tab) => {
          const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`shrink-0 rounded-md px-2.5 py-1 text-xs font-medium ${
                active
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
              }`}
            >
              {t(tab.labelKey)}
            </Link>
          )
        })}
      </nav>
      <div className="min-h-0 flex-1 overflow-auto">{children}</div>
    </div>
  )
}
