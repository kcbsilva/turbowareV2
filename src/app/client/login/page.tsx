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
import { cn } from '@/lib/utils'
import { formatLoginIdentifierInput } from '@/lib/client-login'

type Lang = 'en' | 'pt'

const COPY: Record<Lang, {
  title: string
  subtitle: string
  identifier: string
  password: string
  submit: string
  submitting: string
  noAccount: string
  requestAccess: string
}> = {
  pt: {
    title: 'Entrar no TurboISP',
    subtitle: 'Acesse licenças, faturas e suporte da sua operação.',
    identifier: 'E-mail ou CNPJ',
    password: 'Senha',
    submit: 'Entrar',
    submitting: 'Entrando…',
    noAccount: 'Ainda não tem uma conta?',
    requestAccess: 'Solicitar acesso',
  },
  en: {
    title: 'Sign in to TurboISP',
    subtitle: 'Manage licenses, invoices, and support for your ISP.',
    identifier: 'Email or business number',
    password: 'Password',
    submit: 'Sign in',
    submitting: 'Signing in…',
    noAccount: "Don't have an account?",
    requestAccess: 'Request access',
  },
}

export default function ClientLoginPage() {
  const router = useRouter()
  const [lang, setLang] = useState<Lang>('pt')
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const t = COPY[lang]

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
      setError(data.error || (lang === 'pt' ? 'E-mail, CNPJ ou senha inválidos.' : 'Invalid email, business number, or password.'))
    }
  }

  return (
    <TurboAuthShell
      title={t.title}
      subtitle={t.subtitle}
      ipLabel={lang === 'pt' ? 'Seu IP' : 'Your IP'}
      headerExtra={
        <div className="mb-4 flex justify-end">
          <div className="flex overflow-hidden rounded-md border border-[#1a2333]/15" role="group" aria-label="Language">
            {(['pt', 'en'] as const).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setLang(code)}
                className={cn(
                  'px-2.5 py-1 text-[10px] font-bold transition-colors',
                  lang === code ? 'bg-[#fca311] text-[#081124]' : 'text-[#1a2333]/45 hover:text-[#1a2333]',
                )}
              >
                {code.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      }
      footer={
        <>
          {t.noAccount}{' '}
          <a href={turboispSignupUrl()} className={loginLinkClass}>
            {t.requestAccess}
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
            <label htmlFor="client-identifier" className={loginLabelClass}>{t.identifier}</label>
            <input
              id="client-identifier"
              type="text"
              autoComplete="username"
              value={identifier}
              onChange={(e) => setIdentifier(formatLoginIdentifierInput(e.target.value))}
              className={loginInputClass}
              placeholder={lang === 'pt' ? 'email@empresa.com ou 00.000.000/0000-00' : 'you@company.com or business number'}
              required
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="client-password" className={loginLabelClass}>{t.password}</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1a2333]/35" />
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
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#1a2333]/35 hover:text-[#1a2333] transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className={loginBtnClass}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? t.submitting : t.submit}
          </button>
        </fieldset>
      </form>
    </TurboAuthShell>
  )
}
