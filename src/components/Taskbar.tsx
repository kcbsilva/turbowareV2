'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  Key,
  LayoutDashboard,
  LogOut,
  ChevronUp,
  Users,
  Sun,
  Moon,
  Package,
} from 'lucide-react'
import { useTheme } from './ThemeProvider'

const menuItems = [
  { href: '/admin',          label: 'Dashboard', icon: <LayoutDashboard className="w-3.5 h-3.5" />, exact: true },
  { href: '/admin/clients',  label: 'Clients',   icon: <Users className="w-3.5 h-3.5" />,           exact: false },
  { href: '/admin/products', label: 'Products',  icon: <Package className="w-3.5 h-3.5" />,         exact: false },
]

interface Props {
  windowTitle: string
  minimized: boolean
  onToggleMinimize: () => void
}

export function Taskbar({ windowTitle, minimized, onToggleMinimize }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const { theme, toggle: toggleTheme } = useTheme()
  const [startOpen, setStartOpen] = useState(false)
  const [time, setTime] = useState('')
  const [date, setDate] = useState('')
  const [mounted, setMounted] = useState(false)
  const startRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
    const tick = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }))
      setDate(now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (!startOpen) return
    const handler = (e: MouseEvent) => {
      if (startRef.current && !startRef.current.contains(e.target as Node)) {
        setStartOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [startOpen])

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  function navigate(href: string) {
    setStartOpen(false)
    router.push(href)
  }

  function isActive(href: string, exact: boolean) {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  if (!mounted) return null

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[300000] h-12 flex items-center justify-between px-3 overflow-visible"
      style={{
        backgroundColor: theme === 'dark' ? 'rgba(5,12,28,0.92)' : 'rgba(14,32,72,0.88)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 -8px 24px rgba(4,12,32,0.45)',
      }}
    >
      {/* Start Menu Panel */}
      {startOpen && (
        <div
          ref={startRef}
          className="fixed bottom-12 left-0 w-72 rounded-tr-2xl shadow-2xl z-[300001]"
          style={{
            backgroundColor: 'hsl(var(--card) / 0.97)',
            backdropFilter: 'blur(20px)',
            border: '1px solid hsl(var(--border) / 0.5)',
            borderBottom: 'none',
            animation: 'slideUpMenu 0.18s ease-out',
          }}
        >
          {/* Header */}
          <div className="py-2.5 flex items-center justify-center border-b border-border/40 bg-black/5 dark:bg-white/5">
            <span className="text-[9px] font-bold uppercase tracking-[0.5em] text-muted-foreground/50 select-none ml-[0.5em]">
              TurboMenu
            </span>
          </div>

          <nav className="flex flex-col p-2">
            <div className="space-y-0.5">
              {menuItems.map((item) => {
                const active = isActive(item.href, item.exact)
                return (
                  <button
                    key={item.href}
                    onClick={() => navigate(item.href)}
                    className="flex items-center gap-2.5 w-full text-left px-3 py-1.5 rounded-md transition-colors text-foreground"
                    style={{ backgroundColor: active ? 'hsl(var(--accent) / 0.12)' : undefined }}
                    onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = 'hsl(var(--accent) / 0.08)' }}
                    onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = '' }}
                  >
                    <span className="text-muted-foreground">{item.icon}</span>
                    <span className="text-xs font-medium">{item.label}</span>
                  </button>
                )
              })}
            </div>

            <div className="my-1 border-t border-border/40" />

            {/* Theme toggle row */}
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2.5 w-full text-left px-3 py-1.5 rounded-md transition-colors text-foreground"
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'hsl(var(--accent) / 0.08)' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '' }}
            >
              {theme === 'dark'
                ? <Sun className="w-3.5 h-3.5 text-muted-foreground" />
                : <Moon className="w-3.5 h-3.5 text-muted-foreground" />}
              <span className="text-xs font-medium">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2.5 w-full text-left px-3 py-1.5 rounded-md transition-colors text-foreground"
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'hsl(var(--destructive) / 0.1)' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '' }}
            >
              <LogOut className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs font-medium">Sign Out</span>
            </button>
          </nav>
        </div>
      )}

      {/* Left — Start button */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setStartOpen((v) => !v)}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-md transition-all"
          style={{
            backgroundColor: startOpen ? 'rgba(252,163,17,0.15)' : undefined,
            color: startOpen ? '#fca311' : 'white',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.12)' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = startOpen ? 'rgba(252,163,17,0.15)' : '' }}
          aria-label="Open start menu"
        >
          <Key
            className="h-5 w-5"
            style={{
              color: startOpen ? '#fca311' : 'white',
              filter: 'drop-shadow(0 2px 10px rgba(20,60,140,0.55))',
            }}
          />
          <span className="text-[11px] font-semibold text-white hidden sm:block" style={{ letterSpacing: '0.04em' }}>
            Turboware
          </span>
          <ChevronUp
            className="h-3 w-3 transition-transform"
            style={{
              color: 'rgba(255,255,255,0.5)',
              transform: startOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          />
        </button>
      </div>

      {/* Center — Open window button */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleMinimize}
          className="flex items-center gap-2 px-3 py-1 rounded-md text-sm font-medium transition-all"
          style={{
            backgroundColor: minimized ? 'rgba(55,65,81,0.5)' : 'rgba(55,65,81,0.8)',
            color: minimized ? 'rgba(156,163,175,1)' : 'white',
            boxShadow: !minimized ? 'inset 0 1px 2px rgba(0,0,0,0.4)' : undefined,
            outline: !minimized ? '2px solid #fca311' : undefined,
            outlineOffset: '-2px',
          }}
        >
          <Key className="w-3.5 h-3.5" />
          <span className="truncate max-w-[160px] text-xs">{windowTitle}</span>
        </button>
      </div>

      {/* Right — Theme toggle + clock */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-md transition-colors text-white/60 hover:text-white hover:bg-white/10"
          aria-label="Toggle theme"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        <div className="text-right select-none">
          <p className="text-white text-xs font-medium leading-none">{time}</p>
          <p className="text-white/50 text-[10px] leading-none mt-0.5">{date}</p>
        </div>
      </div>

      <style>{`
        @keyframes slideUpMenu {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
