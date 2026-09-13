'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Receipt, Loader2 } from 'lucide-react'
import { badge } from '@/lib/badges'
import { formatInvoiceNumber, resolveInvoiceDisplayStatus } from '@/lib/invoice-display'

interface InvoiceRow {
  id: string
  type: string
  amount: number
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'WAIVED'
  dueDate: string
  paidAt: string | null
  createdAt: string
  paymentGateway: string | null
  subscription: {
    product: string
    status: string
    client: { id: string; name: string; company: string | null }
  }
}

const STATUS_CLS = {
  PENDING: { cls: badge.pending, label: 'Pending' },
  PAID: { cls: badge.paid, label: 'Paid' },
  OVERDUE: { cls: badge.overdue, label: 'Overdue' },
  WAIVED: { cls: badge.mute, label: 'Waived' },
} as const

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceRow[]>([])
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const qs = status ? `?status=${status}` : ''
    const res = await fetch(`/api/admin/invoices${qs}`, { cache: 'no-store' })
    if (res.ok) setInvoices(await res.json())
    setLoading(false)
  }, [status])

  useEffect(() => { load() }, [load])

  return (
    <div className="h-full flex flex-col p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'hsl(var(--accent)/0.12)' }}>
            <Receipt className="w-4 h-4" style={{ color: 'hsl(var(--accent))' }} />
          </div>
          <div>
            <h1 className="text-base font-bold text-foreground">Invoices</h1>
            <p className="text-[11px] text-muted-foreground">All subscription invoices — mark paid from the client billing tab.</p>
          </div>
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-1.5 bg-card border border-border rounded-md text-xs"
        >
          <option value="">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="OVERDUE">Overdue</option>
          <option value="PAID">Paid</option>
          <option value="WAIVED">Waived</option>
        </select>
      </div>

      <div className="flex-1 bg-card border border-border rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : invoices.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-16">No invoices found.</p>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-left text-[10px] text-muted-foreground uppercase tracking-wider">
                <th className="px-4 py-2.5 font-medium">Invoice</th>
                <th className="px-4 py-2.5 font-medium">Client</th>
                <th className="px-4 py-2.5 font-medium">Product</th>
                <th className="px-4 py-2.5 font-medium">Value</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium">Due</th>
                <th className="px-4 py-2.5 font-medium">Gateway</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {invoices.map((inv) => {
                const display = resolveInvoiceDisplayStatus(inv)
                const st = STATUS_CLS[display]
                return (
                <tr key={inv.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono text-[11px] font-semibold text-foreground">
                    {formatInvoiceNumber(inv.id, inv.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/clients/${inv.subscription.client.id}`} className="text-primary hover:underline font-medium">
                      {inv.subscription.client.company || inv.subscription.client.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-foreground">{inv.subscription.product}</td>
                  <td className="px-4 py-3 font-mono text-foreground">{inv.amount.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={st.cls}>
                      {st.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(inv.dueDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-muted-foreground">{inv.paymentGateway || '—'}</td>
                </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
