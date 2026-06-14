'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Key, ShieldCheck, Mail } from 'lucide-react'

type Step = 'login' | 'forgot' | 'mfa' | 'newPassword'

export default function LoginForm() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mfaCode, setMfaCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotSent, setForgotSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (step === 'forgot') {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim().toLowerCase() }),
      })
      setLoading(false)
      if (res.ok) {
        setForgotSent(true)
      } else {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'Could not send reset email.')
      }
      return
    }

    if (step === 'newPassword') {
      if (newPassword.length < 8) {
        setError('Password must be at least 8 characters.')
        setLoading(false)
        return
      }
      if (newPassword !== confirmPassword) {
        setError('Passwords do not match.')
        setLoading(false)
        return
      }
      const res = await fetch('/api/auth/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      })
      setLoading(false)
      if (res.ok) {
        router.push('/admin')
      } else {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'Could not update password.')
      }
      return
    }

    if (step === 'mfa') {
      const res = await fetch('/api/auth/mfa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: mfaCode }),
      })
      setLoading(false)
      if (res.ok) {
        router.push('/admin')
      } else {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'Invalid verification code.')
      }
      return
    }

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email || undefined, password }),
    })

    setLoading(false)

    if (res.ok) {
      const data = await res.json().catch(() => ({}))
      if (data.mfaRequired) {
        setStep('mfa')
        setMfaCode('')
        return
      }
      if (data.mustChangePassword) {
        setStep('newPassword')
        setNewPassword('')
        setConfirmPassword('')
        return
      }
      router.push('/admin')
    } else {
      const data = await res.json().catch(() => ({}))
      setError(data.error || 'Invalid credentials. Please try again.')
    }
  }

  const inputStyle = {
    backgroundColor: 'hsl(222 45% 6%)',
    border: '1px solid hsl(222 30% 22%)',
    color: 'hsl(0 0% 96%)',
    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.3)',
  } as const

  function focusInput(e: React.FocusEvent<HTMLInputElement>) {
    e.currentTarget.style.outline = '2px solid #fca311'
    e.currentTarget.style.outlineOffset = '0px'
  }
  function blurInput(e: React.FocusEvent<HTMLInputElement>) {
    e.currentTarget.style.outline = 'none'
  }

  const titles: Record<Step, { title: string; subtitle: string }> = {
    login: { title: 'Turboware Admin', subtitle: 'License & billing management' },
    forgot: { title: 'Reset password', subtitle: 'We will email a temporary password' },
    mfa: { title: 'Turboware Admin', subtitle: 'Enter the 6-digit code from your authenticator app' },
    newPassword: { title: 'Set new password', subtitle: 'Choose a new password before continuing' },
  }

  const { title, subtitle } = titles[step]

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #060c1a 0%, #0a1428 40%, #071020 70%, #060c1a 100%)',
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(252,163,17,0.06) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(20,33,61,0.6) 0%, transparent 70%)' }}
      />

      <div className="relative w-full max-w-sm px-4">
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ backgroundColor: '#fca311' }}
          >
            {step === 'mfa'
              ? <ShieldCheck className="w-7 h-7" style={{ color: '#081124' }} />
              : step === 'forgot'
                ? <Mail className="w-7 h-7" style={{ color: '#081124' }} />
                : <Key className="w-7 h-7" style={{ color: '#081124' }} />}
          </div>
          <h1 className="text-2xl font-bold" style={{ color: '#f5f5f5' }}>{title}</h1>
          <p className="text-xs mt-1" style={{ color: 'rgba(165,180,210,0.6)' }}>{subtitle}</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl p-7 shadow-2xl"
          style={{
            backgroundColor: 'hsl(222 38% 11% / 0.97)',
            border: '1px solid hsl(222 30% 22% / 0.8)',
            backdropFilter: 'blur(12px)',
          }}
        >
          {step === 'login' && (
            <>
              <div className="mb-4">
                <label className="block text-xs font-medium mb-2" style={{ color: 'hsl(214 18% 70%)' }}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-md text-sm transition focus:outline-none"
                  style={inputStyle}
                  onFocus={focusInput}
                  onBlur={blurInput}
                  placeholder="admin@example.com"
                  autoComplete="email"
                  autoFocus
                />
              </div>

              <div className="mb-2">
                <label className="block text-xs font-medium mb-2" style={{ color: 'hsl(214 18% 70%)' }}>
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-md text-sm transition focus:outline-none"
                  style={inputStyle}
                  onFocus={focusInput}
                  onBlur={blurInput}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  required
                />
              </div>

              <div className="mb-5 text-right">
                <button
                  type="button"
                  className="text-xs underline"
                  style={{ color: 'rgba(165,180,210,0.6)' }}
                  onClick={() => {
                    setStep('forgot')
                    setForgotEmail(email)
                    setForgotSent(false)
                    setError('')
                  }}
                >
                  Forgot password?
                </button>
              </div>
            </>
          )}

          {step === 'forgot' && (
            <div className="mb-5">
              {forgotSent ? (
                <p className="text-sm" style={{ color: 'rgba(165,180,210,0.85)' }}>
                  If an account exists for that email, a temporary password has been sent. Check your inbox, sign in, then set a new password.
                </p>
              ) : (
                <>
                  <label className="block text-xs font-medium mb-2" style={{ color: 'hsl(214 18% 70%)' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-md text-sm transition focus:outline-none"
                    style={inputStyle}
                    onFocus={focusInput}
                    onBlur={blurInput}
                    placeholder="admin@example.com"
                    autoComplete="email"
                    required
                    autoFocus
                  />
                </>
              )}
              <button
                type="button"
                className="mt-4 text-xs underline"
                style={{ color: 'rgba(165,180,210,0.6)' }}
                onClick={() => {
                  setStep('login')
                  setForgotSent(false)
                  setError('')
                }}
              >
                Back to sign in
              </button>
            </div>
          )}

          {step === 'mfa' && (
            <div className="mb-5">
              <label className="block text-xs font-medium mb-2" style={{ color: 'hsl(214 18% 70%)' }}>
                Authenticator code
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full px-3 py-2.5 rounded-md text-sm tracking-[0.3em] text-center transition focus:outline-none"
                style={inputStyle}
                onFocus={focusInput}
                onBlur={blurInput}
                placeholder="000000"
                autoComplete="one-time-code"
                autoFocus
                required
              />
              <button
                type="button"
                className="mt-3 text-xs underline"
                style={{ color: 'rgba(165,180,210,0.6)' }}
                onClick={() => { setStep('login'); setMfaCode(''); setError('') }}
              >
                Back to sign in
              </button>
            </div>
          )}

          {step === 'newPassword' && (
            <>
              <div className="mb-4">
                <label className="block text-xs font-medium mb-2" style={{ color: 'hsl(214 18% 70%)' }}>
                  New password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-md text-sm transition focus:outline-none"
                  style={inputStyle}
                  onFocus={focusInput}
                  onBlur={blurInput}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  required
                  autoFocus
                />
              </div>
              <div className="mb-5">
                <label className="block text-xs font-medium mb-2" style={{ color: 'hsl(214 18% 70%)' }}>
                  Confirm password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-md text-sm transition focus:outline-none"
                  style={inputStyle}
                  onFocus={focusInput}
                  onBlur={blurInput}
                  placeholder="Repeat password"
                  autoComplete="new-password"
                  required
                />
              </div>
            </>
          )}

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

          {!(step === 'forgot' && forgotSent) && (
            <button
              type="submit"
              disabled={
                loading ||
                (step === 'mfa' && mfaCode.length !== 6) ||
                (step === 'forgot' && !forgotEmail.trim())
              }
              className="w-full py-2.5 text-sm font-semibold rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#fca311', color: '#081124' }}
              onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLElement).style.backgroundColor = '#f59e0b' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#fca311' }}
            >
              {loading
                ? 'Please wait…'
                : step === 'forgot'
                  ? 'Send temporary password'
                  : step === 'mfa'
                    ? 'Verify'
                    : step === 'newPassword'
                      ? 'Save password'
                      : 'Sign in'}
            </button>
          )}
        </form>

        <p className="text-center text-[10px] mt-4" style={{ color: 'rgba(165,180,210,0.3)' }}>
          TurboISP Platform — Client Management
        </p>
      </div>
    </div>
  )
}
