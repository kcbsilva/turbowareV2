'use client'

import { useCallback, useEffect, useState } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { useAdminLang } from '@/components/admin/AdminLangProvider'
import type { MsgKey } from '@/lib/admin-i18n'
import {
  PROVIDER_CONTRACT_FIELDS,
  parseTerms,
} from '@/lib/contract-variables'

const inputClass =
  'w-full px-3 py-1.5 bg-muted border border-border rounded-md text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring'

export default function CompanySettingsPage() {
  const { t } = useAdminLang()
  const [form, setForm] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    const res = await fetch('/api/admin/settings/provider', { cache: 'no-store' })
    if (res.ok) {
      const data = await res.json()
      setForm(parseTerms(data.providerTerms))
    } else {
      setError(t('settings.companyLoadError'))
    }
    setLoading(false)
  }, [t])

  useEffect(() => {
    load()
  }, [load])

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      const res = await fetch('/api/admin/settings/provider', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerTerms: form }),
      })
      if (res.ok) {
        const data = await res.json()
        setForm(parseTerms(data.providerTerms))
        setSaved(true)
      } else {
        setError(t('settings.companySaveError'))
      }
    } catch {
      setError(t('settings.companySaveError'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl p-4">
      <form onSubmit={save} className="rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
          <div>
            <h1 className="text-[10px] font-semibold uppercase tracking-wider text-foreground">
              {t('settings.company')}
            </h1>
            <p className="mt-1 text-[11px] text-muted-foreground">{t('settings.companyHint')}</p>
          </div>
          <button
            type="submit"
            disabled={saving || loading}
            className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
            {saving ? t('templates.saving') : t('templates.save')}
          </button>
        </div>
        <div className="space-y-3 px-4 py-3">
          {loading ? (
            <p className="text-xs text-muted-foreground">{t('templates.saving')}</p>
          ) : (
            PROVIDER_CONTRACT_FIELDS.map((field) => (
              <div key={field.key}>
                <label className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground">
                  {t(field.labelKey as MsgKey)}
                  <span className="ml-1 font-mono normal-case tracking-normal text-muted-foreground/70">
                    {`{${field.key}}`}
                  </span>
                </label>
                {'multiline' in field && field.multiline ? (
                  <textarea
                    rows={3}
                    value={form[field.key] ?? ''}
                    onChange={(e) => setForm((current) => ({ ...current, [field.key]: e.target.value }))}
                    className={`${inputClass} resize-y`}
                  />
                ) : (
                  <input
                    value={form[field.key] ?? ''}
                    onChange={(e) => setForm((current) => ({ ...current, [field.key]: e.target.value }))}
                    className={inputClass}
                  />
                )}
              </div>
            ))
          )}
          {error && <p className="text-xs text-destructive">{error}</p>}
          {saved && <p className="text-xs text-foreground">{t('settings.companySaved')}</p>}
        </div>
      </form>
    </div>
  )
}
