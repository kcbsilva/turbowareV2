'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Receipt, Loader2 } from 'lucide-react'
import { badge } from '@/lib/badges'
import { formatInvoiceNumber, resolveInvoiceDisplayStatus } from '@/lib/invoice-display'
import { useAdminLang } from '@/components/admin/AdminLangProvider'
import { dateLocale, type MsgKey } from '@/lib/admin-i18n'

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

type InvoiceStatus = InvoiceRow['status']

const STATUS_CLS: Record<InvoiceStatus, string> = {
  PENDING: badge.pending,
  PAID: badge.paid,
  OVERDUE: badge.overdue,
  WAIVED: badge.mute,
}

const STATUS_KEY: Record<InvoiceStatus, MsgKey> = {
  PENDING: 'billing.pending',
  PAID: 'billing.paid',
  OVERDUE: 'billing.overdue',
  WAIVED: 'billing.waived',
}

export default function InvoicesPage() {
  const { t, lang } = useAdminLang()
  const locale = dateLocale(lang)
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
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-muted">
            <Receipt className="w-4 h-4 text-foreground" />
          </div>
          <div>
            <h1 className="text-base font-bold text-foreground">{t('title.invoices')}</h1>
            <p className="text-[11px] text-muted-foreground">{t('invoice.subtitle')}</p>
          </div>
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-1.5 bg-card border border-border rounded-md text-xs"
        >
          <option value="">{t('common.allStatuses')}</option>
          <option value="PENDING">{t('billing.pending')}</option>
          <option value="OVERDUE">{t('billing.overdue')}</option>
          <option value="PAID">{t('billing.paid')}</option>
          <option value="WAIVED">{t('billing.waived')}</option>
        </select>
      </div>

      <div className="flex-1 bg-card border border-border rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : invoices.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-16">{t('invoice.empty')}</p>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-left text-[10px] text-muted-foreground uppercase tracking-wider">
                <th className="px-4 py-2.5 font-medium">{t('billing.invoice')}</th>
                <th className="px-4 py-2.5 font-medium">{t('profile.client')}</th>
                <th className="px-4 py-2.5 font-medium">{t('billing.product')}</th>
                <th className="px-4 py-2.5 font-medium">{t('billing.value')}</th>
                <th className="px-4 py-2.5 font-medium">{t('billing.status')}</th>
                <th className="px-4 py-2.5 font-medium">{t('common.due')}</th>
                <th className="px-4 py-2.5 font-medium">{t('common.gateway')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {invoices.map((inv) => {
                const display = resolveInvoiceDisplayStatus(inv)
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
                  <td className="px-4 py-3 font-mono text-foreground">{inv.amount.toLocaleString(locale)}</td>
                  <td className="px-4 py-3">
                    <span className={STATUS_CLS[display]}>
                      {t(STATUS_KEY[display])}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(inv.dueDate).toLocaleDateString(locale)}</td>
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
