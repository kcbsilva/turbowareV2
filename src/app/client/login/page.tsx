'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { turboispSignupUrl } from '@/lib/signup-slug'
import { TurboAuthShell } from '@/components/TurboAuthShell'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type Lang = 'en' | 'pt'

const COPY: Record<Lang, {
  badge: string
  title: string
  subtitle: string
  cnpj: string
  password: string
  submit: string
  submitting: string
  noAccount: string
  requestAccess: string
  chromeAction: string
}> = {
  pt: {
    badge: 'Portal do cliente',
    title: 'Entrar no TurboISP',
    subtitle: 'Acesse licenças, faturas e suporte da sua operação.',
    cnpj: 'CNPJ',
    password: 'Senha',
    submit: 'Entrar',
    submitting: 'Entrando…',
    noAccount: 'Ainda não tem uma conta?',
    requestAccess: 'Solicitar acesso',
    chromeAction: 'Criar conta',
  },
  en: {
    badge: 'Client portal',
    title: 'Sign in to TurboISP',
    subtitle: 'Manage licenses, invoices, and support for your ISP.',
    cnpj: 'CNPJ',
    password: 'Password',
    submit: 'Sign in',
    submitting: 'Signing in…',
    noAccount: "Don't have an account?",
    requestAccess: 'Request access',
    chromeAction: 'Create account',
  },
}

export default function ClientLoginPage() {
  const router = useRouter()
  const [lang, setLang] = useState<Lang>('pt')
  const [cnpj, setCnpj] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const t = COPY[lang]

  function formatCnpj(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 14)
    return digits
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/client/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cnpj, password }),
    })

    setLoading(false)

    if (res.ok) {
      router.push('/client/dashboard')
    } else {
      const data = await res.json().catch(() => ({}))
      setError(data.error || 'Invalid CNPJ or password.')
    }
  }

  return (
    <TurboAuthShell actionHref={turboispSignupUrl()} actionLabel={t.chromeAction}>
      <div className="reg-signup-card w-full max-w-md p-7 sm:p-8 rounded-2xl">
        <div className="flex justify-end mb-4">
          <div className="flex rounded-md overflow-hidden border border-white/10" role="group" aria-label="Language">
            {(['pt', 'en'] as const).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setLang(code)}
                className={cn(
                  'px-2.5 py-1 text-[10px] font-bold transition-colors',
                  lang === code ? 'bg-[#fca311] text-[#040810]' : 'text-white/45 hover:text-white/70',
                )}
              >
                {code.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="text-center mb-7">
          <div className="turbo-badge mb-5">
            <span className="turbo-badge-dot" />
            {t.badge}
          </div>
          <h1 className="reg-title text-2xl font-semibold tracking-tight">{t.title}</h1>
          <p className="reg-desc text-sm mt-2 leading-relaxed">{t.subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="client-cnpj" className="reg-label">{t.cnpj}</label>
            <input
              id="client-cnpj"
              type="text"
              inputMode="numeric"
              autoComplete="username"
              value={cnpj}
              onChange={(e) => setCnpj(formatCnpj(e.target.value))}
              className="reg-input"
              placeholder="00.000.000/0000-00"
              required
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="client-password" className="reg-label">{t.password}</label>
            <input
              id="client-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="reg-input"
              placeholder="••••••••"
              required
            />
          </div>

          {error && <p className="reg-error" role="alert">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className={cn(buttonVariants({ size: 'lg' }), 'turbo-btn-primary w-full h-11 rounded-lg')}
          >
            {loading ? t.submitting : t.submit}
          </button>
        </form>

        <p className="text-center text-[11px] mt-5 text-white/35">
          {t.noAccount}{' '}
          <a href={turboispSignupUrl()} className="text-[#fca311]/80 hover:text-[#fca311] underline underline-offset-2">
            {t.requestAccess}
          </a>
        </p>
      </div>
    </TurboAuthShell>
  )
}
