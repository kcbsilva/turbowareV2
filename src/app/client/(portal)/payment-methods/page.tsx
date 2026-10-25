'use client'

import { useState, useEffect } from 'react'
import { CreditCard, ExternalLink, CheckCircle, Clock, AlertTriangle, FileText, Loader2 } from 'lucide-react'
import { formatBRL } from '@/lib/pricing'
import { useClientLang } from '@/components/client/ClientLangProvider'
import { clientDateLocale, type ClientMsgKey } from '@/lib/client-i18n'

type InvoiceStatus = 'PENDING' | 'PAID' | 'OVERDUE' | 'WAIVED'
type InvoiceType = 'INSTALLATION' | 'MONTHLY' | 'PRORATED' | 'GRACE_FEE' | 'IMPORTATION' | 'CUSTOM'
type Gateway = 'ASAAS' | 'STRIPE'

interface Invoice {
  id: string; type: InvoiceType; amount: number; status: InvoiceStatus
  dueDate: string; paidAt: string | null; notes: string | null
  paymentUrl: string | null; paymentGateway: Gateway | null
}

interface Subscription { region: string | null; invoices: Invoice[] }

const STATUS_KEY: Record<InvoiceStatus, ClientMsgKey> = {
  PENDING: 'status.PENDING_INV',
  PAID: 'status.PAID',
  OVERDUE: 'status.OVERDUE',
  WAIVED: 'status.WAIVED',
}

const STATUS_STYLE: Record<InvoiceStatus, { cls: string; icon: React.ElementType }> = {
  PENDING: { cls: 'text-yellow-400', icon: Clock },
  PAID: { cls: 'text-emerald-400', icon: CheckCircle },
  OVERDUE: { cls: 'text-red-400', icon: AlertTriangle },
  WAIVED: { cls: 'text-white/30', icon: FileText },
}

export default function PaymentMethodsPage() {
  const { lang, t } = useClientLang()
  const [sub, setSub] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid'>('all')
  const locale = clientDateLocale(lang)

  useEffect(() => {
    fetch('/api/client/subscription')
      .then(r => r.ok ? r.json() : null)
      .then(setSub)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center min-h-[calc(100vh-56px)]">
      <Loader2 className="w-6 h-6 animate-spin text-white/30" />
    </div>
  )

  if (!sub) return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h1 className="text-lg font-bold text-white mb-6">{t('billing.title')}</h1>
      <div className="bg-white/3 border border-white/8 rounded-xl flex flex-col items-center justify-center py-16 text-center gap-3">
        <CreditCard className="w-10 h-10 text-white/10" />
        <p className="text-sm text-white/40">{t('billing.emptyTitle')}</p>
        <p className="text-xs text-white/20">{t('billing.emptyBody')}</p>
      </div>
    </div>
  )

  const isBR = sub.region === 'BR' || !sub.region
  const gateway = isBR ? t('billing.gatewayBr') : t('billing.gatewayIntl')
  const invoices = sub.invoices ?? []
  const filtered = filter === 'all' ? invoices : invoices.filter(i => filter === 'pending' ? ['PENDING', 'OVERDUE'].includes(i.status) : i.status === 'PAID')
  const pending = invoices.filter(i => ['PENDING', 'OVERDUE'].includes(i.status))
  const total = pending.reduce((s, i) => s + i.amount, 0)
  const money = (amount: number) => isBR ? formatBRL(amount) : `$${amount.toFixed(2)}`
  const filters = [
    { id: 'all' as const, label: t('billing.all') },
    { id: 'pending' as const, label: t('billing.pending') },
    { id: 'paid' as const, label: t('billing.paid') },
  ]

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
      <h1 className="text-lg font-bold text-white">{t('billing.title')}</h1>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/3 border border-white/8 rounded-xl p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30 mb-1">{t('billing.method')}</p>
          <p className="text-sm font-medium text-white">{gateway}</p>
          <p className="text-[10px] text-white/30 mt-1">{t('billing.methodHint')}</p>
        </div>
        <div className={`border rounded-xl p-4 ${total > 0 ? 'bg-yellow-500/5 border-yellow-500/20' : 'bg-white/3 border-white/8'}`}>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30 mb-1">{t('billing.outstanding')}</p>
          <p className={`text-sm font-bold font-mono ${total > 0 ? 'text-yellow-400' : 'text-emerald-400'}`}>
            {money(total)}
          </p>
          <p className="text-[10px] text-white/30 mt-1">
            {pending.length === 1 ? t('billing.pendingOne', { n: pending.length }) : t('billing.pendingMany', { n: pending.length })}
          </p>
        </div>
      </div>

      <div className="flex gap-1 bg-white/3 border border-white/8 rounded-lg p-1 w-fit">
        {filters.map(item => (
          <button key={item.id} onClick={() => setFilter(item.id)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${filter === item.id ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/60'}`}>
            {item.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white/3 border border-white/8 rounded-xl flex flex-col items-center justify-center py-12 text-center gap-2">
          <FileText className="w-8 h-8 text-white/10" />
          <p className="text-sm text-white/30">{t('billing.none')}</p>
        </div>
      ) : (
        <div className="bg-white/3 border border-white/8 rounded-xl divide-y divide-white/5">
          {filtered.map(inv => {
            const { cls, icon: Icon } = STATUS_STYLE[inv.status]
            const when = inv.status === 'PAID' && inv.paidAt
              ? t('dash.paidOn', { date: new Date(inv.paidAt).toLocaleDateString(locale) })
              : t('dash.due', { date: new Date(inv.dueDate).toLocaleDateString(locale) })
            return (
              <div key={inv.id} className="px-4 py-3.5 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${cls}`} />
                  <div>
                    <p className="text-sm font-medium text-white">{t(`invoice.${inv.type}` as ClientMsgKey)}</p>
                    {inv.notes && <p className="text-[10px] text-white/30">{inv.notes}</p>}
                    <p className="text-[10px] text-white/20 mt-0.5">
                      {when}
                      {inv.paymentGateway && ` · ${inv.paymentGateway === 'ASAAS' ? t('billing.pixShort') : 'Stripe'}`}
                      {' · '}{t(STATUS_KEY[inv.status])}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <p className={`text-sm font-bold font-mono ${cls}`}>{money(inv.amount)}</p>
                  {inv.paymentUrl && (inv.status === 'PENDING' || inv.status === 'OVERDUE') && (
                    <a href={inv.paymentUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold rounded-md transition hover:opacity-90"
                      style={{ backgroundColor: '#fff', color: '#000' }}>
                      <ExternalLink className="w-3 h-3" /> {t('dash.payNow')}
                    </a>
                  )}
                  {!inv.paymentUrl && (inv.status === 'PENDING' || inv.status === 'OVERDUE') && (
                    <span className="text-[10px] text-white/20">{t('billing.linkPending')}</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
