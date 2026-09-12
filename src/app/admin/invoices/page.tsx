'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Receipt, Loader2 } from 'lucide-react'

interface InvoiceRow {
  id: string
  type: string
  amount: number
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'WAIVED'
  dueDate: string
  paidAt: string | null
  paymentGateway: string | null
  subscription: {
    product: string
    status: string
    client: { id: string; name: string; company: string | null }
  }
}

const STATUS_CLS: Record<InvoiceRow['status'], string> = {
  PENDING: 'text-yellow-400 border-yellow-800 bg-yellow-950/40',
  PAID: 'text-emerald-400 border-emerald-800 bg-emerald-950/40',
  OVERDUE: 'text-red-400 border-red-900 bg-red-950/40',
  WAIVED: 'text-muted-foreground border-border bg-muted/50',
}

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
                <th className="px-4 py-2.5 font-medium">Client</th>
                <th className="px-4 py-2.5 font-medium">Type</th>
                <th className="px-4 py-2.5 font-medium">Amount</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium">Due</th>
                <th className="px-4 py-2.5 font-medium">Gateway</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <Link href={`/admin/clients/${inv.subscription.client.id}`} className="text-primary hover:underline font-medium">
                      {inv.subscription.client.company || inv.subscription.client.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-foreground">{inv.type.replace('_', ' ')}</td>
                  <td className="px-4 py-3 font-mono text-foreground">{inv.amount.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full border text-[10px] font-medium ${STATUS_CLS[inv.status]}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(inv.dueDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-muted-foreground">{inv.paymentGateway || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
