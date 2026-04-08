'use client'

import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, User, Ticket, CreditCard, LogOut, Sun, Moon, Zap } from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/client/dashboard',       label: 'Dashboard',   icon: LayoutDashboard },
  { href: '/client/activate',        label: 'Activation',  icon: Zap            },
  { href: '/client/tickets',         label: 'Tickets',     icon: Ticket         },
  { href: '/client/payment-methods', label: 'Billing',     icon: CreditCard     },
  { href: '/client/profile',         label: 'Profile',     icon: User           },
]

export default function ClientHeader() {
  const router   = useRouter()
  const pathname = usePathname()
  const { theme, toggle } = useTheme()

  async function logout() {
    await fetch('/api/client/auth/logout', { method: 'POST' })
    router.push('/client/login')
  }

  return (
    <header className="relative z-10 border-b border-white/5 bg-[rgba(5,12,28,0.92)] backdrop-blur-xl">
      <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/client/dashboard" className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#fca311' }}>
            <span className="text-[13px] font-black" style={{ color: '#081124' }}>T</span>
          </div>
          <span className="text-sm font-bold tracking-tight text-white hidden sm:block">Turboware</span>
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded border hidden sm:inline"
            style={{ color: '#fca311', borderColor: 'rgba(252,163,17,0.3)', backgroundColor: 'rgba(252,163,17,0.08)' }}>
            Portal
          </span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-0.5 overflow-x-auto flex-1 justify-center">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/client/dashboard' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition whitespace-nowrap',
                  active
                    ? 'text-[#fca311] bg-[rgba(252,163,17,0.12)]'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={toggle}
            className="p-1.5 rounded-md text-white/40 hover:text-white/80 hover:bg-white/5 transition"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/80 transition p-1.5 rounded-md hover:bg-white/5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>
    </header>
  )
}
