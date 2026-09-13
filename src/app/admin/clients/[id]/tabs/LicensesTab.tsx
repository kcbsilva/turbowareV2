'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { ChevronDown, Clock, Loader2, Plus } from 'lucide-react'
import { badge } from '@/lib/badges'
import { ExtendGraceDialog } from '@/components/ExtendGraceDialog'
import { MAX_ADMIN_GRACE_DAYS } from '@/lib/grace-period'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useAdminLang } from '@/components/admin/AdminLangProvider'
import { dateLocale } from '@/lib/admin-i18n'
import type { MsgKey } from '@/lib/admin-i18n'
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

const STATUS_BADGE: Record<ProductStatus, string> = {
  ACTIVE: badge.paid,
  PENDING: badge.pending,
  SUSPENDED: badge.overdue,
  CANCELLED: badge.mute,
}

const STATUS_KEY: Record<ProductStatus, MsgKey> = {
  ACTIVE: 'licenses.status.active',
  PENDING: 'licenses.status.pending',
  SUSPENDED: 'licenses.status.suspended',
  CANCELLED: 'licenses.status.cancelled',
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
  const { t, lang } = useAdminLang()
  const [licenses, setLicenses] = useState<LicenseRow[]>([])
  const [defaultSlug, setDefaultSlug] = useState('')
  const [catalog, setCatalog] = useState<CatalogProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [graceOpen, setGraceOpen] = useState(false)
  const [grace, setGrace] = useState<{
    status: string
    gracePeriodUsedAt: string | null
    gracePeriodEndsAt: string | null
  } | null>(null)

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
    const [licRes, catRes, subRes] = await Promise.all([
      fetch(`/api/admin/clients/${clientId}/products`, { cache: 'no-store' }),
      fetch('/api/admin/products', { cache: 'no-store' }),
      fetch(`/api/admin/clients/${clientId}/subscription`, { cache: 'no-store' }),
    ])
    if (licRes.ok) {
      const data = await licRes.json()
      setLicenses(data.licenses ?? [])
      setDefaultSlug(data.defaultSlug ?? '')
    } else {
      setError(t('licenses.loadError'))
    }
    if (catRes.ok) {
      const products = await catRes.json()
      setCatalog(Array.isArray(products) ? products : [])
    }
    if (subRes.ok) {
      const sub = await subRes.json()
      setGrace(
        sub
          ? {
              status: sub.status,
              gracePeriodUsedAt: sub.gracePeriodUsedAt ?? null,
              gracePeriodEndsAt: sub.gracePeriodEndsAt ?? null,
            }
          : null,
      )
    }
    setLoading(false)
  }, [clientId, t])

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
      setError(data.error || t('licenses.updateError'))
    } else {
      await load()
    }
    setBusy(null)
  }

  async function createLicense(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')
    if (!form.productId || !form.tierId || !form.dueDate || !form.tenantSlug.trim()) {
      setFormError(t('licenses.required'))
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
      setFormError(data.error || t('licenses.createError'))
      return
    }
    setDialogOpen(false)
    if (data.turboisp?.temporaryPassword && data.turboisp?.adminUsername) {
      setNotice(
        t('licenses.createdTenant', {
          user: data.turboisp.adminUsername,
          password: data.turboisp.temporaryPassword,
        }),
      )
    } else {
      setNotice('')
    }
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
      <div className="flex items-center justify-end gap-2">
        {grace && grace.status !== 'CANCELLED' && (
          <button
            type="button"
            onClick={() => setGraceOpen(true)}
            className="rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            {t('billing.extendGrace')}
          </button>
        )}
        <button
          type="button"
          onClick={openNew}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition"
          style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}
        >
          <Plus size={12} /> {t('licenses.new')}
        </button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      {notice && <p className="text-xs text-foreground">{notice}</p>}

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border text-left text-[10px] text-muted-foreground uppercase tracking-wider">
              <th className="px-4 py-2.5 font-medium">{t('licenses.product')}</th>
              <th className="px-4 py-2.5 font-medium">{t('licenses.plan')}</th>
              <th className="px-4 py-2.5 font-medium">{t('licenses.dueDate')}</th>
              <th className="px-4 py-2.5 font-medium">{t('licenses.tenantSlug')}</th>
              <th className="px-4 py-2.5 font-medium">{t('licenses.status')}</th>
              <th className="px-4 py-2.5 font-medium text-right">{t('licenses.options')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {licenses.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-xs text-muted-foreground">
                  {t('licenses.empty')}
                </td>
              </tr>
            ) : (
              licenses.map((row) => {
                const st = STATUS_BADGE[row.status]
                const rowBusy = busy === row.productId
                const canCancel = row.status !== 'CANCELLED'
                const productTiers = catalog.find((p) => p.id === row.productId)?.tiers ?? []
                return (
                  <tr key={row.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{row.product.name}</p>
                    </td>
                    <td className="px-4 py-3 text-foreground">{planLabel(row.tier?.name)}</td>
                    <td className="px-4 py-3 text-foreground">
                      {row.expiresAt ? new Date(row.expiresAt).toLocaleDateString(dateLocale(lang)) : '—'}
                    </td>
                    <td className="px-4 py-3 font-mono text-foreground">{row.tenantSlug || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={st}>{t(STATUS_KEY[row.status])}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        {rowBusy && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />}

                        <DropdownMenu>
                          <DropdownMenuTrigger
                            disabled={rowBusy}
                            className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-semibold rounded-md border border-border text-foreground hover:bg-muted disabled:opacity-50"
                          >
                            {t('licenses.statusBtn')} <ChevronDown className="w-3 h-3" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {(['ACTIVE', 'SUSPENDED', 'PENDING'] as const).map((s) => (
                              <DropdownMenuItem
                                key={s}
                                disabled={row.status === s}
                                onClick={() => patch(row.productId, { status: s })}
                              >
                                {t(STATUS_KEY[s])}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                          <DropdownMenuTrigger
                            disabled={rowBusy || productTiers.length === 0}
                            className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-semibold rounded-md border border-border text-foreground hover:bg-muted disabled:opacity-50"
                          >
                            {t('licenses.planBtn')} <ChevronDown className="w-3 h-3" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {productTiers.map((tier) => (
                              <DropdownMenuItem
                                key={tier.id}
                                disabled={row.tier?.id === tier.id}
                                onClick={() => patch(row.productId, { tierId: tier.id })}
                              >
                                {planLabel(tier.name)}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>

                        <button
                          type="button"
                          disabled={rowBusy || !canCancel}
                          onClick={() => {
                            if (!window.confirm(t('licenses.cancelConfirm', { name: row.product.name }))) return
                            patch(row.productId, { status: 'CANCELLED' })
                          }}
                          className="px-2 py-1 text-[10px] font-semibold rounded-md border border-destructive/30 text-destructive hover:bg-destructive/10 disabled:opacity-40"
                        >
                          {t('licenses.cancel')}
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
            <DialogTitle>{t('licenses.dialogTitle')}</DialogTitle>
            <DialogDescription>{t('licenses.dialogDesc')}</DialogDescription>
          </DialogHeader>
          <form onSubmit={createLicense} className="space-y-3">
            <label className="block space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{t('licenses.product')}</span>
              <select
                value={form.productId}
                onChange={(e) => setForm((f) => ({ ...f, productId: e.target.value, tierId: '' }))}
                className={inputClass}
                required
              >
                <option value="">{t('licenses.selectProduct')}</option>
                {catalog.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{t('licenses.plan')}</span>
              <select
                value={form.tierId}
                onChange={(e) => setForm((f) => ({ ...f, tierId: e.target.value }))}
                className={inputClass}
                required
                disabled={!selectedProduct}
              >
                <option value="">{t('licenses.selectTier')}</option>
                {(selectedProduct?.tiers ?? []).map((tier) => (
                  <option key={tier.id} value={tier.id}>
                    {planLabel(tier.name)}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{t('licenses.dueDate')}</span>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                className={inputClass}
                required
              />
            </label>

            <label className="block space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{t('licenses.tenantSlug')}</span>
              <input
                value={form.tenantSlug}
                onChange={(e) => setForm((f) => ({ ...f, tenantSlug: e.target.value.toLowerCase() }))}
                placeholder={t('licenses.slugPlaceholder')}
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
                {t('licenses.cancel')}
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-3 py-1.5 text-xs font-semibold rounded-md disabled:opacity-50"
                style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}
              >
                {saving ? t('licenses.creating') : t('licenses.create')}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {grace && grace.status !== 'CANCELLED' && (
        <ExtendGraceDialog
          open={graceOpen}
          onOpenChange={setGraceOpen}
          currentEndsAt={grace.gracePeriodEndsAt}
          maxDays={MAX_ADMIN_GRACE_DAYS}
          confirmLabel={t('billing.extendGrace')}
          onConfirm={async (payload) => {
            const res = await fetch(`/api/admin/clients/${clientId}/subscription/grace`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            })
            const data = await res.json().catch(() => ({}))
            if (!res.ok) throw new Error(data.error || 'Failed to extend grace.')
            await load()
          }}
        />
      )}

      {grace?.gracePeriodUsedAt && (
        <div className="bg-card border border-border rounded-lg">
          <div className="px-4 py-2.5 border-b border-border flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
            <h2 className="text-[10px] font-semibold text-foreground uppercase tracking-wider">{t('billing.grace')}</h2>
          </div>
          <div className="px-4 py-3 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('billing.lastActivated')}</span>
              <span className="text-foreground">{new Date(grace.gracePeriodUsedAt).toLocaleDateString(dateLocale(lang))}</span>
            </div>
            {grace.gracePeriodEndsAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('billing.expires')}</span>
                <span className="text-muted-foreground">
                  {new Date(grace.gracePeriodEndsAt).toLocaleDateString(dateLocale(lang))}
                  {new Date(grace.gracePeriodEndsAt) > new Date() ? ` ${t('billing.active')}` : ` ${t('billing.expired')}`}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
