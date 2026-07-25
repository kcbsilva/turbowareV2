'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'

export function ResetPasswordForm({ token }: { token: string }) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (password.length < 12 || password !== confirm) {
      setMessage('Use at least 12 characters and make sure both passwords match.')
      return
    }

    setSaving(true)
    setMessage('')
    const response = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    })
    const data = await response.json()
    setSaving(false)

    if (!response.ok) {
      setMessage(data.error ?? 'Unable to reset password.')
      return
    }
    setMessage('Password updated. You can now sign in.')
    setPassword('')
    setConfirm('')
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-slate-100">
      <form onSubmit={submit} className="mx-auto max-w-md space-y-5 rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-xl">
        <div>
          <h1 className="text-2xl font-semibold">Reset password</h1>
          <p className="mt-2 text-sm text-slate-400">Choose a new password for your Turboware admin account.</p>
        </div>
        <label className="block text-sm">
          New password
          <input
            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
            type="password"
            autoComplete="new-password"
            minLength={12}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        <label className="block text-sm">
          Confirm password
          <input
            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2"
            type="password"
            autoComplete="new-password"
            minLength={12}
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            required
          />
        </label>
        {message && <p className="text-sm text-slate-300">{message}</p>}
        <button className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium disabled:opacity-50" disabled={saving || !token}>
          {saving ? 'Updating…' : 'Update password'}
        </button>
        <Link className="block text-center text-sm text-blue-400 hover:text-blue-300" href="/admin/login">
          Back to sign in
        </Link>
      </form>
    </main>
  )
}
