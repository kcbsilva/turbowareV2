'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Users, Key, ShieldOff, UserPlus, X, RefreshCw } from 'lucide-react'
import { badge } from '@/lib/badges'
import { useAdminLang } from '@/components/admin/AdminLangProvider'
import { dateLocale } from '@/lib/admin-i18n'

type StatusFilter = 'all' | 'with-licenses' | 'no-licenses'

interface ClientRow {
  id: string
  name: string
  company: string | null
  email: string | null
  phone: string | null
  createdAt: string
  _count: { licenses: number }
}

interface Stats {
  total: number
  withLicenses: number
  activeLicenses: number
  revokedLicenses: number
}

const PER_PAGE = 12

export default function ClientsPage() {
  const router = useRouter()
  const { t, lang } = useAdminLang()
  const [clients, setClients] = useState<ClientRow[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, withLicenses: 0, activeLicenses: 0, revokedLicenses: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [page, setPage] = useState(1)
  const [syncing, setSyncing] = useState(false)
  const [syncMsg, setSyncMsg] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  const fetchClients = useCallback(async (q: string) => {
    setLoading(true)
    const res = await fetch(`/api/admin/clients?search=${encodeURIComponent(q)}`, {
      cache: 'no-store',
    })
    if (res.ok) {
      const data: ClientRow[] = await res.json()
      setClients(data)
      const withLicenses = data.filter((c) => c._count.licenses > 0).length
      setStats({ total: data.length, withLicenses, activeLicenses: 0, revokedLicenses: 0 })
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchClients(search), 300)
    return () => clearTimeout(debounceRef.current)
  }, [search, fetchClients])

  async function syncTenants() {
    setSyncing(true)
    setSyncMsg(null)
    try {
      const res = await fetch('/api/admin/clients/sync-tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      })
      const data = await res.json()
      if (!res.ok) {
        setSyncMsg(data.error || t('clients.syncFailed'))
        return
      }
      const parts: string[] = []
      if (data.synced?.length) parts.push(t('clients.synced', { n: data.synced.length, names: data.synced.join(', ') }))
      if (data.skipped?.length) parts.push(t('clients.syncLinked', { n: data.skipped.length }))
      if (data.errors?.length) {
        parts.push(
          t('clients.syncErrors', {
            n: data.errors.length,
            names: data.errors.map((e: { slug: string }) => e.slug).join(', '),
          }),
        )
      }
      setSyncMsg(parts.join(' · ') || t('clients.syncNone'))
      await fetchClients(search)
    } finally {
      setSyncing(false)
    }
  }

  // Apply status filter locally
  const filtered = clients.filter((c) => {
    if (statusFilter === 'with-licenses') return c._count.licenses > 0
    if (statusFilter === 'no-licenses') return c._count.licenses === 0
    return true
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const statusConfig = [
    { value: 'all' as const, label: t('common.all'), color: 'bg-neutral-200' },
    { value: 'with-licenses' as const, label: t('clients.filter.has'), color: 'bg-foreground' },
    { value: 'no-licenses' as const, label: t('clients.filter.none'), color: 'bg-neutral-500' },
  ]

  const statCards = [
    { id: 'total', label: t('clients.stat.total'), value: stats.total, icon: <Users className="w-4 h-4 text-muted-foreground" /> },
    { id: 'with', label: t('clients.stat.with'), value: stats.withLicenses, icon: <Key className="w-4 h-4 text-muted-foreground" /> },
    { id: 'without', label: t('clients.stat.without'), value: stats.total - stats.withLicenses, icon: <UserPlus className="w-4 h-4 text-muted-foreground" /> },
    { id: 'page', label: t('clients.stat.page'), value: paged.length, icon: <ShieldOff className="w-4 h-4 text-muted-foreground" /> },
  ]

  return (
    <div className="h-full flex flex-col p-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {statCards.map((c) => (
          <div key={c.id} className="bg-card border border-border rounded-lg p-3 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{c.label}</p>
              <p className="text-xl font-bold text-foreground mt-0.5">
                {loading ? <span className="animate-pulse text-muted-foreground">—</span> : c.value}
              </p>
            </div>
            {c.icon}
          </div>
        ))}
      </div>

      {/* ClientBar */}
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {/* Count */}
          <p className="text-xs text-muted-foreground min-w-fit">
            {filtered.length === 1 ? t('clients.foundOne') : t('clients.found', { n: filtered.length })}
          </p>

          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              placeholder={t('clients.search')}
              className="w-full pl-8 pr-8 py-1.5 rounded-full bg-card border border-border text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            <button
              type="button"
              onClick={() => router.push('/admin/clients/new')}
              className="tw-btn-primary flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold"
            >
              <UserPlus className="w-3.5 h-3.5" />
              {t('clients.newTenant')}
            </button>
            <button
              type="button"
              onClick={syncTenants}
              disabled={syncing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-card text-xs font-medium text-foreground hover:bg-muted disabled:opacity-50"
              title={t('clients.syncTitle')}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              {t('clients.sync')}
            </button>
          </div>

          {/* Status filters */}
          <div className="flex items-center gap-2">
            {statusConfig.map(({ value, label, color }) => {
              const active = statusFilter === value
              return (
                <button
                  key={value}
                  onClick={() => { setStatusFilter(value); setPage(1) }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-medium transition-colors ${active ? 'bg-muted text-foreground border-border' : 'bg-card text-foreground border-border hover:bg-muted'}`}
                >
                  <span className={`w-2 h-2 rounded-full ${color} ${active ? 'animate-pulse' : ''}`} />
                  {label}
                </button>
              )
            })}
          </div>

        </div>
        {syncMsg && (
          <p className="text-xs text-muted-foreground">{syncMsg}</p>
        )}
      </div>

      {/* Table */}
      <div className="flex-1 bg-card border border-border rounded-lg overflow-hidden flex flex-col">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-xs text-muted-foreground animate-pulse">{t('clients.loading')}</p>
          </div>
        ) : paged.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <Users className="w-8 h-8 opacity-20" />
            <p className="text-xs">{t('clients.empty')}</p>
            <button
              onClick={() => router.push('/admin/clients/new')}
              className="text-xs text-primary hover:underline"
            >
              {t('clients.addFirst')}
            </button>
          </div>
        ) : (
          <>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-left text-[10px] text-muted-foreground uppercase tracking-wider">
                  <th className="px-4 py-2.5 font-medium">{t('common.name')}</th>
                  <th className="px-4 py-2.5 font-medium">{t('vars.client.company')}</th>
                  <th className="px-4 py-2.5 font-medium">{t('login.email')}</th>
                  <th className="px-4 py-2.5 font-medium">{t('common.phone')}</th>
                  <th className="px-4 py-2.5 font-medium">{t('nav.licenses')}</th>
                  <th className="px-4 py-2.5 font-medium">{t('profile.since')}</th>
                  <th className="px-4 py-2.5 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paged.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-muted/40 transition cursor-pointer"
                    onClick={() => router.push(`/admin/clients/${c.id}`)}
                  >
                    <td className="px-4 py-3 font-medium text-foreground">{c.name}</td>
                    <td className="px-4 py-3 text-foreground">{c.company || <span className="text-muted-foreground">—</span>}</td>
                    <td className="px-4 py-3 text-foreground">{c.email || <span className="text-muted-foreground">—</span>}</td>
                    <td className="px-4 py-3 text-foreground">{c.phone || <span className="text-muted-foreground">—</span>}</td>
                    <td className="px-4 py-3">
                      <span className={c._count.licenses > 0 ? badge.teal : badge.mute}>
                        {c._count.licenses}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{new Date(c.createdAt).toLocaleDateString(dateLocale(lang))}</td>
                    <td className="px-4 py-3 text-primary font-medium">{t('clients.view')} →</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="border-t border-border px-4 py-2.5 flex items-center justify-between mt-auto">
              <span className="text-[10px] text-muted-foreground">
                {filtered.length > 0
                  ? t('clients.showing', {
                      from: (page - 1) * PER_PAGE + 1,
                      to: Math.min(page * PER_PAGE, filtered.length),
                      total: filtered.length,
                    })
                  : t('clients.noEntries')}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-2.5 py-1 rounded border border-border text-xs text-foreground hover:bg-muted disabled:opacity-40 transition"
                >
                  {t('common.previous')}
                </button>
                <span className="text-xs text-muted-foreground px-1">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-2.5 py-1 rounded border border-border text-xs text-foreground hover:bg-muted disabled:opacity-40 transition"
                >
                  {t('common.next')}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
