'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { LicenseStatus } from '@prisma/client'
import { useAdminLang } from '@/components/admin/AdminLangProvider'
import { dateLocale, type MsgKey } from '@/lib/admin-i18n'
import { badge } from '@/lib/badges'

type LicenseActionTarget = {
  id: string
  clientId: string | null
  client: { id: string; name: string } | null
}

type Props = {
  license: LicenseActionTarget
  effectiveStatus: LicenseStatus
  clients: { id: string; name: string; company: string | null }[]
}

const STATUS_KEY: Record<LicenseStatus, MsgKey> = {
  ACTIVE: 'licenses.status.active',
  SUSPENDED: 'licenses.status.suspended',
  REVOKED: 'lic.revoked',
  EXPIRED: 'lic.expired',
}

const statusStyles: Record<LicenseStatus, string> = {
  ACTIVE: badge.teal,
  SUSPENDED: badge.peach,
  REVOKED: badge.coral,
  EXPIRED: badge.mute,
}

export function LicenseActions({ license, effectiveStatus, clients }: Props) {
  const router = useRouter()
  const { t } = useAdminLang()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [selectedClientId, setSelectedClientId] = useState(license.clientId || '')
  const [canManage, setCanManage] = useState(false)

  useEffect(() => {
    fetch('/api/admin/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setCanManage(Boolean(d?.canManage)))
      .catch(() => undefined)
  }, [])

  async function updateStatus(status: LicenseStatus) {
    setLoading(status)
    setError('')
    const res = await fetch(`/api/admin/licenses/${license.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setLoading(null)
    if (res.ok) router.refresh()
    else setError(t('lic.updateError'))
  }

  async function assignClient() {
    setLoading('client')
    setError('')
    const res = await fetch(`/api/admin/licenses/${license.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId: selectedClientId || null }),
    })
    setLoading(null)
    if (res.ok) router.refresh()
    else setError(t('lic.assignError'))
  }

  async function deleteLicense() {
    if (!confirm(t('lic.deleteConfirm'))) return
    setLoading('DELETE')
    const res = await fetch(`/api/admin/licenses/${license.id}`, { method: 'DELETE' })
    if (res.ok) router.push('/admin/licenses')
    else { setLoading(null); setError(t('lic.deleteError')) }
  }

  const hasClientChanged = selectedClientId !== (license.clientId || '')

  return (
    <div className="space-y-3">
      {/* Client assignment */}
      <div className="bg-card border border-border rounded-lg">
        <div className="px-4 py-2.5 border-b border-border">
          <h2 className="text-[10px] font-semibold text-foreground uppercase tracking-wider">{t('lic.assigned')}</h2>
        </div>
        <div className="px-4 py-3 flex items-center gap-3">
          <select
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            className="flex-1 px-3 py-1.5 bg-muted border border-border rounded-md text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">— {t('common.unassigned')} —</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}{c.company ? ` (${c.company})` : ''}
              </option>
            ))}
          </select>
          <button
            onClick={assignClient}
            disabled={!hasClientChanged || !!loading}
            className="tw-btn-primary px-3 py-1.5 text-xs font-medium rounded-md transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading === 'client' ? t('templates.saving') : t('templates.save')}
          </button>
          {license.client && (
            <a href={`/admin/clients/${license.client.id}`} className="text-xs text-primary hover:opacity-80">
              {t('lic.viewClient')} →
            </a>
          )}
        </div>
      </div>

      {/* Status actions */}
      <div className="bg-card border border-border rounded-lg">
        <div className="px-4 py-2.5 border-b border-border">
          <h2 className="text-[10px] font-semibold text-foreground uppercase tracking-wider">{t('common.actions')}</h2>
        </div>
        <div className="px-4 py-3 flex flex-wrap gap-2">
          {effectiveStatus !== 'ACTIVE' && effectiveStatus !== 'EXPIRED' && (
            <button
              onClick={() => updateStatus('ACTIVE')}
              disabled={!!loading}
              className="px-3 py-1.5 bg-foreground hover:opacity-90 disabled:opacity-50 text-background text-xs font-medium rounded-md transition"
            >
              {loading === 'ACTIVE' ? t('lic.activating') : t('lic.setActive')}
            </button>
          )}
          {effectiveStatus === 'ACTIVE' && (
            <button
              onClick={() => updateStatus('SUSPENDED')}
              disabled={!!loading}
              className="px-3 py-1.5 bg-[#C45C3A] hover:brightness-105 disabled:opacity-50 text-white text-xs font-medium rounded-md transition"
            >
              {loading === 'SUSPENDED' ? t('lic.suspending') : t('lic.suspend')}
            </button>
          )}
          {canManage && effectiveStatus !== 'REVOKED' && (
            <button
              onClick={() => updateStatus('REVOKED')}
              disabled={!!loading}
              className="px-3 py-1.5 bg-[#E85D4C] hover:brightness-105 disabled:opacity-50 text-white text-xs font-medium rounded-md transition"
            >
              {loading === 'REVOKED' ? t('lic.revoking') : t('lic.revoke')}
            </button>
          )}
          {canManage && (
          <button
            onClick={deleteLicense}
            disabled={!!loading}
            className="px-3 py-1.5 border border-destructive/50 text-destructive hover:bg-destructive/10 disabled:opacity-50 text-xs font-medium rounded-md transition ml-auto"
          >
            {loading === 'DELETE' ? t('common.deleting') : t('lic.delete')}
          </button>
          )}
        </div>
        {error && (
          <div className="px-4 pb-3">
            <p className="text-xs text-destructive">{error}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export type LicenseDetailData = {
  id: string
  key: string
  product: string
  status: LicenseStatus
  notes: string | null
  maxSeats: number
  expiresAt: string | null
  createdAt: string
  clientId: string | null
  client: { id: string; name: string } | null
  activations: {
    id: string
    hardwareId: string
    label: string | null
    activatedAt: string
    lastSeenAt: string
  }[]
}

export function LicenseDetail({
  license,
  effective,
  clients,
}: {
  license: LicenseDetailData
  effective: LicenseStatus
  clients: { id: string; name: string; company: string | null }[]
}) {
  const { t, lang } = useAdminLang()
  const locale = dateLocale(lang)

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <Link href="/admin/licenses" className="text-xs text-muted-foreground hover:text-foreground mb-2 inline-block">
          ← {t('lic.back')}
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-base font-bold text-foreground font-mono">{license.key}</h1>
            <p className="text-muted-foreground text-xs mt-0.5">{license.product}</p>
          </div>
          <span className={statusStyles[effective]}>
            {t(STATUS_KEY[effective])}
          </span>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg mb-4">
        <div className="px-4 py-2.5 border-b border-border">
          <h2 className="text-[10px] font-semibold text-foreground uppercase tracking-wider">{t('lic.details')}</h2>
        </div>
        <dl className="px-4 py-3 grid grid-cols-2 gap-3">
          <div>
            <dt className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">{t('licenses.product')}</dt>
            <dd className="text-xs text-foreground">{license.product}</dd>
          </div>
          <div>
            <dt className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">{t('licenses.status')}</dt>
            <dd className="text-xs text-foreground">{t(STATUS_KEY[license.status])}</dd>
          </div>
          <div>
            <dt className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">{t('common.seats')}</dt>
            <dd className="text-xs text-foreground">{t('lic.seatsUsed', { n: license.activations.length.toLocaleString(locale), total: license.maxSeats.toLocaleString(locale) })}</dd>
          </div>
          <div>
            <dt className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">{t('billing.expires')}</dt>
            <dd className="text-xs text-foreground">
              {license.expiresAt ? new Date(license.expiresAt).toLocaleDateString(locale) : t('common.never')}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">{t('profile.client')}</dt>
            <dd className="text-xs text-foreground">
              {license.client
                ? <Link href={`/admin/clients/${license.client.id}`} className="text-primary hover:underline">{license.client.name}</Link>
                : <span className="text-muted-foreground/50">{t('common.unassigned')}</span>}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">{t('common.created')}</dt>
            <dd className="text-xs text-foreground">{new Date(license.createdAt).toLocaleString(locale)}</dd>
          </div>
          {license.notes && (
            <div className="col-span-2">
              <dt className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">{t('contracts.notes')}</dt>
              <dd className="text-xs text-foreground">{license.notes}</dd>
            </div>
          )}
        </dl>
      </div>

      <LicenseActions license={license} effectiveStatus={effective} clients={clients} />

      <div className="bg-card border border-border rounded-lg mt-4">
        <div className="px-4 py-2.5 border-b border-border">
          <h2 className="text-[10px] font-semibold text-foreground uppercase tracking-wider">
            {t('lic.activations', { n: license.activations.length.toLocaleString(locale) })}
          </h2>
        </div>
        {license.activations.length === 0 ? (
          <div className="px-4 py-6 text-center text-muted-foreground text-xs">{t('lic.noActivations')}</div>
        ) : (
          <div className="divide-y divide-border">
            {license.activations.map((activation) => (
              <div key={activation.id} className="px-4 py-3 flex items-start justify-between">
                <div>
                  <p className="font-mono text-[10px] text-foreground">{activation.hardwareId}</p>
                  {activation.label && <p className="text-[10px] text-muted-foreground mt-0.5">{activation.label}</p>}
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground">{t('lic.activatedOn', { label: new Date(activation.activatedAt).toLocaleDateString(locale) })}</p>
                  <p className="text-[10px] text-muted-foreground/60">{t('lic.lastSeen', { label: new Date(activation.lastSeenAt).toLocaleDateString(locale) })}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
