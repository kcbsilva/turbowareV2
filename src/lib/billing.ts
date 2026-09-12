/**
 * Shared billing utilities.
 * Used by: admin /pay route, Asaas webhook, Stripe webhook, billing cron.
 */
import { prisma } from '@/lib/prisma'
import { LicenseStatus, SubscriptionStatus } from '@prisma/client'

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

export async function syncLicensesForSubscription(opts: {
  clientId: string
  licenseId?: string | null
  status: LicenseStatus
}): Promise<void> {
  if (opts.licenseId) {
    await prisma.license.update({
      where: { id: opts.licenseId },
      data: { status: opts.status },
    })
    return
  }

  await prisma.license.updateMany({
    where: {
      clientId: opts.clientId,
      status: { notIn: [LicenseStatus.REVOKED, LicenseStatus.EXPIRED] },
    },
    data: { status: opts.status },
  })
}

export async function applySubscriptionLicenseSync(opts: {
  clientId: string
  licenseId?: string | null
  subscriptionStatus: string
}): Promise<void> {
  const licenseStatus = licenseStatusForSubscription(opts.subscriptionStatus)
  if (!licenseStatus) return
  await syncLicensesForSubscription({
    clientId: opts.clientId,
    licenseId: opts.licenseId,
    status: licenseStatus,
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
    await syncLicensesForSubscription({
      clientId: sub.clientId,
      licenseId: sub.licenseId,
      status: LicenseStatus.ACTIVE,
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
  await syncLicensesForSubscription({
    clientId: opts.clientId,
    licenseId: opts.licenseId,
    status: LicenseStatus.SUSPENDED,
  })
}
