'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import {
  defaultCurrencyForCountry,
  SIGNUP_COUNTRIES,
  type SignupCountryCode,
} from '@/lib/signup-countries'
import { isValidSignupSlug, normalizeSignupSlug } from '@/lib/signup-slug'
import { SiteBackdrop } from '../site/_components/SiteBackdrop'
import { RegisterChrome } from './_components/RegisterChrome'
import {
  API_ERROR_KEYS,
  localeLabel,
  SIGNUP_LOCALES,
  t,
  type SignupLocale,
} from './signup-translations'

type SlugStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid'

export default function RegisterPage() {
  const router = useRouter()
  const [locale, setLocale] = useState<SignupLocale>('pt')
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [adminUsername, setAdminUsername] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [countryCode, setCountryCode] = useState<SignupCountryCode>('BR')
  const [currency, setCurrency] = useState('BRL')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [slugStatus, setSlugStatus] = useState<SlugStatus>('idle')
  const [slugMessage, setSlugMessage] = useState('')

  const currencies = useMemo(() => {
    const seen = new Set<string>()
    return SIGNUP_COUNTRIES.filter((c) => {
      if (seen.has(c.currency)) return false
      seen.add(c.currency)
      return true
    }).map((c) => ({ value: c.currency, label: `${c.currency} — ${c.name}` }))
  }, [])

  const translateApiError = (msg: string) => {
    const key = API_ERROR_KEYS[msg.toLowerCase()]
    return key ? t(locale, key) : msg
  }

  useEffect(() => {
    const clean = normalizeSignupSlug(slug)
    if (!clean) {
      setSlugStatus('idle')
      setSlugMessage('')
      return
    }
    if (!isValidSignupSlug(clean)) {
      setSlugStatus('invalid')
      setSlugMessage(t(locale, 'signup_slug_rule'))
      return
    }

    setSlugStatus('checking')
    setSlugMessage('')
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/signup/check-slug?slug=${encodeURIComponent(clean)}`,
        )
        const data = (await res.json()) as {
          slug: string
          available: boolean
          reason?: string
          error?: string
        }
        if (normalizeSignupSlug(slug) !== clean) return

        if (!res.ok) {
          setSlugStatus('invalid')
          setSlugMessage(
            data.error ? translateApiError(data.error) : t(locale, 'signup_slug_check_failed'),
          )
          return
        }

        if (data.available) {
          setSlugStatus('available')
          setSlugMessage(t(locale, 'signup_slug_available'))
        } else if (data.reason === 'slug already in use') {
          setSlugStatus('taken')
          setSlugMessage(t(locale, 'signup_slug_taken'))
        } else {
          setSlugStatus('invalid')
          setSlugMessage(t(locale, 'signup_slug_invalid'))
        }
      } catch {
        if (normalizeSignupSlug(slug) !== clean) return
        setSlugStatus('invalid')
        setSlugMessage(t(locale, 'signup_slug_check_failed'))
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [slug, locale])

  const passwordsMatch = adminPassword === confirmPassword
  const passwordMismatch = confirmPassword.length > 0 && !passwordsMatch
  const canSubmit =
    slugStatus === 'available' &&
    !loading &&
    adminUsername.trim().length > 0 &&
    passwordsMatch &&
    adminPassword.length >= 8

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    if (adminPassword !== confirmPassword) {
      setError(t(locale, 'signup_password_mismatch'))
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          slug: normalizeSignupSlug(slug),
          adminUsername: adminUsername.trim(),
          adminEmail: adminEmail.trim(),
          adminPassword,
          countryCode: countryCode.trim().toUpperCase(),
          currency: currency.trim().toUpperCase(),
        }),
      })
      const data = (await res.json()) as { staffLoginUrl?: string; error?: string }
      if (!res.ok) {
        setError(translateApiError(data.error ?? t(locale, 'signup_failed')))
        return
      }
      if (data.staffLoginUrl) {
        window.location.href = data.staffLoginUrl
        return
      }
      router.push('/client/login')
    } catch {
      setError(t(locale, 'signup_failed'))
    } finally {
      setLoading(false)
    }
  }

  function handleCountryChange(code: SignupCountryCode) {
    setCountryCode(code)
    setCurrency(defaultCurrencyForCountry(code))
  }

  return (
    <div className="relative min-h-screen flex flex-col">
      <SiteBackdrop />
      <RegisterChrome />

      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-10 sm:py-16">
        <div className="reg-signup-card w-full max-w-lg p-8 rounded-2xl">
          <div className="flex justify-end mb-2">
            <label className="sr-only" htmlFor="signup-language">
              {t(locale, 'signup_language')}
            </label>
            <select
              id="signup-language"
              value={locale}
              onChange={(e) => setLocale(e.target.value as SignupLocale)}
              className="reg-input w-auto text-xs py-1 px-2 cursor-pointer"
            >
              {SIGNUP_LOCALES.map((code) => (
                <option key={code} value={code} className="text-gray-900">
                  {localeLabel(code)}
                </option>
              ))}
            </select>
          </div>

          <div className="text-center mb-6">
            <h1 className="text-xl font-semibold text-white">{t(locale, 'signup_title')}</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <Field
              label={t(locale, 'signup_company_name')}
              value={name}
              onChange={setName}
              required
            />
            <SlugField
              label={t(locale, 'signup_url_slug')}
              placeholder={t(locale, 'signup_slug_placeholder')}
              checkingLabel={t(locale, 'signup_slug_checking')}
              value={slug}
              onChange={(v) => setSlug(v.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              status={slugStatus}
              message={slugMessage}
              required
            />
            <Field
              label={t(locale, 'signup_admin_username')}
              value={adminUsername}
              onChange={(v) => setAdminUsername(v.replace(/\s/g, ''))}
              placeholder={t(locale, 'signup_admin_username_placeholder')}
              required
            />
            <Field
              label={t(locale, 'signup_admin_email')}
              type="email"
              value={adminEmail}
              onChange={setAdminEmail}
              required
            />
            <Field
              label={t(locale, 'signup_admin_password')}
              type="password"
              value={adminPassword}
              onChange={setAdminPassword}
              required
            />
            <Field
              label={t(locale, 'signup_confirm_password')}
              type="password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              required
            />
            {passwordMismatch && (
              <p className="text-sm text-red-300">{t(locale, 'signup_password_mismatch')}</p>
            )}
            <div className="grid grid-cols-2 gap-3">
              <SelectField
                label={t(locale, 'signup_country')}
                value={countryCode}
                onChange={(v) => handleCountryChange(v as SignupCountryCode)}
                required
              >
                {SIGNUP_COUNTRIES.map((opt) => (
                  <option key={opt.code} value={opt.code}>
                    {opt.name}
                  </option>
                ))}
              </SelectField>
              <SelectField
                label={t(locale, 'signup_currency')}
                value={currency}
                onChange={setCurrency}
                required
              >
                {currencies.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </SelectField>
            </div>
            {error && <p className="text-sm text-red-300">{error}</p>}
            <button
              type="submit"
              disabled={!canSubmit}
              className="turbo-btn-primary w-full h-11 text-sm font-medium rounded-md disabled:opacity-50"
            >
              {loading ? t(locale, 'signup_creating') : t(locale, 'signup_create_tenant')}
            </button>
          </form>

          <p className="text-center text-sm text-white/55 mt-6">
            {t(locale, 'signup_already_have')}{' '}
            <Link href="/client/login" className="text-[#fca311] hover:underline font-medium">
              {t(locale, 'signup_sign_in')}
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
  required?: boolean
}) {
  return (
    <div>
      <label className="reg-label">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="reg-input"
      />
    </div>
  )
}

function SelectField({
  label,
  value,
  onChange,
  required,
  children,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  required?: boolean
  children: ReactNode
}) {
  return (
    <div>
      <label className="reg-label">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="reg-input cursor-pointer"
      >
        {children}
      </select>
    </div>
  )
}

function SlugField({
  label,
  placeholder,
  checkingLabel,
  value,
  onChange,
  status,
  message,
  required,
}: {
  label: string
  placeholder: string
  checkingLabel: string
  value: string
  onChange: (v: string) => void
  status: SlugStatus
  message: string
  required?: boolean
}) {
  const messageClass =
    status === 'available'
      ? 'text-emerald-400'
      : status === 'checking'
        ? 'text-white/45'
        : status === 'idle'
          ? 'text-white/35'
          : 'text-red-300'

  const domain = process.env.NEXT_PUBLIC_TURBOISP_APP_URL?.replace(/^https?:\/\//, '') || 'turboisp.app'

  return (
    <div>
      <label htmlFor="signup-slug" className="reg-label">
        {label}
      </label>
      <div className="flex rounded-md overflow-hidden border border-white/12 bg-white/5 focus-within:ring-1 focus-within:ring-[#fca311]/60">
        <span className="inline-flex items-center px-2 sm:px-3 bg-white/5 text-white/45 text-xs sm:text-sm border-r border-white/10 shrink-0">
          https://{domain}/
        </span>
        <input
          id="signup-slug"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className="flex-1 min-w-0 px-3 py-2 bg-transparent text-white text-sm placeholder-white/25 focus:outline-none"
        />
      </div>
      {(message || status === 'checking') && (
        <p className={cn('text-xs mt-1', messageClass)}>
          {status === 'checking' ? checkingLabel : message}
        </p>
      )}
    </div>
  )
}
