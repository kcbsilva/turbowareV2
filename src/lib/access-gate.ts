/** Calendar days after due date before TurboISP is fully blocked. */
export const OVERDUE_GRACE_DAYS = 3

export type AccessMode = 'ok' | 'grace' | 'blocked'

export type AccessInvoice = {
  status: string
  type?: string
  dueDate?: Date | null
  createdAt?: Date | null
}

export type AccessGate = {
  mode: AccessMode
  daysRemaining: number | null
  graceEndsAt: string | null
  reason: string
}

function startOfUtcDay(d: Date): number {
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
}

/** Whole UTC days past the due date. Negative = not yet due. */
export function daysPastDue(due: Date, now: Date): number {
  return Math.floor((startOfUtcDay(now) - startOfUtcDay(due)) / 86_400_000)
}

function invoiceUnpaid(inv: AccessInvoice): boolean {
  if (inv.type === 'GRACE_FEE') return false
  return inv.status === 'PENDING' || inv.status === 'OVERDUE'
}

function unpaidAnchorDate(inv: AccessInvoice): Date | null {
  if (!invoiceUnpaid(inv)) return null
  return inv.dueDate ?? inv.createdAt ?? null
}

function maxDaysPastDue(invoices: AccessInvoice[], now: Date): number | null {
  let max: number | null = null
  for (const inv of invoices) {
    const anchor = unpaidAnchorDate(inv)
    if (!anchor) continue
    const days = daysPastDue(anchor, now)
    if (max === null || days > max) max = days
  }
  return max
}

/**
 * TurboISP staff access after login.
 * - ok: paid / trial / not yet due
 * - grace: unpaid but still inside the 3-day overdue window, or a paid extra grace period
 * - blocked: revoked, cancelled, suspended without live grace, or 3+ days past due
 */
export function resolveAccessGate(opts: {
  subscriptionStatus: string
  licenseStatus?: string | null
  invoices?: AccessInvoice[]
  gracePeriodEndsAt?: Date | null
  now?: Date
}): AccessGate {
  const now = opts.now ?? new Date()
  const license = (opts.licenseStatus ?? '').toUpperCase()
  const status = opts.subscriptionStatus.toUpperCase()
  const paidGraceLive = Boolean(
    opts.gracePeriodEndsAt && opts.gracePeriodEndsAt.getTime() > now.getTime(),
  )

  if (license === 'REVOKED') {
    return {
      mode: 'blocked',
      daysRemaining: 0,
      graceEndsAt: null,
      reason: 'revoked',
    }
  }

  if (status === 'CANCELLED' || license === 'EXPIRED') {
    return {
      mode: 'blocked',
      daysRemaining: 0,
      graceEndsAt: null,
      reason: status === 'CANCELLED' ? 'cancelled' : 'expired',
    }
  }

  if (paidGraceLive && opts.gracePeriodEndsAt) {
    const daysRemaining = Math.max(
      1,
      Math.ceil((opts.gracePeriodEndsAt.getTime() - now.getTime()) / 86_400_000),
    )
    return {
      mode: 'grace',
      daysRemaining,
      graceEndsAt: opts.gracePeriodEndsAt.toISOString(),
      reason: 'paid_grace',
    }
  }

  if (status === 'SUSPENDED' || license === 'SUSPENDED') {
    return {
      mode: 'blocked',
      daysRemaining: 0,
      graceEndsAt: null,
      reason: 'suspended',
    }
  }

  const overdueDays = maxDaysPastDue(opts.invoices ?? [], now)
  if (overdueDays === null || overdueDays < 0) {
    return { mode: 'ok', daysRemaining: null, graceEndsAt: null, reason: 'current' }
  }

  if (overdueDays < OVERDUE_GRACE_DAYS) {
    const daysRemaining = OVERDUE_GRACE_DAYS - overdueDays
    const graceEnds = new Date(startOfUtcDay(now) + daysRemaining * 86_400_000)
    return {
      mode: 'grace',
      daysRemaining,
      graceEndsAt: graceEnds.toISOString(),
      reason: 'overdue_grace',
    }
  }

  return {
    mode: 'blocked',
    daysRemaining: 0,
    graceEndsAt: null,
    reason: 'overdue',
  }
}
