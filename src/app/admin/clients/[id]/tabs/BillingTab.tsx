'use client'

import { useState, useEffect, useCallback, Fragment } from 'react'
import { CheckCircle, AlertTriangle, Clock, RefreshCw, Loader2, CreditCard, ExternalLink, Send } from 'lucide-react'
import { formatBRL, getMonthlyPrice } from '@/lib/pricing'
import { badge } from '@/lib/badges'
import { ExtendGraceDialog } from '@/components/ExtendGraceDialog'
import { MAX_ADMIN_GRACE_DAYS } from '@/lib/grace-period'
import { formatInvoiceNumber, resolveInvoiceDisplayStatus } from '@/lib/invoice-display'
import { useAdminLang } from '@/components/admin/AdminLangProvider'
import { dateLocale } from '@/lib/admin-i18n'
import type { MsgKey } from '@/lib/admin-i18n'

interface Invoice {
  id: string
  type: 'INSTALLATION' | 'MONTHLY' | 'PRORATED' | 'GRACE_FEE'
  amount: number
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'WAIVED'
  dueDate: string
  paidAt: string | null
  notes: string | null
  paymentUrl: string | null
  paymentGateway: 'ASAAS' | 'STRIPE' | null
  externalPaymentId: string | null
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
  invoices: Invoice[]
  license: { key: string; status: string; maxSeats: number } | null
}

const STATUS_STYLES = {
  TRIAL:           badge.sky,
  PENDING_PAYMENT: badge.peach,
  ACTIVE:          badge.teal,
  SUSPENDED:       badge.coral,
  CANCELLED:       badge.mute,
}

