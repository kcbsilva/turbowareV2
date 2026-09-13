'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { ChevronDown, Loader2, Plus } from 'lucide-react'
import { badge } from '@/lib/badges'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
  sortOrder: number
}

interface CatalogProduct {
  id: string
  name: string
  slug: string
  logoEmoji: string | null
  tiers: Tier[]
}

interface LicenseRow {
  id: string
  productId: string
  status: ProductStatus
  tenantSlug: string | null
  expiresAt: string | null
  product: { id: string; name: string; slug: string; logoEmoji: string | null }
  tier: { id: string; name: string } | null
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

const inputClass =
  'w-full px-3 py-2 bg-muted border border-border rounded-md text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition'

interface Props {
  clientId: string
}

export function LicensesTab({ clientId }: Props) {
  const [licenses, setLicenses] = useState<LicenseRow[]>([])
  const [defaultSlug, setDefaultSlug] = useState('')
  const [catalog, setCatalog] = useState<CatalogProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState('')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [form, setForm] = useState({
    productId: '',
    tierId: '',
    dueDate: '',
    tenantSlug: '',
  })

  const selectedProduct = useMemo(
    () => catalog.find((p) => p.id === form.productId) ?? null,
    [catalog, form.productId],
  )

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    const [licRes, catRes] = await Promise.all([
      fetch(`/api/admin/clients/${clientId}/products`, { cache: 'no-store' }),
      fetch('/api/admin/products', { cache: 'no-store' }),
    ])
    if (licRes.ok) {
      const data = await licRes.json()
      setLicenses(data.licenses ?? [])
      setDefaultSlug(data.defaultSlug ?? '')
    } else {
      setError('Could not load licenses.')
    }
    if (catRes.ok) {
      const products = await catRes.json()
      setCatalog(Array.isArray(products) ? products : [])
    }
    setLoading(false)
  }, [clientId])

  useEffect(() => { load() }, [load])

  function openNew() {
    setFormError('')
    setForm({
      productId: '',
      tierId: '',
      dueDate: '',
      tenantSlug: defaultSlug,
    })
    setDialogOpen(true)
  }

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

  async function createLicense(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')
    if (!form.productId || !form.tierId || !form.dueDate || !form.tenantSlug.trim()) {
      setFormError('Product, tier, due date, and tenant slug are required.')
      return
    }
    setSaving(true)
    const res = await fetch(`/api/admin/clients/${clientId}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: form.productId,
        tierId: form.tierId,
        dueDate: form.dueDate,
        tenantSlug: form.tenantSlug.trim().toLowerCase(),
      }),
    })
    const data = await res.json().catch(() => ({}))
    setSaving(false)
    if (!res.ok) {
      setFormError(data.error || 'Could not create license.')
      return
    }
    setDialogOpen(false)
    await load()
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
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={openNew}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition"
          style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}
        >
          <Plus size={12} /> New License
        </button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border text-left text-[10px] text-muted-foreground uppercase tracking-wider">
              <th className="px-4 py-2.5 font-medium">Product</th>
              <th className="px-4 py-2.5 font-medium">Plan</th>
              <th className="px-4 py-2.5 font-medium">Due date</th>
              <th className="px-4 py-2.5 font-medium">Tenant slug</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
              <th className="px-4 py-2.5 font-medium text-right">Options</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {licenses.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-xs text-muted-foreground">
                  No licenses yet.
                </td>
              </tr>
            ) : (
              licenses.map((row) => {
                const st = STATUS_STYLES[row.status]
                const rowBusy = busy === row.productId
                const canCancel = row.status !== 'CANCELLED'
                const productTiers = catalog.find((p) => p.id === row.productId)?.tiers ?? []
                return (
                  <tr key={row.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-base leading-none">{row.product.logoEmoji ?? '📦'}</span>
                        <p className="font-medium text-foreground">{row.product.name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-foreground">{planLabel(row.tier?.name)}</td>
                    <td className="px-4 py-3 text-foreground">
                      {row.expiresAt ? new Date(row.expiresAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3 font-mono text-foreground">{row.tenantSlug || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={st.badge}>{st.label}</span>
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
                                disabled={row.status === s}
                                onClick={() => patch(row.productId, { status: s })}
                              >
                                {STATUS_STYLES[s].label}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                          <DropdownMenuTrigger
                            disabled={rowBusy || productTiers.length === 0}
                            className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-semibold rounded-md border border-border text-foreground hover:bg-muted disabled:opacity-50"
                          >
                            Plan <ChevronDown className="w-3 h-3" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {productTiers.map((t) => (
                              <DropdownMenuItem
                                key={t.id}
                                disabled={row.tier?.id === t.id}
                                onClick={() => patch(row.productId, { tierId: t.id })}
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
                            if (!window.confirm(`Cancel ${row.product.name} for this client?`)) return
                            patch(row.productId, { status: 'CANCELLED' })
                          }}
                          className="px-2 py-1 text-[10px] font-semibold rounded-md border border-destructive/30 text-destructive hover:bg-destructive/10 disabled:opacity-40"
                        >
                          Cancel
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md" showCloseButton>
          <DialogHeader>
            <DialogTitle>New License</DialogTitle>
            <DialogDescription>Select the product and configure this client’s license.</DialogDescription>
          </DialogHeader>
          <form onSubmit={createLicense} className="space-y-3">
            <label className="block space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Product</span>
              <select
                value={form.productId}
                onChange={(e) => setForm((f) => ({ ...f, productId: e.target.value, tierId: '' }))}
                className={inputClass}
                required
              >
                <option value="">Select product</option>
                {catalog.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Tier</span>
              <select
                value={form.tierId}
                onChange={(e) => setForm((f) => ({ ...f, tierId: e.target.value }))}
                className={inputClass}
                required
                disabled={!selectedProduct}
              >
                <option value="">Select tier</option>
                {(selectedProduct?.tiers ?? []).map((t) => (
                  <option key={t.id} value={t.id}>
                    {planLabel(t.name)}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Due date</span>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                className={inputClass}
                required
              />
            </label>

            <label className="block space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Tenant slug</span>
              <input
                value={form.tenantSlug}
                onChange={(e) => setForm((f) => ({ ...f, tenantSlug: e.target.value.toLowerCase() }))}
                placeholder="acme"
                className={inputClass}
                required
              />
            </label>

            {formError && <p className="text-xs text-destructive">{formError}</p>}

            <DialogFooter>
              <button
                type="button"
                onClick={() => setDialogOpen(false)}
                className="px-3 py-1.5 text-xs font-semibold rounded-md border border-border text-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-3 py-1.5 text-xs font-semibold rounded-md disabled:opacity-50"
                style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}
              >
                {saving ? 'Creating…' : 'Create license'}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
