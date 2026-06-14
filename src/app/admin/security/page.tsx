'use client'

import { useEffect, useState } from 'react'
import { Shield, ShieldCheck, Loader2 } from 'lucide-react'

export default function SecurityPage() {
  const [mfaEnabled, setMfaEnabled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [setup, setSetup] = useState<{ otpauthUrl: string; secret: string } | null>(null)
  const [code, setCode] = useState('')
  const [disablePassword, setDisablePassword] = useState('')
  const [disableCode, setDisableCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null)

  useEffect(() => {
    fetch('/api/auth/mfa/setup')
      .then(r => r.json())
      .then(d => setMfaEnabled(!!d.mfaEnabled))
      .finally(() => setLoading(false))
  }, [])

  function flash(text: string, ok = true) {
    setMessage({ text, ok })
    setTimeout(() => setMessage(null), 4000)
  }

  async function startSetup() {
    setBusy(true)
    const res = await fetch('/api/auth/mfa/setup', { method: 'POST' })
    setBusy(false)
    if (res.ok) {
      setSetup(await res.json())
      setCode('')
    } else {
      flash((await res.json().catch(() => ({}))).error || 'Setup failed', false)
    }
  }

  async function enableMfa(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    const res = await fetch('/api/auth/mfa/setup', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    })
    setBusy(false)
    if (res.ok) {
      setMfaEnabled(true)
      setSetup(null)
      setCode('')
      flash('Two-factor authentication is now enabled')
    } else {
      flash((await res.json().catch(() => ({}))).error || 'Invalid code', false)
    }
  }

  async function disableMfa(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    const res = await fetch('/api/auth/mfa/setup', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: disablePassword, code: disableCode }),
    })
    setBusy(false)
    if (res.ok) {
      setMfaEnabled(false)
      setSetup(null)
      setDisablePassword('')
      setDisableCode('')
      flash('Two-factor authentication disabled')
    } else {
      flash((await res.json().catch(() => ({}))).error || 'Could not disable MFA', false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center gap-2 text-muted-foreground text-sm">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading…
      </div>
    )
  }

  return (
    <div className="p-6 max-w-lg">
      <h1 className="text-lg font-bold text-foreground mb-1">Security</h1>
      <p className="text-xs text-muted-foreground mb-6">
        Protect admin access with TOTP (Google Authenticator, 1Password, etc.). Required on Vercel-hosted deployments.
      </p>

      {message && (
        <p className={`mb-4 text-xs rounded-md px-3 py-2 ${message.ok ? 'text-emerald-400 bg-emerald-950/40' : 'text-red-400 bg-red-950/40'}`}>
          {message.text}
        </p>
      )}

      <div className="rounded-xl border border-border bg-card/50 p-5">
        <div className="flex items-center gap-3 mb-4">
          {mfaEnabled
            ? <ShieldCheck className="w-5 h-5 text-emerald-400" />
            : <Shield className="w-5 h-5 text-muted-foreground" />}
          <div>
            <p className="text-sm font-medium text-foreground">
              Two-factor authentication
            </p>
            <p className="text-xs text-muted-foreground">
              {mfaEnabled ? 'Enabled — required at each sign-in' : 'Not enabled'}
            </p>
          </div>
        </div>

        {!mfaEnabled && !setup && (
          <button
            type="button"
            disabled={busy}
            onClick={startSetup}
            className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground disabled:opacity-50"
          >
            {busy ? 'Preparing…' : 'Set up authenticator'}
          </button>
        )}

        {setup && !mfaEnabled && (
          <form onSubmit={enableMfa} className="space-y-4">
            <p className="text-xs text-muted-foreground">
              Scan this URI in your authenticator app, or enter the secret manually:
            </p>
            <code className="block text-[10px] break-all p-2 rounded bg-muted/30 text-foreground/80">
              {setup.secret}
            </code>
            <a
              href={setup.otpauthUrl}
              className="text-xs text-[#fca311] underline break-all"
            >
              Open in authenticator app
            </a>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="6-digit code"
              className="w-full px-3 py-2 rounded-md text-sm bg-background border border-border"
              required
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={busy || code.length !== 6}
                className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground disabled:opacity-50"
              >
                Enable MFA
              </button>
              <button
                type="button"
                className="px-4 py-2 text-sm rounded-md border border-border"
                onClick={() => setSetup(null)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {mfaEnabled && (
          <form onSubmit={disableMfa} className="space-y-3 pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground pt-2">
              To disable MFA, confirm your password and a current authenticator code.
            </p>
            <input
              type="password"
              value={disablePassword}
              onChange={e => setDisablePassword(e.target.value)}
              placeholder="Password"
              className="w-full px-3 py-2 rounded-md text-sm bg-background border border-border"
              required
            />
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={disableCode}
              onChange={e => setDisableCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="6-digit code"
              className="w-full px-3 py-2 rounded-md text-sm bg-background border border-border"
              required
            />
            <button
              type="submit"
              disabled={busy || disableCode.length !== 6}
              className="px-4 py-2 text-sm rounded-md border border-red-500/40 text-red-400 disabled:opacity-50"
            >
              Disable MFA
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
