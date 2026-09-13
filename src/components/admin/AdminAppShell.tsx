'use client'

import { useEffect, useState, type ComponentType, type SVGProps } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Bell,
  Key,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Receipt,
  Shield,
  Ticket,
  UserCog,
  Users,
  X,
} from 'lucide-react'
import turbowareLogo from '@/app/assets/turboware-logo.png'
import { AdminLangToggle, useAdminLang } from '@/components/admin/AdminLangProvider'
import { ThemeToggle, useTheme } from '@/components/ThemeProvider'
import type { MsgKey } from '@/lib/admin-i18n'

type IconType = ComponentType<SVGProps<SVGSVGElement>>

const NAV: { href: string; labelKey: MsgKey; icon: IconType; exact: boolean }[] = [
  { href: '/admin', labelKey: 'nav.home', icon: LayoutDashboard, exact: true },
  { href: '/admin/clients', labelKey: 'nav.clients', icon: Users, exact: false },
  { href: '/admin/licenses', labelKey: 'nav.licenses', icon: Key, exact: false },
  { href: '/admin/tickets', labelKey: 'nav.tickets', icon: Ticket, exact: false },
  { href: '/admin/invoices', labelKey: 'nav.invoices', icon: Receipt, exact: false },
  { href: '/admin/products', labelKey: 'nav.products', icon: Package, exact: false },
]

const ACCOUNT_NAV: { href: string; labelKey: MsgKey; icon: IconType; exact: boolean }[] = [
  { href: '/admin/team', labelKey: 'nav.team', icon: UserCog, exact: false },
  { href: '/admin/security', labelKey: 'nav.security', icon: Shield, exact: true },
]

function pageTitleKey(pathname: string): MsgKey {
  if (pathname === '/admin') return 'title.dashboard'
  if (pathname === '/admin/clients') return 'title.clients'
  if (pathname === '/admin/clients/new') return 'title.clientsNew'
  if (pathname === '/admin/licenses') return 'title.licenses'
  if (pathname === '/admin/licenses/new') return 'licenses.new'
  if (pathname.startsWith('/admin/licenses/')) return 'title.license'
  if (pathname.startsWith('/admin/clients/')) return 'title.client'
  if (pathname === '/admin/tickets') return 'title.tickets'
  if (pathname === '/admin/invoices') return 'title.invoices'
  if (pathname === '/admin/team') return 'title.team'
  if (pathname === '/admin/products') return 'title.products'
  if (pathname === '/admin/security') return 'title.security'
  return 'title.admin'
}

function isActive(pathname: string, href: string, exact: boolean) {
  if (exact) return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}

interface Me {
  name: string | null
  email: string | null
  role: string
  openTickets: number
}

export function AdminAppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { t } = useAdminLang()
  const { theme } = useTheme()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [me, setMe] = useState<Me | null>(null)

  useEffect(() => {
    fetch('/api/admin/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) {
          setMe({
            name: d.name ?? null,
            email: d.email ?? null,
            role: d.role ?? 'admin',
            openTickets: d.openTickets ?? 0,
          })
        }
      })
      .catch(() => undefined)
  }, [pathname])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  const title = t(pageTitleKey(pathname))
  const initials = (me?.name || me?.email || 'A').charAt(0).toUpperCase()

  return (
    <div className="flex h-[100svh] w-full bg-background text-foreground">
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/70 lg:hidden"
          aria-label={t('nav.close')}
          onClick={() => setMobileOpen(false)}
        />
      )}

      <nav
        className={`fixed inset-y-0 left-0 z-40 flex h-full w-16 shrink-0 flex-col border-r border-border bg-background lg:static ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex h-14 shrink-0 items-center justify-center border-b border-border">
          <Link href="/admin" className="grid size-9 place-content-center rounded-md hover:bg-muted" aria-label="Turboware">
            <Image
              src={turbowareLogo}
              alt=""
              className="h-8 w-8 rounded-md"
              height={32}
              width={32}
            />
          </Link>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto py-1">
          {NAV.map((item) => (
            <NavOption
              key={item.href}
              href={item.href}
              Icon={item.icon}
              title={t(item.labelKey)}
              active={isActive(pathname, item.href, item.exact)}
              notifs={item.href === '/admin/tickets' ? me?.openTickets : undefined}
            />
          ))}
          <div className="mx-3 my-1 h-px bg-border" />
          {ACCOUNT_NAV.map((item) => (
            <NavOption
              key={item.href}
              href={item.href}
              Icon={item.icon}
              title={t(item.labelKey)}
              active={isActive(pathname, item.href, item.exact)}
            />
          ))}
        </div>

        {me && (
          <div className="flex h-14 shrink-0 items-center justify-center border-t border-border" title={me.name || me.email || 'Admin'}>
            <div className="grid size-8 place-content-center rounded-full bg-muted text-xs font-bold text-foreground">
              {initials}
            </div>
          </div>
        )}
      </nav>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border bg-background px-4">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              className="rounded-md p-2 text-muted-foreground hover:bg-muted lg:hidden"
              aria-label={t('nav.open')}
              onClick={() => setMobileOpen(true)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{title}</p>
              <p className="hidden truncate text-[11px] text-muted-foreground sm:block">Turboware</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <AdminLangToggle />
            <ThemeToggle label={t(theme === 'dark' ? 'theme.toLight' : 'theme.toDark')} />
            <Link
              href="/admin/tickets"
              className="relative rounded-md border border-border bg-card p-2 text-muted-foreground transition hover:text-foreground"
              aria-label={t('nav.tickets')}
            >
              <Bell className="h-5 w-5" />
              {(me?.openTickets ?? 0) > 0 && (
                <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 animate-pulse rounded-full bg-foreground ring-2 ring-background" />
              )}
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-2 text-xs font-medium text-muted-foreground hover:bg-muted"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">{t('nav.signOut')}</span>
            </button>
          </div>
        </header>
        <div className="min-h-0 flex-1 overflow-auto">{children}</div>
      </div>
    </div>
  )
}

function NavOption({
  Icon,
  title,
  href,
  active,
  notifs,
}: {
  Icon: IconType
  title: string
  href: string
  active: boolean
  notifs?: number
}) {
  return (
    <Link
      href={href}
      title={title}
      className={`relative flex flex-col items-center justify-center gap-1 px-1 py-2.5 ${
        active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted/70'
      }`}
    >
      {active && <span className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-foreground" />}
      <span className="relative">
        <Icon className="h-4 w-4" />
        {!!notifs && (
          <span className="absolute -right-2 -top-1.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-foreground px-0.5 text-[8px] font-bold text-background">
            {notifs}
          </span>
        )}
      </span>
      <span className="max-w-full truncate text-[10px] font-medium leading-none">{title}</span>
    </Link>
  )
}