const INVOICE_TYPE_KEY = {
  INSTALLATION: 'billing.inv.installation',
  MONTHLY:      'billing.inv.monthly',
  PRORATED:     'billing.inv.prorated',
  GRACE_FEE:    'billing.inv.grace',
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

const SUB_STATUS_KEY = {
  TRIAL:           'billing.sub.trial',
  PENDING_PAYMENT: 'billing.sub.pending',
  ACTIVE:          'billing.sub.active',
  SUSPENDED:       'billing.sub.suspended',
  CANCELLED:       'billing.sub.cancelled',
} as const satisfies Record<string, MsgKey>

interface Props { clientId: string }

export function BillingTab({ clientId }: Props) {
  const { t, lang } = useAdminLang()
  const [sub, setSub]           = useState<Subscription | null | undefined>(undefined)
  const [loading, setLoading]   = useState(true)
  const [paying, setPaying]     = useState<string | null>(null)
  const [sending, setSending]   = useState<string | null>(null)  // `${invoiceId}-asaas` | `${invoiceId}-stripe`
  const [graceOpen, setGraceOpen] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/admin/clients/${clientId}/subscription`)
    if (res.ok) setSub(await res.json())
    setLoading(false)
  }, [clientId])

  useEffect(() => { load() }, [load])

  async function markPaid(invoiceId: string) {
    setPaying(invoiceId)
    await fetch(`/api/admin/clients/${clientId}/subscription/invoices/${invoiceId}/pay`, { method: 'POST' })
    setPaying(null)
    load()
  }

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

  const monthly = sub ? getMonthlyPrice(sub.seats) : null

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

      {/* Subscription overview */}
      <div className={card}>
        <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
          <h2 className="text-[10px] font-semibold text-foreground uppercase tracking-wider">{t('billing.subscription')}</h2>
          <div className="flex items-center gap-2">
            {sub.status !== 'CANCELLED' && (
              <button
                type="button"
                onClick={() => setGraceOpen(true)}
                className="rounded-md border border-border px-2 py-1 text-[10px] font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {t('billing.extendGrace')}
              </button>
            )}
            <button onClick={load} className="text-muted-foreground hover:text-foreground transition" title={t('billing.refresh')}>
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>
        </div>
        <div className="px-4 py-3 grid grid-cols-2 gap-3 text-xs">
          <div>
            <dt className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">{t('billing.status')}</dt>
            <dd>
              <span className={STATUS_STYLES[sub.status]}>
                {t(SUB_STATUS_KEY[sub.status])}
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">{t('billing.product')}</dt>
            <dd className="font-medium text-foreground">{sub.product}</dd>
          </div>
          <div>
            <dt className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">{t('billing.users')}</dt>
            <dd className="font-medium text-foreground">{t('billing.seats', { n: sub.seats.toLocaleString(dateLocale(lang)) })}</dd>
          </div>
          <div>
            <dt className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">{t('billing.monthly')}</dt>
            <dd className="font-medium text-foreground">{monthly ? formatBRL(monthly) : t('billing.enterprise')}</dd>
          </div>
          <div>
            <dt className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">{t('billing.billingDay')}</dt>
            <dd className="font-medium text-foreground">{t('billing.day', { n: sub.billingDate })}</dd>
          </div>
          {sub.trialEndsAt && (
            <div>
              <dt className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">{t('billing.trialEnds')}</dt>
              <dd className="font-medium text-foreground">{new Date(sub.trialEndsAt).toLocaleDateString(dateLocale(lang))}</dd>
            </div>
          )}
          {sub.license && (
            <div className="col-span-2">
              <dt className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">{t('billing.licenseKey')}</dt>
              <dd className="font-mono text-xs text-foreground">{sub.license.key}</dd>
            </div>
          )}
        </div>
      </div>

      {/* Invoices */}
      <div className={card}>
        <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
          <h2 className="text-[10px] font-semibold text-foreground uppercase tracking-wider">{t('billing.invoices')}</h2>
          {pendingInvs.length > 0 && (
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <AlertTriangle className="w-3 h-3 text-destructive" />
              {t('billing.unpaid', { n: pendingInvs.length })}
            </span>
          )}
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
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sub.invoices.map((inv) => {
                  const display = resolveInvoiceDisplayStatus(inv)
                  const st = INVOICE_STATUS_BADGE[display]
                  const unpaid = display === 'PENDING' || display === 'OVERDUE'
                  return (
                    <Fragment key={inv.id}>
                      <tr className="hover:bg-muted/30">
                        <td className="px-4 py-3">
                          <p className="font-mono text-[11px] font-semibold text-foreground">
                            {formatInvoiceNumber(inv.id, inv.createdAt)}
                          </p>
                          <p className="text-[10px] text-muted-foreground">{t(INVOICE_TYPE_KEY[inv.type])}</p>
                        </td>
                        <td className="px-4 py-3 text-foreground">{sub.product}</td>
                        <td className="px-4 py-3 font-mono text-foreground">{formatBRL(inv.amount)}</td>
                        <td className="px-4 py-3">
                          <span className={st}>{t(INVOICE_STATUS_KEY[display])}</span>
                        </td>
                      </tr>
                      {unpaid && (
                        <tr>
                          <td colSpan={4} className="px-4 pb-3 pt-0">
                            {inv.notes && <p className="text-[10px] text-muted-foreground mb-2">{inv.notes}</p>}
                            {inv.paymentUrl && (
                              <a
                                href={inv.paymentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-foreground transition truncate mb-2"
                              >
                                <ExternalLink className="w-3 h-3 shrink-0" />
                                <span className="truncate">{inv.paymentUrl}</span>
                              </a>
                            )}
                            <div className="flex flex-wrap items-center gap-1.5">
                              <button
                                onClick={() => markPaid(inv.id)}
                                disabled={paying === inv.id}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold rounded-md transition hover:opacity-90 disabled:opacity-50"
                                style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}
                              >
                                {paying === inv.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                                {paying === inv.id ? t('billing.marking') : t('billing.markPaid')}
                              </button>
                              <button
                                onClick={() => sendPaymentLink(inv.id, 'asaas')}
                                disabled={!!sending}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold rounded-md border border-border text-foreground hover:bg-muted transition disabled:opacity-50"
                              >
                                {sending === `${inv.id}-asaas` ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                                {sending === `${inv.id}-asaas` ? t('billing.asaasBusy') : inv.paymentGateway === 'ASAAS' ? t('billing.asaasRegen') : t('billing.asaas')}
                              </button>
                              <button
                                onClick={() => sendPaymentLink(inv.id, 'stripe')}
                                disabled={!!sending}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold rounded-md border border-violet-500/30 text-violet-400 hover:bg-violet-500/10 transition disabled:opacity-50"
                              >
                                {sending === `${inv.id}-stripe` ? <Loader2 className="w-3 h-3 animate-spin" /> : <CreditCard className="w-3 h-3" />}
                                {sending === `${inv.id}-stripe` ? t('billing.stripeBusy') : inv.paymentGateway === 'STRIPE' ? t('billing.stripeRegen') : t('billing.stripe')}
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ExtendGraceDialog
        open={graceOpen}
        onOpenChange={setGraceOpen}
        currentEndsAt={sub.gracePeriodEndsAt}
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

      {/* Grace period info */}
      {sub.gracePeriodUsedAt && (
        <div className={card}>
          <div className="px-4 py-2.5 border-b border-border flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
            <h2 className="text-[10px] font-semibold text-foreground uppercase tracking-wider">{t('billing.grace')}</h2>
          </div>
          <div className="px-4 py-3 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('billing.lastActivated')}</span>
              <span className="text-foreground">{new Date(sub.gracePeriodUsedAt).toLocaleDateString(dateLocale(lang))}</span>
            </div>
            {sub.gracePeriodEndsAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('billing.expires')}</span>
                <span className="text-muted-foreground">
                  {new Date(sub.gracePeriodEndsAt).toLocaleDateString(dateLocale(lang))}
                  {new Date(sub.gracePeriodEndsAt) > new Date() ? ` ${t('billing.active')}` : ` ${t('billing.expired')}`}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
