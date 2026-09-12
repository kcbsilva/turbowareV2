'use client'

import { useEffect, useState, type ComponentType, type SVGProps } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutGroup, motion } from 'framer-motion'
import {
  Bell,
  ChevronsRight,
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

type IconType = ComponentType<SVGProps<SVGSVGElement>>

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/clients', label: 'Clients', icon: Users, exact: false },
  { href: '/admin/licenses', label: 'Licenses', icon: Key, exact: false },
  { href: '/admin/tickets', label: 'Tickets', icon: Ticket, exact: false },
  { href: '/admin/invoices', label: 'Invoices', icon: Receipt, exact: false },
  { href: '/admin/products', label: 'Products', icon: Package, exact: false },
] as const

const ACCOUNT_NAV = [
  { href: '/admin/team', label: 'Team', icon: UserCog, exact: false },
  { href: '/admin/security', label: 'Security', icon: Shield, exact: true },
] as const

const TITLES: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/clients': 'Clients',
  '/admin/clients/new': 'New Tenant',
  '/admin/licenses': 'Licenses',
  '/admin/licenses/new': 'New License',
  '/admin/tickets': 'Tickets',
  '/admin/invoices': 'Invoices',
  '/admin/team': 'Team',
  '/admin/products': 'Products',
  '/admin/security': 'Security',
}

function pageTitle(pathname: string) {
  if (TITLES[pathname]) return TITLES[pathname]
  if (pathname.startsWith('/admin/licenses/')) return 'License'
  if (pathname.startsWith('/admin/clients/')) return 'Client'
  return 'Admin'
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
  const [open, setOpen] = useState(true)
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

  const title = pageTitle(pathname)
  const initials = (me?.name || me?.email || 'A').charAt(0).toUpperCase()

  return (
    <div className="flex h-[100svh] w-full bg-[#F7F4EE] text-[#1B2430]">
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-[#1B2430]/40 backdrop-blur-[2px] lg:hidden"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <nav
        className={`fixed inset-y-0 left-0 z-40 flex h-full shrink-0 flex-col border-r border-[#E6E0D6] bg-[#FFFDF8]/95 p-2 shadow-[4px_0_24px_rgba(227,155,18,0.06)] backdrop-blur-md transition-all duration-300 ease-in-out lg:static ${
          open ? 'w-64' : 'w-16'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="mb-4 border-b border-[#E6E0D6] pb-4">
          <Link href="/admin" className="flex items-center gap-3 rounded-xl p-2 hover:bg-[#FFF4D6]">
            <span className="relative grid size-10 shrink-0 place-content-center">
              <span className="absolute inset-0 rounded-xl bg-[#E39B12]/20 blur-sm" />
              <Image
                src={turbowareLogo}
                alt=""
                className="relative h-10 w-10 rounded-xl"
                height={40}
                width={40}
              />
            </span>
            {open && (
              <div className="min-w-0">
                <span className="block truncate text-sm font-semibold text-gray-900">Turboware</span>
                <span className="block text-[11px] font-medium uppercase tracking-[0.14em] text-[#8A5A00]">
                  Admin
                </span>
              </div>
            )}
          </Link>
        </div>

        <LayoutGroup>
          <div className="mb-4 min-h-0 flex-1 space-y-1 overflow-y-auto">
            {NAV.map((item) => (
              <NavOption
                key={item.href}
                href={item.href}
                Icon={item.icon}
                title={item.label}
                open={open}
                active={isActive(pathname, item.href, item.exact)}
                notifs={item.href === '/admin/tickets' ? me?.openTickets : undefined}
              />
            ))}

            {open && (
              <div className="border-t border-[#E6E0D6] pt-4">
                <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-400">
                  Account
                </div>
                {ACCOUNT_NAV.map((item) => (
                  <NavOption
                    key={item.href}
                    href={item.href}
                    Icon={item.icon}
                    title={item.label}
                    open={open}
                    active={isActive(pathname, item.href, item.exact)}
                  />
                ))}
              </div>
            )}
            {!open &&
              ACCOUNT_NAV.map((item) => (
                <NavOption
                  key={item.href}
                  href={item.href}
                  Icon={item.icon}
                  title={item.label}
                  open={open}
                  active={isActive(pathname, item.href, item.exact)}
                />
              ))}
          </div>
        </LayoutGroup>

        {open && me && (
          <div className="mb-12 flex items-center gap-3 rounded-xl bg-[#FFF4D6]/80 px-2 py-2">
            <div className="grid size-8 shrink-0 place-content-center rounded-full bg-gradient-to-br from-[#E39B12] to-[#C9840E] text-xs font-bold text-[#1B2430]">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-gray-900">{me.name || 'Admin'}</p>
              <p className="truncate text-[10px] text-gray-500">{me.email || me.role}</p>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="absolute bottom-0 left-0 right-0 hidden border-t border-[#E6E0D6] hover:bg-[#FFF4D6]/80 lg:block"
        >
          <div className="flex items-center p-3">
            <div className="grid size-10 place-content-center">
              <ChevronsRight
                className={`h-4 w-4 text-gray-500 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
              />
            </div>
            {open && <span className="text-sm font-medium text-gray-600">Hide</span>}
          </div>
        </button>
      </nav>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-[#E6E0D6] bg-white/75 px-4 backdrop-blur-md">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              className="rounded-lg p-2 text-gray-600 hover:bg-[#FFF4D6] lg:hidden"
              aria-label="Open navigation"
              onClick={() => setMobileOpen(true)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-900">{title}</p>
              <p className="hidden truncate text-[11px] text-gray-500 sm:block">Turboware Admin</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/tickets"
              className="relative rounded-xl border border-[#E6E0D6] bg-white p-2 text-gray-600 shadow-sm transition hover:text-[#8A5A00]"
              aria-label="Tickets"
            >
              <Bell className="h-5 w-5" />
              {(me?.openTickets ?? 0) > 0 && (
                <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 animate-pulse rounded-full bg-[#E39B12] ring-2 ring-white" />
              )}
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-xl border border-[#E6E0D6] bg-white px-2.5 py-2 text-xs font-medium text-gray-600 shadow-sm hover:bg-[#FFF4D6]"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
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
  open,
  active,
  notifs,
}: {
  Icon: IconType
  title: string
  href: string
  open: boolean
  active: boolean
  notifs?: number
}) {
  return (
    <Link
      href={href}
      title={title}
      className={`relative flex h-11 w-full items-center rounded-xl transition-colors ${
        active ? 'text-[#8A5A00]' : 'text-gray-600 hover:text-gray-900'
      }`}
    >
      {active && (
        <motion.span
          layoutId="admin-nav-pill"
          className="absolute inset-0 rounded-xl bg-[#E39B12]/15 shadow-[inset_3px_0_0_#E39B12]"
          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
        />
      )}
      <div className="relative z-10 grid h-full w-12 place-content-center">
        <Icon className="h-4 w-4" />
      </div>
      {open && <span className="relative z-10 text-sm font-medium">{title}</span>}
      {!!notifs && open && (
        <span className="relative z-10 ml-auto mr-3 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#E39B12] px-1 text-[10px] font-bold text-[#1B2430]">
          {notifs}
        </span>
      )}
    </Link>
  )
}
