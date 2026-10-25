'use client'

import { useRouter, usePathname } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { LayoutDashboard, User, Ticket, CreditCard, LogOut, Zap } from 'lucide-react'
import turbowareLogo from '@/app/assets/turboware-logo.png'
import { ClientLangToggle, useClientLang } from '@/components/client/ClientLangProvider'
import type { ClientMsgKey } from '@/lib/client-i18n'

const NAV: { href: string; key: ClientMsgKey; icon: typeof LayoutDashboard }[] = [
  { href: '/client/dashboard', key: 'nav.dashboard', icon: LayoutDashboard },
  { href: '/client/activate', key: 'nav.activate', icon: Zap },
  { href: '/client/tickets', key: 'nav.tickets', icon: Ticket },
  { href: '/client/payment-methods', key: 'nav.billing', icon: CreditCard },
  { href: '/client/profile', key: 'nav.profile', icon: User },
]

export default function ClientHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const { t } = useClientLang()

  async function logout() {
    await fetch('/api/client/auth/logout', { method: 'POST' })
    router.push('/client/login')
  }

  return (
    <header className="relative z-10 border-b border-white/10 bg-black/90 backdrop-blur-xl">
      <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
        <Link href="/client/dashboard" className="flex items-center gap-2 shrink-0">
          <Image src={turbowareLogo} alt="Turboware" className="h-7 w-7" height={28} width={28} />
          <span className="text-sm font-bold tracking-tight text-white hidden sm:block">Turboware</span>
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded border border-white/15 bg-white/5 text-neutral-300 hidden sm:inline">
            {t('nav.portal')}
          </span>
        </Link>

        <nav className="flex items-center gap-0.5 overflow-x-auto flex-1 justify-center" aria-label={t('nav.aria')}>
          {NAV.map(({ href, key, icon: Icon }) => {
            const label = t(key)
            const active = pathname === href || (href !== '/client/dashboard' && pathname.startsWith(href))
            const base = 'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition whitespace-nowrap'
            const style = active
              ? 'text-white bg-white/10'
              : 'text-white/50 hover:text-white/80 hover:bg-white/5'
            return (
              <Link key={href} href={href} className={`${base} ${style}`} aria-label={label}>
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          <ClientLangToggle />
          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/80 transition p-1.5 rounded-md hover:bg-white/5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('nav.signOut')}</span>
          </button>
        </div>
      </div>
    </header>
  )
}
