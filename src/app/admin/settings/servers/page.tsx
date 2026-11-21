'use client'

import { useCallback, useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { useAdminLang } from '@/components/admin/AdminLangProvider'
import { dateLocale } from '@/lib/admin-i18n'
import { gitState, SERVERS, type ServerReading } from '@/lib/server-snapshots'

export default function ServersSettingsPage() {
  const { lang, t } = useAdminLang()
  const [readings, setReadings] = useState<ServerReading[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const refresh = useCallback(async (signal?: AbortSignal) => {
    setLoading(true)
    setError(false)
    try {
      const response = await fetch('/api/admin/settings/servers', { cache: 'no-store', signal })
      if (!response.ok) throw new Error('Server reports request failed')
      setReadings(await response.json())
    } catch {
      if (!signal?.aborted) setError(true)
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    void refresh(controller.signal)
    return () => controller.abort()
  }, [refresh])

  const locale = dateLocale(lang)
  const number = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 })
  const percent = new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 1 })
  const gib = (bytes: number) => number.format(bytes / 1024 ** 3)
  const unit = (value: number, unit: string) =>
    new Intl.NumberFormat(locale, { style: 'unit', unit, unitDisplay: 'short' }).format(value)

  return (
    <div className="mx-auto max-w-5xl space-y-4 p-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-sm font-semibold">{t('servers.title')}</h1>
        <button
          type="button"
          disabled={loading}
          onClick={() => void refresh()}
          className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-xs hover:bg-muted disabled:opacity-50"
        >
          <RefreshCw aria-hidden="true" className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          {t('servers.refresh')}
        </button>
      </div>
      {error && <p role="alert" className="text-xs text-red-600 dark:text-red-400">{t('servers.error')}</p>}
      {loading && !readings && <p role="status" className="text-xs text-muted-foreground">{t('common.loading')}</p>}
      {readings && SERVERS.map((server) => {
        const reading = readings.find((entry) => entry.id === server.id)
        const snapshot = reading?.snapshot
        return (
          <section key={server.id} className="rounded-lg border border-border bg-card">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
              <h2 className="text-sm font-semibold">{server.name}</h2>
              <p className="text-xs text-muted-foreground">
                {reading ? (
                  <>
                    {t('servers.lastReport')}{' '}
                    <time dateTime={reading.receivedAt}>
                      {new Date(reading.receivedAt).toLocaleString(locale)}
                    </time>
                    {reading.stale &&
                      <span className="ms-2 font-medium text-amber-700 dark:text-amber-400">{t('servers.stale')}</span>}
                  </>
                ) : t('servers.waiting')}
              </p>
            </div>
            {snapshot && (
              <dl className="grid grid-cols-2 gap-3 border-b border-border px-4 py-3 text-xs sm:grid-cols-4">
                {[
                  [t('servers.cpu', { count: snapshot.cpuCount }), percent.format(snapshot.cpuPercent / 100)],
                  ['RAM', `${gib(snapshot.ramUsed)} / ${gib(snapshot.ramTotal)} GiB`],
                  [t('servers.disk'), `${gib(snapshot.diskUsed)} / ${gib(snapshot.diskTotal)} GiB`],
                  [t('servers.uptime'), `${unit(Math.floor(snapshot.uptimeSeconds / 86400), 'day')} ${unit(Math.floor(snapshot.uptimeSeconds / 3600) % 24, 'hour')}`],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd className="mt-1 font-medium tabular-nums">{value}</dd>
                  </div>
                ))}
              </dl>
            )}
            <div className="space-y-2 px-4 py-3">
              <h3 className="text-xs font-medium text-muted-foreground">{t('servers.git')}</h3>
              <ul className="divide-y divide-border text-xs">
                {server.repositories.map((name) => {
                  const repo = snapshot?.repositories.find((entry) => entry.name === name)
                  const state = repo ? gitState(repo) : 'unavailable'
                  return (
                    <li key={name} className="grid gap-2 py-2 sm:grid-cols-3">
                      <div>
                        <span className="font-medium">{name}</span>
                        {repo?.ref && <div className="break-all text-muted-foreground">{repo.ref.slice('refs/heads/'.length)}</div>}
                      </div>
                      <div>
                        <div>{t(`servers.${state}`)}</div>
                        {repo?.dirty && <div className="text-amber-700 dark:text-amber-400">{t('servers.dirty')}</div>}
                      </div>
                      <dl>
                        {(['head', 'upstream'] as const).map((key) => (
                          <div key={key} className="flex flex-wrap gap-x-2">
                            <dt className="text-muted-foreground">{t(`servers.${key}`)}</dt>
                            <dd className="min-w-0 break-all"><code>{repo?.[key] ?? '—'}</code></dd>
                          </div>
                        ))}
                      </dl>
                    </li>
                  )
                })}
              </ul>
            </div>
          </section>
        )
      })}
    </div>
  )
}
