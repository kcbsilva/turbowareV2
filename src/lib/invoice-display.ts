export type InvoiceRecordStatus = 'PENDING' | 'PAID' | 'OVERDUE' | 'WAIVED'

export type InvoiceDisplayStatus = 'PAID' | 'OVERDUE' | 'PENDING' | 'WAIVED'

/** Human-readable invoice number from the record id + created date. */
export function formatInvoiceNumber(id: string, createdAt?: string | Date | null): string {
  const suffix = id.replace(/[^a-zA-Z0-9]/g, '').slice(-6).toUpperCase() || 'XXXXXX'
  if (!createdAt) return `INV-${suffix}`
  const d = new Date(createdAt)
  if (Number.isNaN(d.getTime())) return `INV-${suffix}`
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  return `INV-${y}${m}-${suffix}`
}

/**
 * Pending = issued and awaiting payment, but not past due.
 * Overdue = unpaid and past due (DB OVERDUE, or PENDING with dueDate in the past).
 */
export function resolveInvoiceDisplayStatus(
  invoice: { status: string; dueDate?: string | Date | null },
  now: Date = new Date(),
): InvoiceDisplayStatus {
  if (invoice.status === 'PAID') return 'PAID'
  if (invoice.status === 'WAIVED') return 'WAIVED'
  if (invoice.status === 'OVERDUE') return 'OVERDUE'

  if (invoice.status === 'PENDING' && invoice.dueDate) {
    const due = new Date(invoice.dueDate)
    if (!Number.isNaN(due.getTime()) && due.getTime() < now.getTime()) return 'OVERDUE'
  }

  return 'PENDING'
}
