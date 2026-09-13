'use client'

import { useState, useEffect, useCallback } from 'react'
import { AlertTriangle, RefreshCw, Loader2, CreditCard, ExternalLink, ChevronDown, Plus, Trash2 } from 'lucide-react'
import { formatBRL, getInstallationFee, type Region } from '@/lib/pricing'
import { badge } from '@/lib/badges'
import { formatInvoiceNumber, resolveInvoiceDisplayStatus } from '@/lib/invoice-display'
import { useAdminLang } from '@/components/admin/AdminLangProvider'
import type { MsgKey } from '@/lib/admin-i18n'
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
import type { ChargeType } from '@/lib/charges'

interface Invoice {
  id: string
  type: 'INSTALLATION' | 'MONTHLY' | 'PRORATED' | 'GRACE_FEE' | 'IMPORTATION' | 'CUSTOM'
  amount: number
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'WAIVED'
  dueDate: string
  paidAt: string | null
  notes: string | null
  paymentUrl: string | null
  paymentGateway: 'ASAAS' | 'STRIPE' | null
  installmentNo: number | null
  createdAt: string
}

interface Subscription {
  id: string
  product: string
  seats: number
  status: 'TRIAL' | 'PENDING_PAYMENT' | 'ACTIVE' | 'SUSPENDED' | 'CANCELLED'
  billingDate: number
  billingDateChangedAt: string | null
  trialEndsAt: string | null
  gracePeriodUsedAt: string | null
  gracePeriodEndsAt: string | null
  region: string | null
  paymentPlanAllowed: boolean
  invoices: Invoice[]
  license: { key: string; status: string; maxSeats: number } | null
}

const INVOICE_TYPE_KEY = {
  INSTALLATION: 'billing.inv.installation',
  MONTHLY:      'billing.inv.monthly',
  PRORATED:     'billing.inv.prorated',
  GRACE_FEE:    'billing.inv.grace',
  IMPORTATION:  'billing.inv.importation',
  CUSTOM:       'billing.inv.custom',
} as const satisfies Record<string, MsgKey>

const INVOICE_STATUS_KEY = {
  PAID:    'billing.paid',
  PENDING: 'billing.pending',
  OVERDUE: 'billing.overdue',
  WAIVED:  'billing.waived',
} as const satisfies Record<string, MsgKey>

const INVOICE_STATUS_BADGE = {
  PAID:    badge.paid,
  PENDING: badge.pending,
  OVERDUE: badge.overdue,
  WAIVED:  badge.mute,
} as const

interface Props { clientId: string }

