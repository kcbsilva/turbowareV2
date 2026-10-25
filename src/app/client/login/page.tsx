'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2, Lock } from 'lucide-react'
import { turboispSignupUrl } from '@/lib/signup-slug'
import {
  TurboAuthShell,
  loginBtnClass,
  loginInputClass,
  loginInputClassIcon,
  loginLabelClass,
  loginLinkClass,
} from '@/components/TurboAuthShell'
import { ClientLangToggle, useClientLang } from '@/components/client/ClientLangProvider'
import { explainApiError } from '@/lib/api-errors'
import { cn } from '@/lib/utils'
import { formatLoginIdentifierInput } from '@/lib/client-login'

export default function ClientLoginPage() {
  const router = useRouter()
  const { lang, t } = useClientLang()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/client/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    })

    setLoading(false)

    if (res.ok) {
      router.push('/client/dashboard')
    } else {
      const data = await res.json().catch(() => ({}))
      setError(explainApiError(data.error, lang) || t('login.invalid'))
    }
  }

  return (
    <TurboAuthShell
      title={t('login.title')}
      subtitle={t('login.subtitle')}
      ipLabel={t('login.ip')}
      headerExtra={
        <div className="mb-4 flex justify-end">
          <ClientLangToggle />
        </div>
      }
      footer={
        <>
          {t('login.noAccount')}{' '}
          <a href={turboispSignupUrl()} className={loginLinkClass}>
            {t('login.requestAccess')}
          </a>
        </>
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
        <fieldset disabled={loading} className="space-y-4">
          <div>
            <label htmlFor="client-identifier" className={loginLabelClass}>{t('login.identifier')}</label>
            <input
              id="client-identifier"
              type="text"
              autoComplete="username"
              value={identifier}
              onChange={(e) => setIdentifier(formatLoginIdentifierInput(e.target.value))}
              className={loginInputClass}
              placeholder={t('login.placeholder')}
              required
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="client-password" className={loginLabelClass}>{t('login.password')}</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
              <input
                id="client-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={cn(loginInputClassIcon, 'pr-11')}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-neutral-500 hover:text-white transition-colors"
                aria-label={showPassword ? t('login.hidePassword') : t('login.showPassword')}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className={loginBtnClass}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? t('login.submitting') : t('login.submit')}
          </button>
        </fieldset>
      </form>
    </TurboAuthShell>
  )
}
