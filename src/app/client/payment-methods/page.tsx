'use client'

import { useState, useEffect } from 'react'
import { CreditCard, ExternalLink, CheckCircle, Clock, AlertTriangle, FileText, Loader2 } from 'lucide-react'
import { formatBRL } from '@/lib/pricing'

type InvoiceStatus = 'PENDING' | 'PAID' | 'OVERDUE' | 'WAIVED'
type InvoiceType   = 'INSTALLATION' | 'MONTHLY' | 'PRORATED' | 'GRACE_FEE'
type Gateway       = 'ASAAS' | 'STRIPE'

interface Invoice {
  id: string; type: InvoiceType; amount: number; status: InvoiceStatus
  dueDate: string; paidAt: string | null; notes: string | null
  paymentUrl: string | null; paymentGateway: Gateway | null
}

interface Subscription { region: string | null; invoices: Invoice[] }

const TYPE_LABEL: Record<InvoiceType, string> = {
  INSTALLATION: 'Installation fee', MONTHLY: 'Monthly subscription',
  PRORATED: 'Prorated charge', GRACE_FEE: 'Grace period fee',
}

const STATUS_STYLE: Record<InvoiceStatus, { cls: string; icon: React.ElementType; label: string }> = {
  PENDING: { cls: 'text-yellow-400', icon: Clock,         label: 'Pending'  },
  PAID:    { cls: 'text-emerald-400', icon: CheckCircle,  label: 'Paid'     },
  OVERDUE: { cls: 'text-red-400',    icon: AlertTriangle, label: 'Overdue'  },
  WAIVED:  { cls: 'text-white/30',   icon: FileText,      label: 'Waived'   },
}

export default function PaymentMethodsPage() {
  const [sub, setSub]     = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid'>('all')

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
      <h1 className="text-lg font-bold text-white mb-6">Billing & Payments</h1>
      <div className="bg-white/3 border border-white/8 rounded-xl flex flex-col items-center justify-center py-16 text-center gap-3">
        <CreditCard className="w-10 h-10 text-white/10" />
        <p className="text-sm text-white/40">No subscription found</p>
        <p className="text-xs text-white/20">Contact your administrator to set up billing</p>
      </div>
    </div>
  )

  const isBR     = sub.region === 'BR' || !sub.region
  const gateway  = isBR ? 'Pix / Boleto / Cartão (Asaas)' : 'Credit card (Stripe)'
  const invoices = sub.invoices ?? []
  const filtered = filter === 'all' ? invoices : invoices.filter(i => filter === 'pending' ? ['PENDING', 'OVERDUE'].includes(i.status) : i.status === 'PAID')
  const pending  = invoices.filter(i => ['PENDING', 'OVERDUE'].includes(i.status))
  const total    = pending.reduce((s, i) => s + i.amount, 0)

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
      <h1 className="text-lg font-bold text-white">Billing & Payments</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/3 border border-white/8 rounded-xl p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30 mb-1">Payment method</p>
          <p className="text-sm font-medium text-white">{gateway}</p>
          <p className="text-[10px] text-white/30 mt-1">Links sent via email on invoice creation</p>
        </div>
        <div className={`border rounded-xl p-4 ${total > 0 ? 'bg-yellow-500/5 border-yellow-500/20' : 'bg-white/3 border-white/8'}`}>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30 mb-1">Outstanding</p>
          <p className={`text-sm font-bold font-mono ${total > 0 ? 'text-yellow-400' : 'text-emerald-400'}`}>
            {isBR ? formatBRL(total) : `$${total.toFixed(2)}`}
          </p>
          <p className="text-[10px] text-white/30 mt-1">{pending.length} pending invoice{pending.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-white/3 border border-white/8 rounded-lg p-1 w-fit">
        {(['all', 'pending', 'paid'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition capitalize ${filter === f ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/60'}`}>
            {f}
          </button>
        ))}
      </div>

      {/* Invoice list */}
      {filtered.length === 0 ? (
        <div className="bg-white/3 border border-white/8 rounded-xl flex flex-col items-center justify-center py-12 text-center gap-2">
          <FileText className="w-8 h-8 text-white/10" />
          <p className="text-sm text-white/30">No invoices</p>
        </div>
      ) : (
        <div className="bg-white/3 border border-white/8 rounded-xl divide-y divide-white/5">
          {filtered.map(inv => {
            const { cls, icon: Icon, label } = STATUS_STYLE[inv.status]
            return (
              <div key={inv.id} className="px-4 py-3.5 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${cls}`} />
                  <div>
                    <p className="text-sm font-medium text-white">{TYPE_LABEL[inv.type]}</p>
                    {inv.notes && <p className="text-[10px] text-white/30">{inv.notes}</p>}
                    <p className="text-[10px] text-white/20 mt-0.5">
                      {inv.status === 'PAID' && inv.paidAt
                        ? `Paid ${new Date(inv.paidAt).toLocaleDateString('pt-BR')}`
                        : `Due ${new Date(inv.dueDate).toLocaleDateString('pt-BR')}`}
                      {inv.paymentGateway && ` · ${inv.paymentGateway === 'ASAAS' ? 'Pix/Boleto/Cartão' : 'Stripe'}`}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <p className={`text-sm font-bold font-mono ${cls}`}>
                    {isBR ? formatBRL(inv.amount) : `$${inv.amount.toFixed(2)}`}
                  </p>
                  {inv.paymentUrl && inv.status === 'PENDING' && (
                    <a href={inv.paymentUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold rounded-md transition hover:opacity-90"
                      style={{ backgroundColor: '#fca311', color: '#081124' }}>
                      <ExternalLink className="w-3 h-3" /> Pay now
                    </a>
                  )}
                  {!inv.paymentUrl && inv.status === 'PENDING' && (
                    <span className="text-[10px] text-white/20">Link pending</span>
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
