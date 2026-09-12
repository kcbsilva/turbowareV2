'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import {
  LoginEmailField,
  LoginMfaCodeField,
  LoginPasswordField,
  LoginShell,
  loginLinkClass,
} from '@/components/auth/LoginShell'

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

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
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

  const titles: Record<Step, { title: string; subtitle: string; submit: string }> = {
    login: { title: 'Turboware Admin', subtitle: 'License, billing, and tenant operations', submit: 'Sign in' },
    forgot: { title: 'Reset password', subtitle: 'We will email a single-use reset link', submit: 'Send reset link' },
    mfa: { title: 'Two-factor verification', subtitle: 'Enter the 6-digit code from your authenticator app', submit: 'Verify' },
    newPassword: { title: 'Set new password', subtitle: 'Choose a new password before continuing', submit: 'Save password' },
  }

  const { title, subtitle, submit } = titles[step]

  return (
    <LoginShell
      title={title}
      subtitle={subtitle}
      error={error}
      isSubmitting={loading}
      submitDisabled={
        (step === 'mfa' && mfaCode.length !== 6) ||
        (step === 'forgot' && !forgotEmail.trim())
      }
      showSubmit={!(step === 'forgot' && forgotSent)}
      submitLabel={submit}
      submitPendingLabel="Please wait…"
      onSubmit={handleSubmit}
      footer={
        <p className="text-xs text-[#1a2333]/45">TurboISP Platform — operator access</p>
      }
    >
      {step === 'login' && (
        <>
          <LoginEmailField
            id="admin-email"
            label="Email"
            value={email}
            onChange={setEmail}
            autoFocus
          />
          <LoginPasswordField
            id="admin-password"
            label="Password"
            value={password}
            onChange={setPassword}
          />
          <div className="text-right -mt-1">
            <button
              type="button"
              className={loginLinkClass}
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
            <p className="text-sm leading-relaxed text-[#1a2333]/70">
              If an account exists for that email, a single-use reset link has been sent. Check your inbox to continue.
            </p>
          ) : (
            <LoginEmailField
              id="admin-forgot-email"
              label="Email"
              value={forgotEmail}
              onChange={setForgotEmail}
              required
              autoFocus
            />
          )}
          <button
            type="button"
            className={`${loginLinkClass} mt-4 text-xs`}
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
          <LoginMfaCodeField value={mfaCode} onChange={setMfaCode} />
          <button
            type="button"
            className={`${loginLinkClass} mt-3 text-xs`}
            onClick={() => { setStep('login'); setMfaCode(''); setError('') }}
          >
            Back to sign in
          </button>
        </div>
      )}

      {step === 'newPassword' && (
        <>
          <LoginPasswordField
            id="admin-new-password"
            label="New password"
            value={newPassword}
            onChange={setNewPassword}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            autoFocus
          />
          <LoginPasswordField
            id="admin-confirm-password"
            label="Confirm password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            autoComplete="new-password"
            placeholder="Repeat password"
          />
        </>
      )}
    </LoginShell>
  )
}
