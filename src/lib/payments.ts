/**
 * Unified payment gateway router.
 * Routes BR → Asaas, CA/US/GB → Stripe.
 * All invoice-payment code calls requestPayment() — never calls asaas/stripe directly.
 */
import { createAsaasCharge } from './asaas'
import { createStripePaymentLink } from './stripe'
import { prisma } from './prisma'
import type { Region } from './pricing'

/**
 * Creates a payment request for an invoice and persists the payment URL
 * and gateway to the invoice record.
 */
export async function requestPayment(
  invoiceId: string,
): Promise<{ paymentUrl: string; gateway: 'ASAAS' | 'STRIPE' }> {
  const invoice = await prisma.invoice.findUniqueOrThrow({
    where: { id: invoiceId },
    include: {
      subscription: {
        include: { client: true },
      },
    },
  })

  // Already has a payment URL — return it (idempotent)
  if (invoice.paymentUrl) {
    return {
      paymentUrl: invoice.paymentUrl,
      gateway: (invoice.paymentGateway ?? 'ASAAS') as 'ASAAS' | 'STRIPE',
    }
  }

  const client = invoice.subscription.client
  const region = ((invoice.subscription.region ?? 'BR') as Region)

  let paymentUrl: string
  let gateway: 'ASAAS' | 'STRIPE'

  if (region === 'BR') {
    const charge = await createAsaasCharge(invoice, client)
    paymentUrl = charge.invoiceUrl
    gateway = 'ASAAS'
  } else {
    const session = await createStripePaymentLink(invoice, client)
    paymentUrl = session.url
    gateway = 'STRIPE'
  }

  await prisma.invoice.update({
    where: { id: invoiceId },
    data: { paymentUrl, paymentGateway: gateway },
  })

  return { paymentUrl, gateway }
}
