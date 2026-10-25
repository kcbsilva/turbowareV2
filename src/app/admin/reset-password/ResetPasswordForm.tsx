'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useAdminLang } from '@/components/admin/AdminLangProvider'

export function ResetPasswordForm({ token }: { token: string }) {
  const { t } = useAdminLang()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (password.length < 12 || password !== confirm) {
      setMessage(t('login.resetRules'))
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
      setMessage(data.error ?? t('login.resetFailed'))
      return
    }
    setMessage(t('login.passwordUpdated'))
    setPassword('')
    setConfirm('')
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-slate-100">
      <form onSubmit={submit} className="mx-auto max-w-md space-y-5 rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-xl">
        <div>
          <h1 className="text-2xl font-semibold">{t('login.resetTitle')}</h1>
          <p className="mt-2 text-sm text-slate-400">{t('login.resetLead')}</p>
        </div>
        <label className="block text-sm">
          {t('login.newPassword')}
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
          {t('login.confirmPassword')}
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
          {saving ? t('login.updating') : t('login.update')}
        </button>
        <Link className="block text-center text-sm text-blue-400 hover:text-blue-300" href="/admin/login">
          {t('login.back')}
        </Link>
      </form>
    </main>
  )
}
