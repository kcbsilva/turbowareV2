'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Key, LogOut } from 'lucide-react'

export default function ClientHeader() {
  const router = useRouter()

  async function logout() {
    await fetch('/api/client/auth/logout', { method: 'POST' })
    router.push('/client/login')
  }

  return (
    <header
      className="relative z-10 border-b border-white/5"
      style={{ backgroundColor: 'rgba(5,12,28,0.92)', backdropFilter: 'blur(16px)' }}
    >
      <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/client/dashboard" className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: '#fca311' }}
          >
            <Key className="w-4 h-4" style={{ color: '#081124' }} />
          </div>
          <span className="text-sm font-bold tracking-tight text-white">Turboware</span>
          <span
            className="text-[10px] font-medium px-1.5 py-0.5 rounded border ml-1"
            style={{
              color: '#fca311',
              borderColor: 'rgba(252,163,17,0.3)',
              backgroundColor: 'rgba(252,163,17,0.08)',
            }}
          >
            Client Portal
          </span>
        </Link>

        {/* Sign out */}
        <button
          onClick={logout}
          className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/80 transition"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign out
        </button>
      </div>
    </header>
  )
}
