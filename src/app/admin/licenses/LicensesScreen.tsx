'use client'

import Link from 'next/link'
import type { LicenseStatus } from '@prisma/client'
import { useAdminLang } from '@/components/admin/AdminLangProvider'
import { dateLocale, type MsgKey } from '@/lib/admin-i18n'
import { badge } from '@/lib/badges'

const statusStyles: Record<LicenseStatus, string> = {
  ACTIVE: badge.teal,
  SUSPENDED: badge.peach,
  REVOKED: badge.coral,
  EXPIRED: badge.mute,
}

const STATUS_KEY: Record<LicenseStatus, MsgKey> = {
  ACTIVE: 'licenses.status.active',
  SUSPENDED: 'licenses.status.suspended',
  REVOKED: 'lic.revoked',
  EXPIRED: 'lic.expired',
}

const STATUSES: LicenseStatus[] = ['ACTIVE', 'SUSPENDED', 'REVOKED', 'EXPIRED']

export type LicenseRow = {
  id: string
  key: string
  product: string
  status: LicenseStatus
  activations: number
  maxSeats: number
  expiresAt: string | null
  createdAt: string
}

export function LicensesScreen({
  licenses,
  search = '',
  status = '',
}: {
  licenses: LicenseRow[]
  search?: string
  status?: string
}) {
  const { t, lang } = useAdminLang()
  const locale = dateLocale(lang)

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold text-foreground">{t('title.licenses')}</h1>
          <p className="text-muted-foreground text-xs mt-0.5">{t('lic.count', { n: licenses.length.toLocaleString(locale) })}</p>
        </div>
        <Link
          href="/admin/licenses/new"
          className="tw-btn-primary px-3 py-1.5 text-xs font-semibold rounded-md transition"
        >
          + {t('lic.generate')}
        </Link>
      </div>

      <form method="GET" className="flex gap-2 mb-4">
        <input
          name="search"
          defaultValue={search}
          placeholder={t('lic.search')}
          className="flex-1 px-3 py-1.5 bg-muted border border-border rounded-md text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <select
          name="status"
          defaultValue={status}
          className="px-3 py-1.5 bg-muted border border-border rounded-md text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">{t('common.allStatuses')}</option>
          {STATUSES.map((code) => (
            <option key={code} value={code}>{t(STATUS_KEY[code])}</option>
          ))}
        </select>
        <button
          type="submit"
          className="px-3 py-1.5 bg-muted hover:bg-secondary border border-border text-foreground text-xs font-medium rounded-md transition"
        >
          {t('common.filter')}
        </button>
        {(search || status) && (
          <Link
            href="/admin/licenses"
            className="px-3 py-1.5 text-muted-foreground hover:text-foreground text-xs font-medium rounded-md transition"
          >
            {t('common.clear')}
          </Link>
        )}
      </form>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {licenses.length === 0 ? (
          <div className="px-6 py-12 text-center text-muted-foreground text-xs">
            {t('lic.empty')}
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-left text-[10px] text-muted-foreground uppercase tracking-wider">
                <th className="px-4 py-2.5 font-medium">{t('lic.key')}</th>
                <th className="px-4 py-2.5 font-medium">{t('licenses.product')}</th>
                <th className="px-4 py-2.5 font-medium">{t('licenses.status')}</th>
                <th className="px-4 py-2.5 font-medium">{t('common.seats')}</th>
                <th className="px-4 py-2.5 font-medium">{t('billing.expires')}</th>
                <th className="px-4 py-2.5 font-medium">{t('common.created')}</th>
                <th className="px-4 py-2.5 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {licenses.map((license) => (
                <tr key={license.id} className="hover:bg-muted/40 transition">
                  <td className="px-4 py-3 font-mono text-foreground">{license.key}</td>
                  <td className="px-4 py-3 text-foreground">{license.product}</td>
                  <td className="px-4 py-3">
                    <span className={statusStyles[license.status]}>
                      {t(STATUS_KEY[license.status])}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-foreground">
                    {license.activations.toLocaleString(locale)}/{license.maxSeats.toLocaleString(locale)}
                  </td>
                  <td className="px-4 py-3 text-foreground">
                    {license.expiresAt
                      ? new Date(license.expiresAt).toLocaleDateString(locale)
                      : <span className="text-muted-foreground">{t('common.never')}</span>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(license.createdAt).toLocaleDateString(locale)}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/licenses/${license.id}`}
                      className="text-primary hover:opacity-80 font-medium"
                    >
                      {t('common.manage')} →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
