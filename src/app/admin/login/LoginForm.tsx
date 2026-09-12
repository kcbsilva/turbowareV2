'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShieldCheck, Mail } from 'lucide-react'
import { TurboAuthShell } from '@/components/TurboAuthShell'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

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

  const titles: Record<Step, { title: string; subtitle: string }> = {
    login: { title: 'Turboware Admin', subtitle: 'License, billing, and tenant operations' },
    forgot: { title: 'Reset password', subtitle: 'We will email a single-use reset link' },
    mfa: { title: 'Two-factor verification', subtitle: 'Enter the 6-digit code from your authenticator app' },
    newPassword: { title: 'Set new password', subtitle: 'Choose a new password before continuing' },
  }

  const { title, subtitle } = titles[step]

  return (
    <TurboAuthShell actionHref="/client/login" actionLabel="Portal do cliente">
      <div className="reg-signup-card w-full max-w-md p-7 sm:p-8 rounded-2xl">
        <div className="text-center mb-7">
          {step === 'mfa' ? (
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 bg-gradient-to-br from-[#fca311]/25 to-[#1AABF0]/15 border border-[#fca311]/35">
              <ShieldCheck className="w-6 h-6 text-[#fca311]" />
            </div>
          ) : step === 'forgot' ? (
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 bg-gradient-to-br from-[#fca311]/25 to-[#1AABF0]/15 border border-[#fca311]/35">
              <Mail className="w-6 h-6 text-[#fca311]" />
            </div>
          ) : (
            <div className="turbo-badge mb-5">
              <span className="turbo-badge-dot" />
              Operator portal
            </div>
          )}
          <h1 className="reg-title text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="reg-desc text-sm mt-2 leading-relaxed">{subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {step === 'login' && (
            <>
              <div>
                <label htmlFor="admin-email" className="reg-label">Email</label>
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="reg-input"
                  placeholder="admin@example.com"
                  autoComplete="email"
                  autoFocus
                />
              </div>

              <div>
                <label htmlFor="admin-password" className="reg-label">Password</label>
                <input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="reg-input"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
              </div>

              <div className="text-right -mt-1">
                <button
                  type="button"
                  className="text-xs text-white/45 hover:text-white underline underline-offset-2"
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
            <div>
              {forgotSent ? (
                <p className="text-sm text-white/70 leading-relaxed">
                  If an account exists for that email, a single-use reset link has been sent. Check your inbox to continue.
                </p>
              ) : (
                <>
                  <label htmlFor="admin-forgot-email" className="reg-label">Email</label>
                  <input
                    id="admin-forgot-email"
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="reg-input"
                    placeholder="admin@example.com"
                    autoComplete="email"
                    required
                    autoFocus
                  />
                </>
              )}
              <button
                type="button"
                className="mt-4 text-xs text-white/45 hover:text-white underline underline-offset-2"
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
            <div>
              <label htmlFor="admin-mfa" className="reg-label">Authenticator code</label>
              <input
                id="admin-mfa"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="reg-input tracking-[0.3em] text-center"
                placeholder="000000"
                autoComplete="one-time-code"
                autoFocus
                required
              />
              <button
                type="button"
                className="mt-3 text-xs text-white/45 hover:text-white underline underline-offset-2"
                onClick={() => { setStep('login'); setMfaCode(''); setError('') }}
              >
                Back to sign in
              </button>
            </div>
          )}

          {step === 'newPassword' && (
            <>
              <div>
                <label htmlFor="admin-new-password" className="reg-label">New password</label>
                <input
                  id="admin-new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="reg-input"
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  required
                  autoFocus
                />
              </div>
              <div>
                <label htmlFor="admin-confirm-password" className="reg-label">Confirm password</label>
                <input
                  id="admin-confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="reg-input"
                  placeholder="Repeat password"
                  autoComplete="new-password"
                  required
                />
              </div>
            </>
          )}

          {error && <p className="reg-error" role="alert">{error}</p>}

          {!(step === 'forgot' && forgotSent) && (
            <button
              type="submit"
              disabled={
                loading ||
                (step === 'mfa' && mfaCode.length !== 6) ||
                (step === 'forgot' && !forgotEmail.trim())
              }
              className={cn(buttonVariants({ size: 'lg' }), 'turbo-btn-primary w-full h-11 rounded-lg')}
            >
              {loading
                ? 'Please wait…'
                : step === 'forgot'
                  ? 'Send reset link'
                  : step === 'mfa'
                    ? 'Verify'
                    : step === 'newPassword'
                      ? 'Save password'
                      : 'Sign in'}
            </button>
          )}
        </form>

        <p className="text-center text-[11px] mt-5 text-white/30">
          TurboISP Platform — operator access
        </p>
      </div>
    </TurboAuthShell>
  )
}
