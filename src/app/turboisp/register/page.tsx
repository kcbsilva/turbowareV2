'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  CheckCircle,
  ArrowRight,
  Loader2,
  Eye,
  EyeOff,
  ShieldCheck,
  User,
  Building2,
} from 'lucide-react'

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void
      execute: (siteKey: string, opts: { action: string }) => Promise<string>
    }
  }
}

const BG = '#e5e5e5'
const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''
const CLIENT_LOGIN_URL = 'https://turboware.com.br/client/auth/login'

type Step = 1 | 2

function formatCpf(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  return digits
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1-$2')
}

function formatCnpj(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 14)
  return digits
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
}

function normalizeDdns(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/^-+|-+$/g, '')
}

function appendNotes(form: FormState) {
  return [
    'Dados Pessoais',
    `Primeiro Nome: ${form.firstName}`,
    `Sobrenome: ${form.lastName}`,
    `CPF: ${form.cpf}`,
    `Telefone: ${form.phone}`,
    '',
    'Empresa',
    `CNPJ: ${form.cnpj}`,
    `Nome Fantasia: ${form.tradeName}`,
    `Razão Social: ${form.legalName}`,
    `Data de Abertura: ${form.openingDate}`,
    `Endereço completo: ${form.fullAddress}`,
    `Email financeiro: ${form.financialEmail}`,
    `Email técnico: ${form.technicalEmail || 'N/A'}`,
    '',
    'DDNS',
    `Subdomínio: ${form.ddns}`,
    `Username: ${form.ddnsUsername}`,
  ].join('\n')
}

type FormState = {
  firstName: string
  lastName: string
  cpf: string
  phone: string
  cnpj: string
  tradeName: string
  legalName: string
  openingDate: string
  fullAddress: string
  financialEmail: string
  technicalEmail: string
  ddns: string
  ddnsUsername: string
  ddnsPassword: string
  ddnsPasswordConfirm: string
}

