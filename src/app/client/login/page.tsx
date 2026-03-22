'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Key } from 'lucide-react'

const BG = '#e5e5e5'

export default function ClientLoginPage() {
  const router = useRouter()
  const [cnpj, setCnpj] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Format CNPJ as XX.XXX.XXX/XXXX-XX
  function formatCnpj(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 14)
    return digits
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/client/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cnpj, password }),
    })

    setLoading(false)

    if (res.ok) {
      router.push('/client/dashboard')
    } else {
      const data = await res.json().catch(() => ({}))
      setError(data.error || 'Invalid CNPJ or password.')
    }
  }

  const inputStyle: React.CSSProperties = {
    backgroundColor: '#fff',
    border: '1px solid rgba(0,0,0,0.12)',
    color: '#0a1428',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: BG }}
    >
      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(0,0,0,0.07) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      <div className="relative w-full max-w-sm px-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 shadow-md"
            style={{ backgroundColor: '#fca311' }}
          >
            <Key className="w-7 h-7" style={{ color: '#081124' }} />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: '#0a1428' }}>Client Portal</h1>
          <p className="text-xs mt-1" style={{ color: 'rgba(10,20,40,0.45)' }}>
            Sign in to manage your licenses
          </p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl p-7 shadow-sm"
          style={{
            backgroundColor: '#fff',
            border: '1px solid rgba(0,0,0,0.08)',
          }}
        >
          {/* CNPJ */}
          <div className="mb-4">
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(10,20,40,0.55)' }}>
              CNPJ
            </label>
            <input
              type="text"
              value={cnpj}
              onChange={(e) => setCnpj(formatCnpj(e.target.value))}
              className="w-full px-3 py-2.5 rounded-md text-sm transition focus:outline-none"
              style={inputStyle}
              onFocus={(e) => { e.currentTarget.style.outline = '2px solid rgba(252,163,17,0.6)'; e.currentTarget.style.outlineOffset = '0' }}
              onBlur={(e) => { e.currentTarget.style.outline = 'none' }}
              placeholder="00.000.000/0000-00"
              required
              autoFocus
            />
          </div>

          {/* Password */}
          <div className="mb-5">
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(10,20,40,0.55)' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 rounded-md text-sm transition focus:outline-none"
              style={inputStyle}
              onFocus={(e) => { e.currentTarget.style.outline = '2px solid rgba(252,163,17,0.6)'; e.currentTarget.style.outlineOffset = '0' }}
              onBlur={(e) => { e.currentTarget.style.outline = 'none' }}
              placeholder="Enter your password"
              required
            />
          </div>

          {error && (
            <p
              className="mb-4 text-xs rounded-md px-3 py-2"
              style={{
                color: '#b91c1c',
                backgroundColor: 'rgba(185,28,28,0.06)',
                border: '1px solid rgba(185,28,28,0.15)',
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 text-sm font-semibold rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#fca311', color: '#081124' }}
            onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLElement).style.backgroundColor = '#f59e0b' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#fca311' }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-[10px] mt-4" style={{ color: 'rgba(10,20,40,0.3)' }}>
          Don&apos;t have an account?{' '}
          <Link href="/turboisp/register" className="underline underline-offset-2 hover:opacity-70 transition">
            Request access
          </Link>
        </p>
      </div>
    </div>
  )
}
