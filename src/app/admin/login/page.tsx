'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Key } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    setLoading(false)

    if (res.ok) {
      router.push('/admin')
    } else {
      setError('Invalid password. Please try again.')
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #060c1a 0%, #0a1428 40%, #071020 70%, #060c1a 100%)',
      }}
    >
      {/* Dot grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(252,163,17,0.06) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Ambient glow */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(20,33,61,0.6) 0%, transparent 70%)' }}
      />

      <div className="relative w-full max-w-sm px-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ backgroundColor: '#fca311' }}
          >
            <Key className="w-7 h-7" style={{ color: '#081124' }} />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: '#f5f5f5' }}>Turboware Admin</h1>
          <p className="text-xs mt-1" style={{ color: 'rgba(165,180,210,0.6)' }}>
            License Key Management
          </p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl p-7 shadow-2xl"
          style={{
            backgroundColor: 'hsl(222 38% 11% / 0.97)',
            border: '1px solid hsl(222 30% 22% / 0.8)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div className="mb-5">
            <label className="block text-xs font-medium mb-2" style={{ color: 'hsl(214 18% 70%)' }}>
              Admin Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 rounded-md text-sm transition focus:outline-none"
              style={{
                backgroundColor: 'hsl(222 45% 6%)',
                border: '1px solid hsl(222 30% 22%)',
                color: 'hsl(0 0% 96%)',
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.3)',
              }}
              onFocus={(e) => { e.currentTarget.style.outline = '2px solid #fca311'; e.currentTarget.style.outlineOffset = '0px' }}
              onBlur={(e) => { e.currentTarget.style.outline = 'none' }}
              placeholder="Enter password"
              required
              autoFocus
            />
          </div>

          {error && (
            <p
              className="mb-4 text-xs rounded-md px-3 py-2"
              style={{
                color: 'hsl(356 72% 65%)',
                backgroundColor: 'hsl(356 72% 10%)',
                border: '1px solid hsl(356 72% 25%)',
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 text-sm font-semibold rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: '#fca311',
              color: '#081124',
            }}
            onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLElement).style.backgroundColor = '#f59e0b' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#fca311' }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-[10px] mt-4" style={{ color: 'rgba(165,180,210,0.3)' }}>
          TurboISP Platform — License Server
        </p>
      </div>
    </div>
  )
}
