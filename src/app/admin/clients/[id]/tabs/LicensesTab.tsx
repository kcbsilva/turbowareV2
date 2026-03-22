'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Key, Plus, RefreshCw } from 'lucide-react'

type LicenseStatus = 'ACTIVE' | 'SUSPENDED' | 'REVOKED' | 'EXPIRED'

interface License {
  id: string
  key: string
  product: string
  status: LicenseStatus
  expiresAt: string | null
  maxSeats: number
  _count: { activations: number }
}

interface Props {
  clientId: string
  licenses: License[]
}

const statusStyles: Record<LicenseStatus, { badge: string; label: string }> = {
  ACTIVE:    { badge: 'text-emerald-400 border-emerald-800 bg-emerald-950/40', label: 'Active'    },
  SUSPENDED: { badge: 'text-yellow-400 border-yellow-800 bg-yellow-950/40',   label: 'Suspended' },
  REVOKED:   { badge: 'text-red-400 border-red-900 bg-red-950/40',             label: 'Revoked'   },
  EXPIRED:   { badge: 'text-muted-foreground border-border bg-muted/50',       label: 'Expired'   },
}

type Filter = 'All' | LicenseStatus

export function LicensesTab({ clientId, licenses }: Props) {
  const router = useRouter()
  const [filter, setFilter] = useState<Filter>('All')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const filtered = filter === 'All' ? licenses : licenses.filter((l) => l.status === filter)

  const counts = {
    All: licenses.length,
    ACTIVE: licenses.filter((l) => l.status === 'ACTIVE').length,
    SUSPENDED: licenses.filter((l) => l.status === 'SUSPENDED').length,
    REVOKED: licenses.filter((l) => l.status === 'REVOKED').length,
    EXPIRED: licenses.filter((l) => l.status === 'EXPIRED').length,
  }

  const filterTabs: { label: string; value: Filter }[] = [
    { label: `All (${counts.All})`,             value: 'All'       },
    { label: `Active (${counts.ACTIVE})`,       value: 'ACTIVE'    },
    { label: `Suspended (${counts.SUSPENDED})`, value: 'SUSPENDED' },
    { label: `Revoked (${counts.REVOKED})`,     value: 'REVOKED'   },
  ]

  async function updateStatus(licenseId: string, status: LicenseStatus) {
    setActionLoading(licenseId + status)
    await fetch(`/api/admin/licenses/${licenseId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setActionLoading(null)
    router.refresh()
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 border-b border-border">
          {filterTabs.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`px-3 py-1.5 text-xs font-medium border-b-2 -mb-px transition-colors ${
                filter === value
                  ? 'border-accent text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <Link
          href={`/admin/licenses/new?clientId=${clientId}`}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition"
          style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}
        >
          <Plus size={12} /> Generate Key
        </Link>
      </div>

      {/* License list */}
      {filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-lg px-6 py-10 flex flex-col items-center gap-3 text-muted-foreground">
          <Key className="w-8 h-8 opacity-20" />
          <p className="text-xs">No {filter !== 'All' ? filter.toLowerCase() : ''} licenses.</p>
          <Link href={`/admin/licenses/new?clientId=${clientId}`} className="text-xs text-primary hover:underline">
            Generate a key for this client →
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((l) => {
            const st = statusStyles[l.status]
            return (
              <div key={l.id} className="bg-card border border-border rounded-lg px-4 py-3 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-xs text-foreground font-semibold truncate">{l.key}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{l.product}</p>
                </div>

                <div className="flex items-center gap-3 text-[10px] text-muted-foreground shrink-0">
                  <span>{l._count.activations}/{l.maxSeats} seats</span>
                  <span>{l.expiresAt ? `Exp. ${new Date(l.expiresAt).toLocaleDateString()}` : 'No expiry'}</span>
                  <span className={`px-2 py-0.5 rounded-full border text-[10px] font-medium ${st.badge}`}>
                    {st.label}
                  </span>
                </div>

                {/* Quick actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {l.status === 'ACTIVE' && (
                    <button
                      onClick={() => updateStatus(l.id, 'SUSPENDED')}
                      disabled={!!actionLoading}
                      className="px-2 py-1 text-[10px] rounded bg-yellow-900/30 text-yellow-300 hover:bg-yellow-900/50 border border-yellow-800/50 transition disabled:opacity-50"
                    >
                      {actionLoading === l.id + 'SUSPENDED' ? <RefreshCw size={10} className="animate-spin" /> : 'Suspend'}
                    </button>
                  )}
                  {l.status === 'SUSPENDED' && (
                    <button
                      onClick={() => updateStatus(l.id, 'ACTIVE')}
                      disabled={!!actionLoading}
                      className="px-2 py-1 text-[10px] rounded bg-emerald-900/30 text-emerald-300 hover:bg-emerald-900/50 border border-emerald-800/50 transition disabled:opacity-50"
                    >
                      {actionLoading === l.id + 'ACTIVE' ? <RefreshCw size={10} className="animate-spin" /> : 'Activate'}
                    </button>
                  )}
                  {l.status !== 'REVOKED' && (
                    <button
                      onClick={() => updateStatus(l.id, 'REVOKED')}
                      disabled={!!actionLoading}
                      className="px-2 py-1 text-[10px] rounded bg-red-900/30 text-red-300 hover:bg-red-900/50 border border-red-800/50 transition disabled:opacity-50"
                    >
                      {actionLoading === l.id + 'REVOKED' ? <RefreshCw size={10} className="animate-spin" /> : 'Revoke'}
                    </button>
                  )}
                  <Link href={`/admin/licenses/${l.id}`} className="px-2 py-1 text-[10px] rounded bg-muted hover:bg-secondary border border-border text-foreground transition">
                    Manage →
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
