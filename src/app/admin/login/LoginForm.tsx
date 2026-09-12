'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, Lock, Mail, ShieldCheck } from 'lucide-react'
import {
  TurboAuthShell,
  loginBtnClass,
  loginInputClassIcon,
  loginLabelClass,
  loginLinkClass,
} from '@/components/TurboAuthShell'
import { cn } from '@/lib/utils'

type Step = 'login' | 'forgot' | 'mfa' | 'newPassword'

export default function LoginForm() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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
  const formDisabled = loading

  return (
    <TurboAuthShell
      title={title}
      subtitle={subtitle}
      footer={
        step === 'login' ? (
          <Link href="/client/login" className={loginLinkClass}>
            Client portal
          </Link>
        ) : undefined
      }
    >
      {error && (
        <div
          role="alert"
          className="mb-5 rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <fieldset disabled={formDisabled} className="space-y-4">
          {step === 'login' && (
            <>
              <div>
                <label htmlFor="admin-email" className={loginLabelClass}>Email</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1a2333]/35" />
                  <input
                    id="admin-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={loginInputClassIcon}
                    placeholder="admin@example.com"
                    autoComplete="email"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label htmlFor="admin-password" className={loginLabelClass}>Password</label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1a2333]/35" />
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={cn(loginInputClassIcon, 'pr-11')}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#1a2333]/35 hover:text-[#1a2333] transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="text-right -mt-1">
                <button
                  type="button"
                  className={cn(loginLinkClass, 'text-xs')}
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
                <p className="text-sm text-[#1a2333]/70 leading-relaxed">
                  If an account exists for that email, a single-use reset link has been sent. Check your inbox to continue.
                </p>
              ) : (
                <>
                  <label htmlFor="admin-forgot-email" className={loginLabelClass}>Email</label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1a2333]/35" />
                    <input
                      id="admin-forgot-email"
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className={loginInputClassIcon}
                      placeholder="admin@example.com"
                      autoComplete="email"
                      required
                      autoFocus
                    />
                  </div>
                </>
              )}
              <button
                type="button"
                className={cn(loginLinkClass, 'mt-4 text-xs')}
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
              <label htmlFor="admin-mfa" className={loginLabelClass}>Authenticator code</label>
              <div className="relative">
                <ShieldCheck className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1a2333]/35" />
                <input
                  id="admin-mfa"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className={cn(loginInputClassIcon, 'tracking-[0.3em] text-center pr-3')}
                  placeholder="000000"
                  autoComplete="one-time-code"
                  autoFocus
                  required
                />
              </div>
              <button
                type="button"
                className={cn(loginLinkClass, 'mt-3 text-xs')}
                onClick={() => { setStep('login'); setMfaCode(''); setError('') }}
              >
                Back to sign in
              </button>
            </div>
          )}

          {step === 'newPassword' && (
            <>
              <div>
                <label htmlFor="admin-new-password" className={loginLabelClass}>New password</label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1a2333]/35" />
                  <input
                    id="admin-new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={loginInputClassIcon}
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    required
                    autoFocus
                  />
                </div>
              </div>
              <div>
                <label htmlFor="admin-confirm-password" className={loginLabelClass}>Confirm password</label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1a2333]/35" />
                  <input
                    id="admin-confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={loginInputClassIcon}
                    placeholder="Repeat password"
                    autoComplete="new-password"
                    required
                  />
                </div>
              </div>
            </>
          )}

          {!(step === 'forgot' && forgotSent) && (
            <button
              type="submit"
              disabled={
                loading ||
                (step === 'mfa' && mfaCode.length !== 6) ||
                (step === 'forgot' && !forgotEmail.trim())
              }
              className={loginBtnClass}
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
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
        </fieldset>
      </form>
    </TurboAuthShell>
  )
}
