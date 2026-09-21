'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PRICING_TIERS, REGION_LABELS, CURRENCY_SYMBOL, type Region } from '@/lib/pricing'
import { parseSignupSlug } from '@/lib/signup-slug'

type Step = 1 | 2 | 3

const REGIONS: Region[] = ['BR', 'CA', 'US', 'GB']

export default function NewClientPage() {
  const router = useRouter()
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
    provisionTurboISP: false,
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
      setError(parsedSlug.error)
      setStep(2)
      return
    }
    if (form.provisionTurboISP && !parsedSlug.slug) {
      setLoading(false)
      setError('Subdomain is required to provision a TurboISP tenant')
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
        subdomain: form.subdomain || undefined,
        region: form.region,
        subscriberTier: form.subscriberTier || undefined,
        createLicense: form.createLicense,
        createSubscription: Boolean(form.subscriberTier) || form.createLicense,
        createPortalAccess: form.createPortalAccess,
        provisionTurboISP: form.provisionTurboISP,
        trialDays: form.trialDays,
      }),
    })
    const data = await res.json().catch(() => ({}))
    setLoading(false)
    if (!res.ok) {
      setError(data.error || 'Failed to create tenant.')
      return
    }
    setResult(data)
  }

  const inputClass =
    'w-full px-3 py-2 bg-muted border border-border rounded-md text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition'

  const steps = [
    { n: 1, label: 'Client' },
    { n: 2, label: 'Tenant & access' },
    { n: 3, label: 'Product & license' },
  ] as const

  if (result) {
    return (
      <div className="max-w-lg p-6">
        <h1 className="text-lg font-bold text-foreground mb-1">Tenant ready</h1>
        <p className="text-xs text-muted-foreground mb-4">
          Client, subscription, and license were created in one step.
        </p>
        <div className="bg-card border border-border rounded-lg p-5 space-y-3 text-xs">
          {result.licenseKey && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">License key</p>
              <p className="font-mono text-foreground mt-0.5">{result.licenseKey}</p>
            </div>
          )}
          {result.temporaryPassword && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Portal temporary password</p>
              <p className="font-mono text-foreground mt-0.5">{result.temporaryPassword}</p>
              <p className="text-[10px] text-muted-foreground mt-1">
                {result.emailed ? 'Emailed to the client. They must change it on first login.' : 'Copy and share securely — email was not sent.'}
              </p>
            </div>
          )}
          {result.turboisp && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">TurboISP staff login</p>
              <p className="font-mono text-foreground mt-0.5">
                {result.turboisp.adminUsername} / {result.turboisp.adminPassword ?? 'admin'}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">
                Change this after first login. Tenant slug: {result.turboisp.slug}
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
          Open client profile
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-lg p-6">
      <Link href="/admin/clients" className="text-xs text-muted-foreground hover:text-foreground mb-2 inline-block">
        ← Back to clients
      </Link>
      <h1 className="text-lg font-bold text-foreground">Set up new tenant</h1>
      <p className="text-muted-foreground text-xs mt-0.5 mb-4">
        Create the billing client, optional subdomain, plan, and license in one flow.
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
                Name <span className="text-destructive">*</span>
              </label>
              <input value={form.name} onChange={(e) => handle('name', e.target.value)} required placeholder="Contact or alias" className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Email</label>
                <input type="email" value={form.email} onChange={(e) => handle('email', e.target.value)} placeholder="billing@isp.com" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Phone</label>
                <input value={form.phone} onChange={(e) => handle('phone', e.target.value)} placeholder="+1 555 000 0000" className={inputClass} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">Company</label>
              <input value={form.company} onChange={(e) => handle('company', e.target.value)} placeholder="ISP name" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">Internal notes</label>
              <textarea value={form.notes} onChange={(e) => handle('notes', e.target.value)} rows={3} className={`${inputClass} resize-none`} />
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">Subdomain / slug</label>
              <input
                value={form.subdomain}
                onChange={(e) => handle('subdomain', e.target.value.toLowerCase())}
                placeholder="acme"
                className={inputClass}
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                Optional unless you provision TurboISP. Use 3+ lowercase letters, numbers, or hyphens
                (e.g. <span className="font-mono">northnet</span>). Reserved: www, api, admin, app, portal,
                billing, support, turboisp, turboware, mail, smtp, ftp, dev, staging, beta.
              </p>
            </div>
            <label className="flex items-center gap-2 text-xs text-foreground">
              <input type="checkbox" checked={form.createPortalAccess} onChange={(e) => handle('createPortalAccess', e.target.checked)} />
              Create client-portal login (temp password, must change on first login)
            </label>
            <label className="flex items-center gap-2 text-xs text-foreground">
              <input type="checkbox" checked={form.provisionTurboISP} onChange={(e) => handle('provisionTurboISP', e.target.checked)} />
              Provision TurboISP tenant (requires subdomain + TURBOISP_DATABASE_URL). Staff login starts as admin / admin.
            </label>
          </>
        )}

        {step === 3 && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Region</label>
                <select value={form.region} onChange={(e) => handle('region', e.target.value as Region)} className={inputClass}>
                  {REGIONS.map((r) => (
                    <option key={r} value={r}>{REGION_LABELS[r]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Trial days</label>
                <input type="number" min={0} max={90} value={form.trialDays} onChange={(e) => handle('trialDays', Number(e.target.value))} className={inputClass} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1.5">TurboISP package</label>
              <select value={form.subscriberTier} onChange={(e) => handle('subscriberTier', e.target.value)} className={inputClass}>
                <option value="">Skip plan for now</option>
                {PRICING_TIERS.filter((t) => t.maxSeats !== null).map((tier) => {
                  const price = tier.prices[form.region]
                  return (
                    <option key={tier.label} value={tier.label}>
                      {tier.maxSeats?.toLocaleString()} clients — {CURRENCY_SYMBOL[form.region]} {price === 'inquire' ? 'Inquire' : price}/mo
                    </option>
                  )
                })}
              </select>
            </div>
            <label className="flex items-center gap-2 text-xs text-foreground">
              <input type="checkbox" checked={form.createLicense} onChange={(e) => handle('createLicense', e.target.checked)} />
              Generate license key and attach it to the subscription
            </label>
          </>
        )}

        {error && (
          <p className="text-xs text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2">{error}</p>
        )}

        <div className="flex gap-2">
          {step > 1 && (
            <button type="button" onClick={() => setStep((s) => (s - 1) as Step)} className="flex-1 py-2 text-xs border border-border rounded-md">
              Back
            </button>
          )}
          {step < 3 ? (
            <button
              type="button"
              onClick={() => {
                if (step === 1 && !form.name.trim()) {
                  setError('Name is required')
                  return
                }
                setError('')
                setStep((s) => (s + 1) as Step)
              }}
              className="tw-btn-primary flex-1 py-2 text-xs font-semibold rounded-md"
            >
              Continue
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="tw-btn-primary flex-1 py-2 text-xs font-semibold rounded-md disabled:opacity-50"
            >
              {loading ? 'Creating…' : 'Create tenant'}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
