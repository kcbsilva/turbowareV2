'use client'

import { useCallback, useEffect, useState } from 'react'
import { ChevronDown, Loader2, Package } from 'lucide-react'
import { badge } from '@/lib/badges'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type ProductStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'CANCELLED'

interface Tier {
  id: string
  name: string
  description: string | null
  maxSeats: number | null
  maxMapItems: number | null
  sortOrder: number
}

interface CatalogProduct {
  id: string
  name: string
  slug: string
  description: string | null
  logoEmoji: string | null
  tiers: Tier[]
  activation: {
    id: string
    status: ProductStatus
    tierId: string | null
    tier: { id: string; name: string } | null
  } | null
}

const STATUS_STYLES: Record<ProductStatus, { badge: string; label: string }> = {
  ACTIVE:    { badge: badge.paid,    label: 'Active' },
  PENDING:   { badge: badge.pending, label: 'Pending' },
  SUSPENDED: { badge: badge.overdue, label: 'Suspended' },
  CANCELLED: { badge: badge.mute,    label: 'Cancelled' },
}

function planLabel(name: string | null | undefined) {
  if (!name) return '—'
  if (/^\d/.test(name) || name.toLowerCase().endsWith('k+')) return `Tier ${name}`
  return name
}

interface Props {
  clientId: string
}

export function LicensesTab({ clientId }: Props) {
  const [products, setProducts] = useState<CatalogProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    const res = await fetch(`/api/admin/clients/${clientId}/products`, { cache: 'no-store' })
    if (res.ok) setProducts(await res.json())
    else setError('Could not load products.')
    setLoading(false)
  }, [clientId])

  useEffect(() => { load() }, [load])

  async function patch(productId: string, body: { status?: ProductStatus; tierId?: string | null }) {
    setBusy(productId)
    setError('')
    const res = await fetch(`/api/admin/clients/${clientId}/products/${productId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error || 'Update failed.')
    } else {
      await load()
    }
    setBusy(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-[11px] text-muted-foreground">
        Available Turboware services for this client. Change plan, status, or cancel from Options.
      </p>
      {error && <p className="text-xs text-destructive">{error}</p>}

      {products.length === 0 ? (
        <div className="bg-card border border-border rounded-lg px-6 py-10 flex flex-col items-center gap-2 text-muted-foreground">
          <Package className="w-8 h-8 opacity-20" />
          <p className="text-xs">No products in the catalog yet.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-left text-[10px] text-muted-foreground uppercase tracking-wider">
                <th className="px-4 py-2.5 font-medium">Product</th>
                <th className="px-4 py-2.5 font-medium">Plan</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium text-right">Options</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((p) => {
                const status = p.activation?.status
                const st = status ? STATUS_STYLES[status] : null
                const rowBusy = busy === p.id
                const canCancel = status && status !== 'CANCELLED'
                return (
                  <tr key={p.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-base leading-none">{p.logoEmoji ?? '📦'}</span>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground">{p.name}</p>
                          {p.description && (
                            <p className="text-[10px] text-muted-foreground truncate">{p.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {planLabel(p.activation?.tier?.name)}
                    </td>
                    <td className="px-4 py-3">
                      {st ? (
                        <span className={st.badge}>{st.label}</span>
                      ) : (
                        <span className={badge.mute}>Not licensed</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        {rowBusy && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />}

                        <DropdownMenu>
                          <DropdownMenuTrigger
                            disabled={rowBusy}
                            className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-semibold rounded-md border border-border text-foreground hover:bg-muted disabled:opacity-50"
                          >
                            Status <ChevronDown className="w-3 h-3" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {(['ACTIVE', 'SUSPENDED', 'PENDING'] as const).map((s) => (
                              <DropdownMenuItem
                                key={s}
                                disabled={status === s}
                                onClick={() => patch(p.id, { status: s })}
                              >
                                {STATUS_STYLES[s].label}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                          <DropdownMenuTrigger
                            disabled={rowBusy || p.tiers.length === 0}
                            className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-semibold rounded-md border border-border text-foreground hover:bg-muted disabled:opacity-50"
                          >
                            Plan <ChevronDown className="w-3 h-3" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {p.tiers.map((t) => (
                              <DropdownMenuItem
                                key={t.id}
                                disabled={p.activation?.tierId === t.id}
                                onClick={() => patch(p.id, { tierId: t.id })}
                              >
                                {planLabel(t.name)}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>

                        <button
                          type="button"
                          disabled={rowBusy || !canCancel}
                          onClick={() => {
                            if (!window.confirm(`Cancel ${p.name} for this client?`)) return
                            patch(p.id, { status: 'CANCELLED' })
                          }}
                          className="px-2 py-1 text-[10px] font-semibold rounded-md border border-destructive/30 text-destructive hover:bg-destructive/10 disabled:opacity-40"
                        >
                          Cancel
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