export function BillingTab({ clientId }: Props) {
  const { t } = useAdminLang()
  const [sub, setSub]           = useState<Subscription | null | undefined>(undefined)
  const [loading, setLoading]   = useState(true)
  const [sending, setSending]   = useState<string | null>(null)  // `${invoiceId}-asaas` | `${invoiceId}-stripe`
  const [removing, setRemoving] = useState<string | null>(null)
  const [chargeOpen, setChargeOpen] = useState(false)
  const [savingCharge, setSavingCharge] = useState(false)
  const [togglingPlan, setTogglingPlan] = useState(false)
  const [chargeError, setChargeError] = useState('')
  const [charge, setCharge] = useState({
    type: 'INSTALLATION' as ChargeType,
    amount: '',
    dueDate: '',
    notes: '',
    split: false,
    installments: '3',
    intervalDays: '30',
  })

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/admin/clients/${clientId}/subscription`)
    if (res.ok) setSub(await res.json())
    setLoading(false)
  }, [clientId])

  useEffect(() => { load() }, [load])

  async function sendPaymentLink(invoiceId: string, gateway: 'asaas' | 'stripe') {
    setSending(`${invoiceId}-${gateway}`)
    try {
      const res = await fetch(`/api/admin/invoices/${invoiceId}/send-payment`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ gateway }),
      })
      const data = await res.json()
      if (res.ok && data.paymentUrl) {
        // Open payment link in new tab so admin can copy/share it
        window.open(data.paymentUrl, '_blank', 'noopener,noreferrer')
        load()
      } else {
        alert(data.error || t('billing.payError'))
      }
    } finally {
      setSending(null)
    }
  }

  async function removeInvoice(inv: Invoice) {
    const number = formatInvoiceNumber(inv.id, inv.createdAt)
    if (!window.confirm(t('billing.removeConfirm', { n: number }))) return
    setRemoving(inv.id)
    try {
      const res = await fetch(`/api/admin/invoices/${inv.id}`, { method: 'DELETE' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        alert(data.error || t('billing.removeError'))
        return
      }
      await load()
    } finally {
      setRemoving(null)
    }
  }

  function regionOf(s: Subscription): Region {
    return s.region === 'CA' || s.region === 'US' || s.region === 'GB' ? s.region : 'BR'
  }

  function openCharge() {
    if (!sub) return
    setChargeError('')
    setCharge({
      type: 'INSTALLATION',
      amount: String(getInstallationFee(regionOf(sub))),
      dueDate: new Date().toISOString().slice(0, 10),
      notes: '',
      split: false,
      installments: '3',
      intervalDays: '30',
    })
    setChargeOpen(true)
  }

  async function togglePaymentPlan(allowed: boolean) {
    setTogglingPlan(true)
    const res = await fetch(`/api/admin/clients/${clientId}/subscription`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentPlanAllowed: allowed }),
    })
    if (res.ok) {
      const next = await res.json()
      setSub(next)
    }
    setTogglingPlan(false)
  }

  async function createCharge(e: React.FormEvent) {
    e.preventDefault()
    setChargeError('')
    const amount = Number(charge.amount)
    if (!charge.dueDate || !Number.isFinite(amount) || amount <= 0) {
      setChargeError(t('billing.chargeError'))
      return
    }
    setSavingCharge(true)
    const res = await fetch(`/api/admin/clients/${clientId}/subscription/charges`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: charge.type,
        amount,
        dueDate: charge.dueDate,
        notes: charge.notes.trim() || undefined,
        installments: charge.split ? Number(charge.installments) : 1,
        intervalDays: charge.split ? Number(charge.intervalDays) : 30,
      }),
    })
    const data = await res.json().catch(() => ({}))
    setSavingCharge(false)
    if (!res.ok) {
      setChargeError(data.error || t('billing.chargeError'))
      return
    }
    setChargeOpen(false)
    await load()
  }

  if (loading || sub === undefined) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (sub === null) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-2 text-muted-foreground">
        <CreditCard className="w-8 h-8 opacity-30" />
        <p className="text-xs">{t('billing.noSub')}</p>
      </div>
    )
  }

  const pendingInvs = sub.invoices.filter((i) => i.status === 'PENDING' || i.status === 'OVERDUE')
  const card = 'bg-card border border-border rounded-lg'

  return (
    <div className="space-y-4">
      <div className={card}>
        <div className="px-4 py-2.5 border-b border-border flex items-center justify-between gap-2">
          <h2 className="text-[10px] font-semibold text-foreground uppercase tracking-wider">{t('billing.invoices')}</h2>
          <div className="flex items-center gap-2">
            <button onClick={load} className="text-muted-foreground hover:text-foreground transition" title={t('billing.refresh')}>
              <RefreshCw className="w-3 h-3" />
            </button>
            {pendingInvs.length > 0 && (
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <AlertTriangle className="w-3 h-3 text-destructive" />
                {t('billing.unpaid', { n: pendingInvs.length })}
              </span>
            )}
            <label className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground">
              <input
                type="checkbox"
                checked={sub.paymentPlanAllowed}
                disabled={togglingPlan}
                onChange={(e) => togglePaymentPlan(e.target.checked)}
              />
              {t('billing.allowPlan')}
            </label>
            <button
              type="button"
              onClick={openCharge}
              className="tw-btn-primary flex items-center gap-1 px-2 py-1 text-[10px] font-semibold rounded-md"
            >
              <Plus className="w-3 h-3" /> {t('billing.charge')}
            </button>
          </div>
        </div>
        {sub.invoices.length === 0 ? (
          <p className="px-4 py-8 text-xs text-muted-foreground text-center">{t('billing.none')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-left text-[10px] text-muted-foreground uppercase tracking-wider">
                  <th className="px-4 py-2.5 font-medium">{t('billing.invoice')}</th>
                  <th className="px-4 py-2.5 font-medium">{t('billing.product')}</th>
                  <th className="px-4 py-2.5 font-medium">{t('billing.value')}</th>
                  <th className="px-4 py-2.5 font-medium">{t('billing.status')}</th>
                  <th className="px-4 py-2.5 font-medium" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sub.invoices.map((inv) => {
                  const display = resolveInvoiceDisplayStatus(inv)
                  const st = INVOICE_STATUS_BADGE[display]
                  const unpaid = display === 'PENDING' || display === 'OVERDUE'
                  const canRemove = display !== 'PAID'
                  return (
                      <tr key={inv.id} className="hover:bg-muted/30">
                        <td className="px-4 py-3">
                          <p className="font-mono text-[11px] font-semibold text-foreground">
                            {formatInvoiceNumber(inv.id, inv.createdAt)}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {t(INVOICE_TYPE_KEY[inv.type])}
                            {inv.installmentNo ? ` · ${inv.installmentNo}` : ''}
                          </p>
                          {inv.notes && <p className="text-[10px] text-muted-foreground mt-1">{inv.notes}</p>}
                          {inv.paymentUrl && unpaid && (
                            <a
                              href={inv.paymentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-foreground transition truncate max-w-[220px] mt-1"
                            >
                              <ExternalLink className="w-3 h-3 shrink-0" />
                              <span className="truncate">{inv.paymentUrl}</span>
                            </a>
                          )}
                        </td>
                        <td className="px-4 py-3 text-foreground">{sub.product}</td>
                        <td className="px-4 py-3 font-mono text-foreground">{formatBRL(inv.amount)}</td>
                        <td className="px-4 py-3">
                          <span className={st}>{t(INVOICE_STATUS_KEY[display])}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-nowrap items-center justify-end gap-1.5">
                              {unpaid && (
                              <DropdownMenu>
                                <DropdownMenuTrigger
                                  disabled={!!sending || !!removing}
                                  className="tw-btn-primary inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold rounded-md whitespace-nowrap disabled:opacity-50"
                                >
                                  {sending?.startsWith(`${inv.id}-`)
                                    ? <Loader2 className="w-3 h-3 animate-spin" />
                                    : <CreditCard className="w-3 h-3" />}
                                  {sending === `${inv.id}-asaas`
                                    ? t('billing.asaasBusy')
                                    : sending === `${inv.id}-stripe`
                                      ? t('billing.stripeBusy')
                                      : t('billing.pay')}
                                  <ChevronDown className="w-3 h-3" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    disabled={!!sending}
                                    onClick={() => sendPaymentLink(inv.id, 'stripe')}
                                  >
                                    {inv.paymentGateway === 'STRIPE' ? t('billing.stripeRegen') : t('billing.stripe')}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    disabled={!!sending}
                                    onClick={() => sendPaymentLink(inv.id, 'asaas')}
                                  >
                                    {inv.paymentGateway === 'ASAAS' ? t('billing.asaasRegen') : t('billing.asaas')}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                              )}
                              {canRemove && (
                                <button
                                  type="button"
                                  onClick={() => removeInvoice(inv)}
                                  disabled={!!removing || !!sending}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold rounded-md whitespace-nowrap border border-border text-destructive hover:bg-muted disabled:opacity-50"
                                >
                                  {removing === inv.id
                                    ? <Loader2 className="w-3 h-3 animate-spin" />
                                    : <Trash2 className="w-3 h-3" />}
                                  {removing === inv.id ? t('billing.removing') : t('billing.remove')}
                                </button>
                              )}
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

      <Dialog open={chargeOpen} onOpenChange={setChargeOpen}>
        <DialogContent className="sm:max-w-md" showCloseButton>
          <DialogHeader>
            <DialogTitle>{t('billing.chargeTitle')}</DialogTitle>
            <DialogDescription>{t('billing.chargeDesc')}</DialogDescription>
          </DialogHeader>
          <form onSubmit={createCharge} className="space-y-3">
            <label className="block space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{t('billing.chargeType')}</span>
              <select
                value={charge.type}
                onChange={(e) => {
                  const type = e.target.value as ChargeType
                  setCharge((c) => ({
                    ...c,
                    type,
                    amount: type === 'INSTALLATION' && sub ? String(getInstallationFee(regionOf(sub))) : c.amount,
                  }))
                }}
                className="w-full px-3 py-2 bg-muted border border-border rounded-md text-xs text-foreground"
              >
                <option value="INSTALLATION">{t('billing.inv.installation')}</option>
                <option value="IMPORTATION">{t('billing.inv.importation')}</option>
                <option value="CUSTOM">{t('billing.inv.custom')}</option>
              </select>
            </label>
            <label className="block space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{t('billing.amount')}</span>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={charge.amount}
                onChange={(e) => setCharge((c) => ({ ...c, amount: e.target.value }))}
                className="w-full px-3 py-2 bg-muted border border-border rounded-md text-xs text-foreground"
                required
              />
            </label>
            <label className="block space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{t('billing.dueDate')}</span>
              <input
                type="date"
                value={charge.dueDate}
                onChange={(e) => setCharge((c) => ({ ...c, dueDate: e.target.value }))}
                className="w-full px-3 py-2 bg-muted border border-border rounded-md text-xs text-foreground"
                required
              />
            </label>
            <label className="block space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{t('billing.notes')}</span>
              <input
                value={charge.notes}
                onChange={(e) => setCharge((c) => ({ ...c, notes: e.target.value }))}
                placeholder={t('billing.notesPlaceholder')}
                className="w-full px-3 py-2 bg-muted border border-border rounded-md text-xs text-foreground"
              />
            </label>
            {sub.paymentPlanAllowed ? (
              <>
                <label className="flex items-center gap-2 text-xs text-foreground">
                  <input
                    type="checkbox"
                    checked={charge.split}
                    onChange={(e) => setCharge((c) => ({ ...c, split: e.target.checked }))}
                  />
                  {t('billing.splitPlan')}
                </label>
                {charge.split && (
                  <div className="grid grid-cols-2 gap-2">
                    <label className="block space-y-1">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{t('billing.installments')}</span>
                      <input
                        type="number"
                        min={2}
                        max={12}
                        value={charge.installments}
                        onChange={(e) => setCharge((c) => ({ ...c, installments: e.target.value }))}
                        className="w-full px-3 py-2 bg-muted border border-border rounded-md text-xs text-foreground"
                      />
                    </label>
                    <label className="block space-y-1">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{t('billing.intervalDays')}</span>
                      <input
                        type="number"
                        min={1}
                        max={90}
                        value={charge.intervalDays}
                        onChange={(e) => setCharge((c) => ({ ...c, intervalDays: e.target.value }))}
                        className="w-full px-3 py-2 bg-muted border border-border rounded-md text-xs text-foreground"
                      />
                    </label>
                  </div>
                )}
              </>
            ) : (
              <p className="text-[10px] text-muted-foreground">{t('billing.planOffHint')}</p>
            )}
            {chargeError && <p className="text-xs text-destructive">{chargeError}</p>}
            <DialogFooter>
              <button
                type="button"
                onClick={() => setChargeOpen(false)}
                className="px-3 py-1.5 text-xs font-semibold rounded-md border border-border text-foreground hover:bg-muted"
              >
                {t('licenses.cancel')}
              </button>
              <button
                type="submit"
                disabled={savingCharge}
                className="tw-btn-primary px-3 py-1.5 text-xs font-semibold rounded-md disabled:opacity-50"
              >
                {savingCharge ? t('billing.creatingCharge') : t('billing.createCharge')}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
