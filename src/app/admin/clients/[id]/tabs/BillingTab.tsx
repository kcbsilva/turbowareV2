'use client'

import { useState, useEffect, useCallback } from 'react'
import { CheckCircle, AlertTriangle, Clock, RefreshCw, Loader2, CreditCard, ExternalLink, Send } from 'lucide-react'
import { formatBRL, getMonthlyPrice } from '@/lib/pricing'

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
  TRIAL:           'bg-blue-500/10 text-blue-400 border-blue-500/20',
  PENDING_PAYMENT: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  ACTIVE:          'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  SUSPENDED:       'bg-red-500/10 text-red-400 border-red-500/20',
  CANCELLED:       'bg-muted/50 text-muted-foreground border-border',
}

const INVOICE_TYPE_LABEL = {
  INSTALLATION: 'Installation fee',
  MONTHLY:      'Monthly subscription',
  PRORATED:     'Prorated charge',
  GRACE_FEE:    'Grace period fee',
}

interface Props { clientId: string }

export function BillingTab({ clientId }: Props) {
  const [sub, setSub]           = useState<Subscription | null | undefined>(undefined)
  const [loading, setLoading]   = useState(true)
  const [paying, setPaying]     = useState<string | null>(null)
  const [sending, setSending]   = useState<string | null>(null)  // `${invoiceId}-asaas` | `${invoiceId}-stripe`

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
        alert(data.error || 'Failed to create payment link')
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
        <p className="text-xs">No subscription — client hasn't activated yet.</p>
      </div>
    )
  }

  const pendingInvs = sub.invoices.filter((i) => i.status === 'PENDING')
  const paidInvs    = sub.invoices.filter((i) => i.status === 'PAID')
  const card = 'bg-card border border-border rounded-lg'

  return (
    <div className="space-y-4">

      {/* Subscription overview */}
      <div className={card}>
        <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
          <h2 className="text-[10px] font-semibold text-foreground uppercase tracking-wider">Subscription</h2>
          <button onClick={load} className="text-muted-foreground hover:text-foreground transition" title="Refresh">
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>
        <div className="px-4 py-3 grid grid-cols-2 gap-3 text-xs">
          <div>
            <dt className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Status</dt>
            <dd>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-semibold ${STATUS_STYLES[sub.status]}`}>
                {sub.status.replace('_', ' ')}
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Product</dt>
            <dd className="font-medium text-foreground">{sub.product}</dd>
          </div>
          <div>
            <dt className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Users</dt>
            <dd className="font-medium text-foreground">{sub.seats.toLocaleString()} seats</dd>
          </div>
          <div>
            <dt className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Monthly</dt>
            <dd className="font-medium text-foreground">{monthly ? formatBRL(monthly) : 'Enterprise'}</dd>
          </div>
          <div>
            <dt className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Billing day</dt>
            <dd className="font-medium text-foreground">Day {sub.billingDate}</dd>
          </div>
          {sub.trialEndsAt && (
            <div>
              <dt className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Trial ends</dt>
              <dd className="font-medium text-foreground">{new Date(sub.trialEndsAt).toLocaleDateString('pt-BR')}</dd>
            </div>
          )}
          {sub.license && (
            <div className="col-span-2">
              <dt className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">License key</dt>
              <dd className="font-mono text-xs text-foreground">{sub.license.key}</dd>
            </div>
          )}
        </div>
      </div>

      {/* Pending invoices — admin can mark as paid */}
      {pendingInvs.length > 0 && (
        <div className={`${card} border-yellow-500/20`}>
          <div className="px-4 py-2.5 border-b border-yellow-500/20 flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" />
            <h2 className="text-[10px] font-semibold text-foreground uppercase tracking-wider">Pending Invoices</h2>
          </div>
          <div className="divide-y divide-border">
            {pendingInvs.map((inv) => (
              <div key={inv.id} className="px-4 py-3 space-y-2">
                {/* Invoice info + amount */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground">{INVOICE_TYPE_LABEL[inv.type]}</p>
                    {inv.notes && <p className="text-[10px] text-muted-foreground truncate">{inv.notes}</p>}
                    <p className="text-[10px] text-muted-foreground">Due: {new Date(inv.dueDate).toLocaleDateString('pt-BR')}</p>
                    {inv.paymentGateway && (
                      <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                        Gateway: {inv.paymentGateway}
                        {inv.externalPaymentId && ` · ${inv.externalPaymentId}`}
                      </p>
                    )}
                  </div>
                  <p className="text-sm font-bold font-mono text-yellow-400 shrink-0">{formatBRL(inv.amount)}</p>
                </div>

                {/* Existing payment link */}
                {inv.paymentUrl && (
                  <a
                    href={inv.paymentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-[10px] text-blue-400 hover:text-blue-300 transition truncate"
                  >
                    <ExternalLink className="w-3 h-3 shrink-0" />
                    <span className="truncate">{inv.paymentUrl}</span>
                  </a>
                )}

                {/* Action buttons */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {/* Mark Paid (manual) */}
                  <button
                    onClick={() => markPaid(inv.id)}
                    disabled={paying === inv.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold rounded-md transition hover:opacity-90 disabled:opacity-50"
                    style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}
                  >
                    {paying === inv.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                    {paying === inv.id ? 'Marking…' : 'Mark Paid'}
                  </button>

                  {/* Send Asaas link */}
                  <button
                    onClick={() => sendPaymentLink(inv.id, 'asaas')}
                    disabled={!!sending}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold rounded-md border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 transition disabled:opacity-50"
                  >
                    {sending === `${inv.id}-asaas` ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                    {sending === `${inv.id}-asaas` ? 'Gerando…' : inv.paymentGateway === 'ASAAS' ? 'Regenerar Asaas' : 'Asaas (Pix/Boleto)'}
                  </button>

                  {/* Send Stripe link */}
                  <button
                    onClick={() => sendPaymentLink(inv.id, 'stripe')}
                    disabled={!!sending}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold rounded-md border border-violet-500/30 text-violet-400 hover:bg-violet-500/10 transition disabled:opacity-50"
                  >
                    {sending === `${inv.id}-stripe` ? <Loader2 className="w-3 h-3 animate-spin" /> : <CreditCard className="w-3 h-3" />}
                    {sending === `${inv.id}-stripe` ? 'Creating…' : inv.paymentGateway === 'STRIPE' ? 'Regenerate Stripe' : 'Stripe (Intl.)'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grace period info */}
      {sub.gracePeriodUsedAt && (
        <div className={card}>
          <div className="px-4 py-2.5 border-b border-border flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
            <h2 className="text-[10px] font-semibold text-foreground uppercase tracking-wider">Grace Period</h2>
          </div>
          <div className="px-4 py-3 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last activated</span>
              <span className="text-foreground">{new Date(sub.gracePeriodUsedAt).toLocaleDateString('pt-BR')}</span>
            </div>
            {sub.gracePeriodEndsAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Expires</span>
                <span className={new Date(sub.gracePeriodEndsAt) > new Date() ? 'text-yellow-400' : 'text-muted-foreground'}>
                  {new Date(sub.gracePeriodEndsAt).toLocaleDateString('pt-BR')}
                  {new Date(sub.gracePeriodEndsAt) > new Date() ? ' (active)' : ' (expired)'}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payment history */}
      {paidInvs.length > 0 && (
        <div className={card}>
          <div className="px-4 py-2.5 border-b border-border">
            <h2 className="text-[10px] font-semibold text-foreground uppercase tracking-wider">Payment History</h2>
          </div>
          <div className="divide-y divide-border">
            {paidInvs.map((inv) => (
              <div key={inv.id} className="px-4 py-3 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-medium text-foreground">{INVOICE_TYPE_LABEL[inv.type]}</p>
                  <p className="text-[10px] text-muted-foreground">Paid {inv.paidAt ? new Date(inv.paidAt).toLocaleDateString('pt-BR') : '—'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-foreground">{formatBRL(inv.amount)}</span>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
