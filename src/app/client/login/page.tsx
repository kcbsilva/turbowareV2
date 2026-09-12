'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { turboispSignupUrl } from '@/lib/signup-slug'
import {
  LoginPasswordField,
  LoginShell,
  loginInputPadClass,
  loginLabelClass,
  loginLinkClass,
} from '@/components/auth/LoginShell'
import { cn } from '@/lib/utils'

type Lang = 'en' | 'pt'

const COPY: Record<Lang, {
  title: string
  subtitle: string
  cnpj: string
  password: string
  submit: string
  submitting: string
  noAccount: string
  requestAccess: string
}> = {
  pt: {
    title: 'Entrar no TurboISP',
    subtitle: 'Acesse licenças, faturas e suporte da sua operação.',
    cnpj: 'CNPJ',
    password: 'Senha',
    submit: 'Entrar',
    submitting: 'Entrando…',
    noAccount: 'Ainda não tem uma conta?',
    requestAccess: 'Solicitar acesso',
  },
  en: {
    title: 'Sign in to TurboISP',
    subtitle: 'Manage licenses, invoices, and support for your ISP.',
    cnpj: 'CNPJ',
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

  async function handleSubmit(e: FormEvent) {
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
    <LoginShell
      title={t.title}
      subtitle={t.subtitle}
      error={error}
      isSubmitting={loading}
      submitLabel={t.submit}
      submitPendingLabel={t.submitting}
      onSubmit={handleSubmit}
      toolbar={
        <div className="flex overflow-hidden rounded-md border border-[#1a2333]/15 bg-[#f4f6fa]" role="group" aria-label="Language">
          {(['pt', 'en'] as const).map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => setLang(code)}
              className={cn(
                'px-2.5 py-1 text-[10px] font-bold transition-colors',
                lang === code ? 'bg-[#081124] text-white' : 'text-[#1a2333]/55 hover:text-[#1a2333]',
              )}
            >
              {code.toUpperCase()}
            </button>
          ))}
        </div>
      }
      footer={
        <p className="text-[#1a2333]/55">
          {t.noAccount}{' '}
          <a href={turboispSignupUrl()} className={loginLinkClass}>
            {t.requestAccess}
          </a>
        </p>
      }
    >
      <div>
        <label htmlFor="client-cnpj" className={loginLabelClass}>{t.cnpj}</label>
        <input
          id="client-cnpj"
          type="text"
          inputMode="numeric"
          autoComplete="username"
          value={cnpj}
          onChange={(e) => setCnpj(formatCnpj(e.target.value))}
          className={loginInputPadClass}
          placeholder="00.000.000/0000-00"
          required
          autoFocus
        />
      </div>

      <LoginPasswordField
        id="client-password"
        label={t.password}
        value={password}
        onChange={setPassword}
      />
    </LoginShell>
  )
}