export default function RegisterPage() {
  const [step, setStep] = useState<Step>(1)
  const [form, setForm] = useState<FormState>({
    firstName: '',
    lastName: '',
    cpf: '',
    phone: '',
    cnpj: '',
    tradeName: '',
    legalName: '',
    openingDate: '',
    fullAddress: '',
    financialEmail: '',
    technicalEmail: '',
    ddns: '',
    ddnsUsername: '',
    ddnsPassword: '',
    ddnsPasswordConfirm: '',
  })
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checkingDdns, setCheckingDdns] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [ddnsStatus, setDdnsStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle')
  const [ddnsMessage, setDdnsMessage] = useState('')
  const [portalSubdomain, setPortalSubdomain] = useState('')

  function set(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function runRecaptcha(action: string) {
    if (!RECAPTCHA_SITE_KEY || !window.grecaptcha) return ''
    return new Promise<string>((resolve, reject) => {
      window.grecaptcha?.ready(() => {
        window.grecaptcha!
          .execute(RECAPTCHA_SITE_KEY, { action })
          .then(resolve)
          .catch(reject)
      })
    })
  }

  async function checkDdnsAvailability() {
    const candidate = normalizeDdns(form.ddns)
    if (!candidate) {
      setDdnsStatus('idle')
      setDdnsMessage('Informe um nome para verificar.')
      return false
    }

    setCheckingDdns(true)
    setDdnsStatus('checking')
    setDdnsMessage('')

    try {
      const res = await fetch(`/api/register/ddns?name=${encodeURIComponent(candidate)}`)
      const data = await res.json()
      if (!res.ok || !data.available) {
        setDdnsStatus('taken')
        setDdnsMessage(data.error || 'Nome indisponível.')
        return false
      }

      setDdnsStatus('available')
      setDdnsMessage(data.message || 'Nome disponível.')
      return true
    } catch {
      setDdnsStatus('idle')
      setDdnsMessage('Não foi possível verificar agora.')
      return false
    } finally {
      setCheckingDdns(false)
    }
  }

  useEffect(() => {
    if (!form.ddns) {
      setDdnsStatus('idle')
      setDdnsMessage('')
      return
    }
    const timer = setTimeout(() => {
      void checkDdnsAvailability()
    }, 500)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.ddns])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (step === 1) {
      setStep(2)
      return
    }

    if (!acceptedTerms) {
      setError('Você precisa concordar com os Termos de Serviços.')
      return
    }
    if (form.ddnsPassword !== form.ddnsPasswordConfirm) {
      setError('As senhas do DDNS não coincidem.')
      return
    }
    if (ddnsStatus !== 'available') {
      setError('Verifique e escolha um nome DDNS disponível antes de enviar.')
      return
    }

    setLoading(true)
    try {
      const token = await runRecaptcha('register_submit')

      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          recaptchaToken: token,
          acceptedTerms,
          internalNotes: appendNotes(form),
        }),
      })

      if (res.ok) {
        setPortalSubdomain(normalizeDdns(form.ddns))
        setSuccess(true)
      } else {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'Something went wrong. Please try again.')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    backgroundColor: '#fff',
    border: '1px solid rgba(0,0,0,0.12)',
    color: '#0a1428',
  }

  const focusProps = {
    onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      e.currentTarget.style.outline = '2px solid rgba(252,163,17,0.55)'
      e.currentTarget.style.outlineOffset = '0'
    },
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      e.currentTarget.style.outline = 'none'
    },
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: BG }}>
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(0,0,0,0.055) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-3xl">
          {success ? (
            <div className="text-center">
              <div
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 border"
                style={{ backgroundColor: 'rgba(16,185,129,0.08)', borderColor: 'rgba(16,185,129,0.2)' }}
              >
                <CheckCircle className="w-7 h-7 text-emerald-500" />
              </div>
              <h1 className="text-2xl font-bold mb-3" style={{ color: '#0a1428' }}>
                Solicitação recebida
              </h1>
              <p className="text-sm max-w-xl mx-auto mb-8 leading-relaxed" style={{ color: 'rgba(10,20,40,0.5)' }}>
                Seu cadastro foi enviado com sucesso. Agora você pode acessar o portal do cliente e a
                sua plataforma TurboISP usando os links abaixo.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 flex-wrap">
                <a
                  href={CLIENT_LOGIN_URL}
                  className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg transition hover:opacity-90 shadow-sm"
                  style={{ backgroundColor: '#fca311', color: '#081124' }}
                >
                  Acesse o portal do cliente Aqui
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
                <a
                  href={`https://${portalSubdomain || '{chosen}.turboisp.app'}/admin/auth/login`}
                  className="inline-flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-lg border transition hover:bg-black/5"
                  style={{ borderColor: 'rgba(0,0,0,0.12)', color: 'rgba(10,20,40,0.55)' }}
                >
                  Acesse sua plataforma em clicando Aqui!
                </a>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <div
                  className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-5 border"
                  style={{ backgroundColor: 'rgba(252,163,17,0.08)', borderColor: 'rgba(252,163,17,0.2)' }}
                >
                  {step === 1 ? <User className="w-6 h-6" style={{ color: '#fca311' }} /> : <Building2 className="w-6 h-6" style={{ color: '#fca311' }} />}
                </div>
                <h1 className="text-2xl font-bold mb-2" style={{ color: '#0a1428' }}>
                  {step === 1 ? 'Formulario de Cadastro' : 'DDNS do TurboISP'}
                </h1>
                <p className="text-sm" style={{ color: 'rgba(10,20,40,0.45)' }}>
                  {step === 2 ? 'Escolha o subdomínio da sua operação e defina as credenciais de acesso.' : ''}
                </p>
              </div>

              <form onSubmit={submit} className="space-y-5">
                {step === 1 ? (
                  <>
                    <fieldset className="space-y-4 rounded-2xl border border-black/10 bg-white/55 p-5">
                      <legend className="px-2 text-xs font-semibold uppercase tracking-wider text-[#0a1428]">
                        Dados Pessoais
                      </legend>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input placeholder="Primeiro Nome" value={form.firstName} onChange={(e) => set('firstName', e.target.value)} required className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none" style={inputStyle} {...focusProps} />
                        <input placeholder="Sobrenome" value={form.lastName} onChange={(e) => set('lastName', e.target.value)} required className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none" style={inputStyle} {...focusProps} />
                        <input placeholder="CPF" value={form.cpf} onChange={(e) => set('cpf', formatCpf(e.target.value))} required className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none" style={inputStyle} {...focusProps} />
                        <input placeholder="Telefone" value={form.phone} onChange={(e) => set('phone', e.target.value)} required className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none" style={inputStyle} {...focusProps} />
                      </div>
                    </fieldset>

                    <fieldset className="space-y-4 rounded-2xl border border-black/10 bg-white/55 p-5">
                      <legend className="px-2 text-xs font-semibold uppercase tracking-wider text-[#0a1428]">
                        Empresa
                      </legend>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input
                          placeholder="CNPJ"
                          value={form.cnpj}
                          onChange={(e) => set('cnpj', formatCnpj(e.target.value))}
                          required
                          className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none"
                          style={inputStyle}
                          {...focusProps}
                        />
                        <input
                          type="date"
                          placeholder="Data de Abertura"
                          value={form.openingDate}
                          onChange={(e) => set('openingDate', e.target.value)}
                          required
                          className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none"
                          style={inputStyle}
                          {...focusProps}
                        />
                        <input
                          placeholder="Nome Fantasia"
                          value={form.tradeName}
                          onChange={(e) => set('tradeName', e.target.value)}
                          required
                          className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none"
                          style={inputStyle}
                          {...focusProps}
                        />
                        <input
                          placeholder="Razão Social"
                          value={form.legalName}
                          onChange={(e) => set('legalName', e.target.value)}
                          required
                          className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none"
                          style={inputStyle}
                          {...focusProps}
                        />
                        <input placeholder="Endereço completo" value={form.fullAddress} onChange={(e) => set('fullAddress', e.target.value)} required className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none sm:col-span-2" style={inputStyle} {...focusProps} />
                        <input type="email" placeholder="Email financeiro" value={form.financialEmail} onChange={(e) => set('financialEmail', e.target.value)} required className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none" style={inputStyle} {...focusProps} />
                        <input type="email" placeholder="Email técnico (opcional)" value={form.technicalEmail} onChange={(e) => set('technicalEmail', e.target.value)} className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none" style={inputStyle} {...focusProps} />
                      </div>
                    </fieldset>

                    <label className="flex items-start gap-3 rounded-xl border border-black/10 bg-white/55 p-4 text-sm">
                      <input type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} className="mt-1" />
                      <span style={{ color: '#0a1428' }}>
                        Concordar com os Termos de Serviços
                      </span>
                    </label>

                    <button
                      type="submit"
                      disabled={!acceptedTerms}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition hover:opacity-90 disabled:opacity-40 shadow-sm"
                      style={{ backgroundColor: '#fca311', color: '#081124' }}
                    >
                      Próximo <ArrowRight className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <fieldset className="space-y-4 rounded-2xl border border-black/10 bg-white/55 p-5">
                      <legend className="px-2 text-xs font-semibold uppercase tracking-wider text-[#0a1428]">
                        DDNS do TurboISP
                      </legend>
                      <div className="grid gap-4">
                        <div>
                          <label className="block text-[10px] font-medium uppercase tracking-wider mb-1.5" style={{ color: 'rgba(10,20,40,0.4)' }}>
                            Subdomínio
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              value={form.ddns}
                              onChange={(e) => set('ddns', normalizeDdns(e.target.value))}
                              placeholder="suaempresa"
                              required
                              className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none"
                              style={inputStyle}
                              {...focusProps}
                            />
                            <span className="text-xs whitespace-nowrap" style={{ color: 'rgba(10,20,40,0.55)' }}>
                              .turboisp.app
                            </span>
                          </div>
                          <p className="mt-1 text-[10px]" style={{ color: ddnsStatus === 'taken' ? '#b91c1c' : 'rgba(10,20,40,0.42)' }}>
                            {checkingDdns || ddnsStatus === 'checking'
                              ? 'Verificando disponibilidade...'
                              : ddnsMessage || 'Use apenas letras, números e hífen.'}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <input
                            placeholder="Username"
                            value={form.ddnsUsername}
                            onChange={(e) => set('ddnsUsername', e.target.value)}
                            required
                            className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none"
                            style={inputStyle}
                            {...focusProps}
                          />
                          <div className="relative">
                            <input
                              type={showPassword ? 'text' : 'password'}
                              placeholder="Password"
                              value={form.ddnsPassword}
                              onChange={(e) => set('ddnsPassword', e.target.value)}
                              required
                              className="w-full px-3 py-2.5 pr-9 rounded-lg text-sm focus:outline-none"
                              style={inputStyle}
                              {...focusProps}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword((v) => !v)}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 transition"
                              style={{ color: 'rgba(10,20,40,0.35)' }}
                              tabIndex={-1}
                            >
                              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                          <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Confirm password"
                            value={form.ddnsPasswordConfirm}
                            onChange={(e) => set('ddnsPasswordConfirm', e.target.value)}
                            required
                            className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none sm:col-span-2"
                            style={inputStyle}
                            {...focusProps}
                          />
                        </div>
                      </div>
                    </fieldset>

                    <div className="flex items-start gap-3 rounded-xl border border-black/10 bg-white/55 p-4 text-sm">
                      <ShieldCheck className="mt-0.5 w-4 h-4" style={{ color: '#fca311' }} />
                      <p style={{ color: 'rgba(10,20,40,0.7)' }}>
                        Este envio inclui reCAPTCHA v3, caso a chave pública esteja configurada em
                        <code className="px-1">NEXT_PUBLIC_RECAPTCHA_SITE_KEY</code>.
                      </p>
                    </div>

                    {error && (
                      <div className="p-3.5 rounded-lg border" style={{ backgroundColor: 'rgba(185,28,28,0.05)', borderColor: 'rgba(185,28,28,0.15)' }}>
                        <p className="text-xs" style={{ color: '#b91c1c' }}>{error}</p>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="px-4 py-3 rounded-lg text-sm font-medium border transition hover:bg-black/5"
                        style={{ borderColor: 'rgba(0,0,0,0.12)', color: 'rgba(10,20,40,0.7)' }}
                      >
                        Voltar
                      </button>
                      <button
                        type="submit"
                        disabled={loading || ddnsStatus !== 'available'}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition hover:opacity-90 disabled:opacity-40 shadow-sm"
                        style={{ backgroundColor: '#fca311', color: '#081124' }}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Enviando…
                          </>
                        ) : (
                          <>
                            Submit <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
