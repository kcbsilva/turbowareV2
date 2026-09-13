/**
 * Shared billing utilities.
 * Used by: admin /pay route, Asaas webhook, Stripe webhook, billing cron.
 */
import { prisma } from '@/lib/prisma'
import { ClientProductStatus, LicenseStatus, SubscriptionStatus, type Prisma } from '@prisma/client'
import { resolveAccessGate } from '@/lib/access-gate'

type InvoiceLike = {
  id: string
  status: string
  type: string
  dueDate?: Date
}

/**
 * An invoice no longer blocks activation: paid, waived, or a grace-fee line
 * (grace fees ride on the next bill and must not keep the license locked).
 */
export function isInvoiceSettled(invoice: InvoiceLike): boolean {
  return invoice.status === 'PAID' || invoice.status === 'WAIVED' || invoice.type === 'GRACE_FEE'
}

export function isInvoiceUnpaid(invoice: InvoiceLike): boolean {
  return invoice.status === 'PENDING' || invoice.status === 'OVERDUE'
}

export function allOtherInvoicesSettled(invoices: InvoiceLike[], paidInvoiceId: string): boolean {
  return invoices.filter((invoice) => invoice.id !== paidInvoiceId).every(isInvoiceSettled)
}

export function shouldActivateOnPayment(status: string): boolean {
  return status === 'TRIAL' || status === 'PENDING_PAYMENT' || status === 'SUSPENDED'
}

/** License status that should mirror a subscription status change. */
export function licenseStatusForSubscription(
  status: string,
): LicenseStatus | null {
  if (status === 'SUSPENDED' || status === 'CANCELLED') return LicenseStatus.SUSPENDED
  if (status === 'ACTIVE' || status === 'TRIAL') return LicenseStatus.ACTIVE
  return null
}

/** TurboISP row on the licenses tab should match billing. */
export function clientProductStatusForSubscription(
  status: string,
): ClientProductStatus | null {
  if (status === 'ACTIVE' || status === 'TRIAL') return ClientProductStatus.ACTIVE
  if (status === 'PENDING_PAYMENT') return ClientProductStatus.PENDING
  if (status === 'SUSPENDED') return ClientProductStatus.SUSPENDED
  if (status === 'CANCELLED') return ClientProductStatus.CANCELLED
  return null
}

export async function syncLicensesForSubscription(opts: {
  clientId: string
  licenseId?: string | null
  status: LicenseStatus
}, db: Prisma.TransactionClient = prisma): Promise<void> {
  await db.license.updateMany({
    where: {
      clientId: opts.clientId,
      ...(opts.licenseId ? { id: opts.licenseId } : {}),
      status: { notIn: [LicenseStatus.REVOKED, LicenseStatus.EXPIRED], not: opts.status },
    },
    data: { status: opts.status },
  })
}

async function syncTurboIspClientProduct(clientId: string, status: ClientProductStatus, db: Prisma.TransactionClient) {
  await db.clientProduct.updateMany({
    where: {
      clientId,
      status: { not: status },
      product: { slug: 'turboisp' },
    },
    data: { status },
  })
}

export async function applySubscriptionLicenseSync(opts: {
  clientId: string
  licenseId?: string | null
  subscriptionStatus: string
  activateLicenses?: boolean
}, db: Prisma.TransactionClient = prisma): Promise<void> {
  const licenseStatus = licenseStatusForSubscription(opts.subscriptionStatus)
  if (licenseStatus && (opts.activateLicenses !== false || licenseStatus !== LicenseStatus.ACTIVE)) {
    await syncLicensesForSubscription({
      clientId: opts.clientId,
      licenseId: opts.licenseId,
      status: licenseStatus,
    }, db)
  }

  const productStatus = clientProductStatusForSubscription(opts.subscriptionStatus)
  if (productStatus) {
    await syncTurboIspClientProduct(opts.clientId, productStatus, db)
  }
}

/**
 * Reconcile stored billing and license states with the platform's overdue rule.
 * Reads repair old rows too, without waiting for the daily billing job. Lock the
 * subscription so concurrent license/billing reads cannot overwrite each other.
 */
export async function reconcileSubscriptionLicenseSync(
  clientId: string,
  opts: { activateLicenses?: boolean } = {},
) {
  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw`
      SELECT id FROM turboware.subscriptions WHERE "clientId" = ${clientId} FOR UPDATE
    `
    const include = {
      invoices: { orderBy: { createdAt: 'desc' as const } },
      license: { select: { key: true, status: true, maxSeats: true } },
    }
    const sub = await tx.subscription.findUnique({ where: { clientId }, include })
    if (!sub) return null

    const now = new Date()
    const gate = resolveAccessGate({
      subscriptionStatus: sub.status,
      invoices: sub.invoices,
      gracePeriodEndsAt: sub.gracePeriodEndsAt,
      now,
    })
    const status = gate.mode === 'blocked' && gate.reason === 'overdue'
      ? SubscriptionStatus.SUSPENDED
      : sub.status

    if (status !== sub.status) {
      await tx.subscription.update({
        where: { id: sub.id },
        data: { status, gracePeriodEndsAt: null },
      })
      await tx.invoice.updateMany({
        where: { subscriptionId: sub.id, status: 'PENDING', type: { not: 'GRACE_FEE' }, dueDate: { lte: now } },
        data: { status: 'OVERDUE' },
      })
    }

    await applySubscriptionLicenseSync({
      clientId,
      licenseId: sub.licenseId,
      subscriptionStatus: status,
      // Ordinary reads must preserve a license suspended manually. Payment and
      // explicit activation can release it after the overdue rule is checked.
      activateLicenses: opts.activateLicenses ?? false,
    }, tx)

    return tx.subscription.findUnique({ where: { clientId }, include })
  })
}

/**
 * Marks an invoice as PAID.
 * If all other invoices on the subscription are settled and the
 * subscription is TRIAL, PENDING_PAYMENT, or SUSPENDED, it activates the
 * subscription and its linked license(s).
 */
export async function markInvoicePaid(invoiceId: string): Promise<{ ok: boolean; alreadyPaid?: boolean }> {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { subscription: { include: { invoices: true } } },
  })

  if (!invoice) throw new Error(`Invoice ${invoiceId} not found`)
  if (invoice.status === 'PAID') return { ok: true, alreadyPaid: true }

  await prisma.invoice.update({
    where: { id: invoiceId },
    data: { status: 'PAID', paidAt: new Date() },
  })

  const sub = invoice.subscription
  const allPaid = allOtherInvoicesSettled(sub.invoices, invoiceId)

  if (allPaid && shouldActivateOnPayment(sub.status)) {
    await prisma.subscription.update({
      where: { id: sub.id },
      data: { status: SubscriptionStatus.ACTIVE },
    })
    await applySubscriptionLicenseSync({
      clientId: sub.clientId,
      licenseId: sub.licenseId,
      subscriptionStatus: SubscriptionStatus.ACTIVE,
    })
  }

  return { ok: true }
}

export async function suspendSubscriptionForNonPayment(opts: {
  subscriptionId: string
  clientId: string
  licenseId?: string | null
}): Promise<void> {
  await prisma.subscription.update({
    where: { id: opts.subscriptionId },
    data: { status: SubscriptionStatus.SUSPENDED, gracePeriodEndsAt: null },
  })
  await applySubscriptionLicenseSync({
    clientId: opts.clientId,
    licenseId: opts.licenseId,
    subscriptionStatus: SubscriptionStatus.SUSPENDED,
  })
}
