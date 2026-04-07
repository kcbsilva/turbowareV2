/**
 * Shared billing utilities.
 * Used by: admin /pay route, Asaas webhook, Stripe webhook.
 */
import { prisma } from '@/lib/prisma'

/**
 * Marks an invoice as PAID.
 * If all non-GRACE_FEE invoices on the subscription are now paid and the
 * subscription is TRIAL or PENDING_PAYMENT, it activates the subscription
 * and its linked license.
 *
 * @returns `{ ok: true }` or throws on DB error
 */
export async function markInvoicePaid(invoiceId: string): Promise<{ ok: boolean; alreadyPaid?: boolean }> {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { subscription: { include: { invoices: true } } },
  })

  if (!invoice) throw new Error(`Invoice ${invoiceId} not found`)
  if (invoice.status === 'PAID') return { ok: true, alreadyPaid: true }

  // Mark paid
  await prisma.invoice.update({
    where: { id: invoiceId },
    data:  { status: 'PAID', paidAt: new Date() },
  })

  // Check if all non-GRACE_FEE invoices are now resolved
  const sub     = invoice.subscription
  const allPaid = sub.invoices
    .filter((i) => i.id !== invoiceId) // exclude the one we just updated
    .every((i) => i.status === 'PAID' || i.type === 'GRACE_FEE')

  if (allPaid && (sub.status === 'TRIAL' || sub.status === 'PENDING_PAYMENT' || sub.status === 'SUSPENDED')) {
    await prisma.$transaction([
      prisma.subscription.update({
        where: { id: sub.id },
        data:  { status: 'ACTIVE' },
      }),
      ...(sub.licenseId
        ? [prisma.license.update({ where: { id: sub.licenseId }, data: { status: 'ACTIVE' } })]
        : []),
    ])
  }

  return { ok: true }
}
