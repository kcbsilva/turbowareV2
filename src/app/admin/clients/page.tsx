'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Users, Key, ShieldOff, UserPlus, X } from 'lucide-react'

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
  const [clients, setClients] = useState<ClientRow[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, withLicenses: 0, activeLicenses: 0, revokedLicenses: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [page, setPage] = useState(1)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  const fetchClients = useCallback(async (q: string) => {
    setLoading(true)
    const res = await fetch(`/api/admin/clients?search=${encodeURIComponent(q)}`)
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

  // Apply status filter locally
  const filtered = clients.filter((c) => {
    if (statusFilter === 'with-licenses') return c._count.licenses > 0
    if (statusFilter === 'no-licenses') return c._count.licenses === 0
    return true
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const statusConfig = [
    { value: 'all' as const, label: 'All', color: 'bg-primary' },
    { value: 'with-licenses' as const, label: 'Has Licenses', color: 'bg-emerald-500' },
    { value: 'no-licenses' as const, label: 'No Licenses', color: 'bg-muted-foreground' },
  ]

  const statCards = [
    { label: 'Total Clients', value: stats.total, icon: <Users className="w-4 h-4 text-muted-foreground" /> },
    { label: 'With Licenses', value: stats.withLicenses, icon: <Key className="w-4 h-4 text-muted-foreground" /> },
    { label: 'Without Licenses', value: stats.total - stats.withLicenses, icon: <UserPlus className="w-4 h-4 text-muted-foreground" /> },
    { label: 'This Page', value: paged.length, icon: <ShieldOff className="w-4 h-4 text-muted-foreground" /> },
  ]

  return (
    <div className="h-full flex flex-col p-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {statCards.map((c) => (
          <div key={c.label} className="bg-card border border-border rounded-lg p-3 flex items-center justify-between">
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
            {filtered.length} client{filtered.length !== 1 ? 's' : ''} found
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
              placeholder="Search by name, email, company…"
              className="w-full pl-8 pr-8 py-1.5 rounded-full bg-card border border-border text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
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
      </div>

      {/* Table */}
      <div className="flex-1 bg-card border border-border rounded-lg overflow-hidden flex flex-col">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-xs text-muted-foreground animate-pulse">Loading clients…</p>
          </div>
        ) : paged.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <Users className="w-8 h-8 opacity-20" />
            <p className="text-xs">No clients found.</p>
            <button
              onClick={() => router.push('/admin/clients/new')}
              className="text-xs text-primary hover:underline"
            >
              Add your first client
            </button>
          </div>
        ) : (
          <>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-left text-[10px] text-muted-foreground uppercase tracking-wider">
                  <th className="px-4 py-2.5 font-medium">Name</th>
                  <th className="px-4 py-2.5 font-medium">Company</th>
                  <th className="px-4 py-2.5 font-medium">Email</th>
                  <th className="px-4 py-2.5 font-medium">Phone</th>
                  <th className="px-4 py-2.5 font-medium">Licenses</th>
                  <th className="px-4 py-2.5 font-medium">Since</th>
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
                      <span className={`px-2 py-0.5 rounded-full border text-[10px] font-medium ${c._count.licenses > 0 ? 'text-primary border-primary/30 bg-primary/10' : 'text-muted-foreground border-border bg-muted/50'}`}>
                        {c._count.licenses}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-primary font-medium">View →</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="border-t border-border px-4 py-2.5 flex items-center justify-between mt-auto">
              <span className="text-[10px] text-muted-foreground">
                {filtered.length > 0
                  ? `Showing ${(page - 1) * PER_PAGE + 1}–${Math.min(page * PER_PAGE, filtered.length)} of ${filtered.length}`
                  : 'No entries'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-2.5 py-1 rounded border border-border text-xs text-foreground hover:bg-muted disabled:opacity-40 transition"
                >
                  Previous
                </button>
                <span className="text-xs text-muted-foreground px-1">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-2.5 py-1 rounded border border-border text-xs text-foreground hover:bg-muted disabled:opacity-40 transition"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
