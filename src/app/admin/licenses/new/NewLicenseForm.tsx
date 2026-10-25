'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAdminLang } from '@/components/admin/AdminLangProvider'

type Client = { id: string; name: string; company: string | null }

export function NewLicenseForm({
  clients,
  defaultClientId,
}: {
  clients: Client[]
  defaultClientId: string
}) {
  const router = useRouter()
  const { t } = useAdminLang()
  const [form, setForm] = useState({
    product: '',
    notes: '',
    maxSeats: '1',
    expiresAt: '',
    clientId: defaultClientId,
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/admin/licenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product: form.product,
        notes: form.notes,
        maxSeats: parseInt(form.maxSeats),
        expiresAt: form.expiresAt || null,
        clientId: form.clientId || null,
      }),
    })

    setLoading(false)

    if (res.ok) {
      const data = await res.json()
      router.push(`/admin/licenses/${data.id}`)
    } else {
      const data = await res.json()
      setError(data.error || t('lic.createError'))
    }
  }

  const inputClass =
    'w-full px-3 py-2 bg-muted border border-border rounded-md text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition'

  return (
    <div className="max-w-md">
      <div className="mb-6">
        <Link href="/admin/licenses" className="text-xs text-muted-foreground hover:text-foreground mb-2 inline-block">
          ← {t('lic.back')}
        </Link>
        <h1 className="text-lg font-bold text-foreground">{t('lic.generateTitle')}</h1>
        <p className="text-muted-foreground text-xs mt-0.5">{t('lic.generateHint')}</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-5 space-y-4">
        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">
            {t('licenses.product')} <span className="text-destructive">*</span>
          </label>
          <input
            name="product"
            value={form.product}
            onChange={handleChange}
            required
            placeholder={t('lic.productPlaceholder')}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">
            {t('lic.assignTo')} <span className="text-muted-foreground">{t('common.optional')}</span>
          </label>
          <select name="clientId" value={form.clientId} onChange={handleChange} className={inputClass}>
            <option value="">— {t('lic.noClient')} —</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}{c.company ? ` (${c.company})` : ''}
              </option>
            ))}
          </select>
          {clients.length === 0 && (
            <p className="text-[10px] text-muted-foreground mt-1">
              {t('lic.noClients')}{' '}
              <Link href="/admin/clients/new" className="text-primary hover:underline">
                {t('lic.createOne')}
              </Link>
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">{t('lic.maxSeats')}</label>
          <input
            name="maxSeats"
            type="number"
            min="1"
            value={form.maxSeats}
            onChange={handleChange}
            className={inputClass}
          />
          <p className="text-[10px] text-muted-foreground mt-1">{t('lic.maxSeatsHint')}</p>
        </div>

        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">
            {t('lic.expires')} <span className="text-muted-foreground">{t('common.optional')}</span>
          </label>
          <input
            name="expiresAt"
            type="date"
            value={form.expiresAt}
            onChange={handleChange}
            className={inputClass}
          />
          <p className="text-[10px] text-muted-foreground mt-1">{t('lic.expiresHint')}</p>
        </div>

        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">
            {t('contracts.notes')} <span className="text-muted-foreground">{t('common.optional')}</span>
          </label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            rows={3}
            placeholder={t('lic.notesPlaceholder')}
            className={`${inputClass} resize-none`}
          />
        </div>

        {error && (
          <p className="text-xs text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="tw-btn-primary w-full py-2 text-xs font-semibold rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? t('lic.generating') : t('lic.generate')}
        </button>
      </form>
    </div>
  )
}
