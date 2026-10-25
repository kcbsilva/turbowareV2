'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PRICING_TIERS, CURRENCY_SYMBOL, type Region } from '@/lib/pricing'
import { isValidSignupSlug, normalizeSignupSlug, parseSignupSlug } from '@/lib/signup-slug'
import { RESERVED_SLUGS } from '@/lib/slug'
import { useAdminLang } from '@/components/admin/AdminLangProvider'
import { dateLocale, type MsgKey } from '@/lib/admin-i18n'

type Step = 1 | 2 | 3

const REGIONS: Region[] = ['BR', 'CA', 'US', 'GB']
const REGION_KEY: Record<Region, MsgKey> = {
  BR: 'region.BR',
  CA: 'region.CA',
  US: 'region.US',
  GB: 'region.GB',
}

function slugErrorMessage(raw: string, t: (key: MsgKey, vars?: Record<string, string | number>) => string) {
  const slug = normalizeSignupSlug(raw)
  if (!slug) return t('setup.slugChars')
  if (RESERVED_SLUGS.has(slug)) return t('setup.slugReserved', { slug })
  if (slug.length < 3) return t('setup.slugShort')
  if (!isValidSignupSlug(slug)) return t('setup.slugFormat')
  return t('setup.slugRequired')
}

export default function NewClientPage() {
  const router = useRouter()
  const { t, lang } = useAdminLang()
  const locale = dateLocale(lang)
  const [step, setStep] = useState<Step>(1)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    id: string
    licenseKey?: string
    temporaryPassword?: string
    emailed?: boolean
    turboisp?: { slug: string; staffLoginUrl: string; adminUsername: string; adminPassword?: string }
    warnings: string[]
  } | null>(null)

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    notes: '',
    subdomain: '',
    region: 'BR' as Region,
    subscriberTier: '',
    createLicense: true,
    createPortalAccess: true,
    trialDays: 14,
  })

  function handle<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const parsedSlug = parseSignupSlug(form.subdomain)
    if ('error' in parsedSlug) {
      setLoading(false)
      setError(slugErrorMessage(form.subdomain, t))
      setStep(2)
      return
    }
    if (!parsedSlug.slug) {
      setLoading(false)
      setError(t('setup.slugRequired'))
      setStep(2)
      return
    }
    const res = await fetch('/api/admin/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        email: form.email || undefined,
        phone: form.phone || undefined,
        company: form.company || undefined,
        notes: form.notes || undefined,
        subdomain: parsedSlug.slug,
        region: form.region,
        subscriberTier: form.subscriberTier || undefined,
        createLicense: form.createLicense,
        createSubscription: Boolean(form.subscriberTier) || form.createLicense,
        createPortalAccess: form.createPortalAccess,
        trialDays: form.trialDays,
      }),
    })
    const data = await res.json().catch(() => ({}))
    setLoading(false)
    if (!res.ok) {
      setError(data.error || t('setup.createError'))
      return
    }
    setResult(data)
  }

  const inputClass =
    'w-full px-3 py-2 bg-muted border border-border rounded-md text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition'

  const steps = [
    { n: 1 as const, label: t('setup.stepClient') },
    { n: 2 as const, label: t('setup.stepAccess') },
    { n: 3 as const, label: t('setup.stepPlan') },
  ]

  if (result) {
    return (
      <div className="max-w-lg p-6">
        <h1 className="text-lg font-bold text-foreground mb-1">{t('setup.ready')}</h1>
        <p className="text-xs text-muted-foreground mb-4">
          {t('setup.readyBody')}
        </p>
        <div className="bg-card border border-border rounded-lg p-5 space-y-3 text-xs">
          {result.licenseKey && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{t('lic.key')}</p>
              <p className="font-mono text-foreground mt-0.5">{result.licenseKey}</p>
            </div>
          )}
          {result.temporaryPassword && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{t('setup.portalPassword')}</p>
              <p className="font-mono text-foreground mt-0.5">{result.temporaryPassword}</p>
              <p className="text-[10px] text-muted-foreground mt-1">
                {result.emailed ? t('setup.emailed') : t('setup.notEmailed')}
              </p>
            </div>
          )}
          {result.turboisp && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{t('setup.staffLogin')}</p>
              <p className="font-mono text-foreground mt-0.5">
                {result.turboisp.adminUsername} / {result.turboisp.adminPassword ?? 'admin'}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">
                {t('setup.staffHint', { slug: result.turboisp.slug })}
              </p>
              <a href={result.turboisp.staffLoginUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                {result.turboisp.staffLoginUrl}
              </a>
            </div>
          )}
          {result.warnings.length > 0 && (
            <ul className="text-[#C45C3A] space-y-1">
              {result.warnings.map((w) => <li key={w}>{w}</li>)}
            </ul>
          )}
        </div>
        <button
          type="button"
          onClick={() => router.push(`/admin/clients/${result.id}`)}
          className="tw-btn-primary mt-4 w-full py-2 text-xs font-semibold rounded-md"
        >
          {t('setup.openProfile')}
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-lg p-6">
      <Link href="/admin/clients" className="text-xs text-muted-foreground hover:text-foreground mb-2 inline-block">
        ← {t('setup.backClients')}
      </Link>
      <h1 className="text-lg font-bold text-foreground">{t('setup.title')}</h1>
      <p className="text-muted-foreground text-xs mt-0.5 mb-4">
        {t('setup.lead')}
      </p>

      <div className="flex items-center gap-2 mb-5">
        {steps.map((s) => (
          <button
            key={s.n}
            type="button"
            onClick={() => setStep(s.n)}
            className={`flex-1 py-1.5 rounded-md border text-[10px] font-semibold ${step === s.n ? 'border-primary text-primary bg-primary/10' : 'border-border text-muted-foreground'}`}
          >
            {s.n}. {s.label}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="bg-card border border-border rounded-lg p-5 space-y-4">
        {step === 1 && (
          <>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                {t('common.name')} <span className="text-destructive">*</span>
              </label>
              <input value={form.name} onChange={(e) => handle('name', e.target.value)} required placeholder={t('setup.namePlaceholder')} className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">{t('login.email')}</label>
                <input type="email" value={form.email} onChange={(e) => handle('email', e.target.value)} placeholder="billing@isp.com" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">{t('common.phone')}</label>
                <input value={form.phone} onChange={(e) => handle('phone', e.target.value)} placeholder="+1 555 000 0000" className={inputClass} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">{t('vars.client.company')}</label>
              <input value={form.company} onChange={(e) => handle('company', e.target.value)} placeholder={t('setup.companyPlaceholder')} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">{t('common.optionalNotes')}</label>
              <textarea value={form.notes} onChange={(e) => handle('notes', e.target.value)} rows={3} className={`${inputClass} resize-none`} />
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">
                {t('setup.subdomain')} <span className="text-destructive">*</span>
              </label>
              <input
                value={form.subdomain}
                onChange={(e) => handle('subdomain', e.target.value.toLowerCase())}
                placeholder={t('licenses.slugPlaceholder')}
                className={inputClass}
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                {t('setup.subdomainHelp')}
              </p>
            </div>
            <label className="flex items-center gap-2 text-xs text-foreground">
              <input type="checkbox" checked={form.createPortalAccess} onChange={(e) => handle('createPortalAccess', e.target.checked)} />
              {t('setup.portalLogin')}
            </label>
          </>
        )}

        {step === 3 && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">{t('common.region')}</label>
                <select value={form.region} onChange={(e) => handle('region', e.target.value as Region)} className={inputClass}>
                  {REGIONS.map((r) => (
                    <option key={r} value={r}>{t(REGION_KEY[r])}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">{t('setup.trialDays')}</label>
                <input type="number" min={0} max={90} value={form.trialDays} onChange={(e) => handle('trialDays', Number(e.target.value))} className={inputClass} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">{t('setup.package')}</label>
              <select value={form.subscriberTier} onChange={(e) => handle('subscriberTier', e.target.value)} className={inputClass}>
                <option value="">{t('setup.skipPlan')}</option>
                {PRICING_TIERS.filter((tier) => tier.maxSeats !== null).map((tier) => {
                  const price = tier.prices[form.region]
                  const amount = price === 'inquire'
                    ? t('setup.inquire')
                    : `${CURRENCY_SYMBOL[form.region]} ${typeof price === 'number' ? price.toLocaleString(locale) : price}`
                  return (
                    <option key={tier.label} value={tier.label}>
                      {t('setup.tierOption', { n: tier.maxSeats?.toLocaleString(locale) ?? '', price: amount })}
                    </option>
                  )
                })}
              </select>
            </div>
            <label className="flex items-center gap-2 text-xs text-foreground">
              <input type="checkbox" checked={form.createLicense} onChange={(e) => handle('createLicense', e.target.checked)} />
              {t('setup.generateLicense')}
            </label>
          </>
        )}

        {error && (
          <p className="text-xs text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2">{error}</p>
        )}

        <div className="flex gap-2">
          {step > 1 && (
            <button type="button" onClick={() => setStep((s) => (s - 1) as Step)} className="flex-1 py-2 text-xs border border-border rounded-md">
              {t('common.back')}
            </button>
          )}
          {step < 3 ? (
            <button
              type="button"
              onClick={() => {
                if (step === 1 && !form.name.trim()) {
                  setError(t('overview.nameRequired'))
                  return
                }
                setError('')
                setStep((s) => (s + 1) as Step)
              }}
              className="tw-btn-primary flex-1 py-2 text-xs font-semibold rounded-md"
            >
              {t('common.continue')}
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="tw-btn-primary flex-1 py-2 text-xs font-semibold rounded-md disabled:opacity-50"
            >
              {loading ? t('common.creating') : t('setup.create')}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
