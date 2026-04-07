import { createAsaasCharge } from './asaas'
import { createStripePaymentLink } from './stripe'
import { prisma } from './prisma'

type Region = 'BR' | 'CA' | 'US' | 'GB'

/**
 * Creates a payment request for an invoice and saves the payment URL + gateway back to the invoice.
 * Routes: BR → Asaas, CA/US/GB → Stripe
 * Returns { paymentUrl, gateway }
 */
export async function requestPayment(invoiceId: string): Promise<{ paymentUrl: string; gateway: 'ASAAS' | 'STRIPE' }> {
  const invoice = await prisma.invoice.findUniqueOrThrow({
    where: { id: invoiceId },
    include: {
      subscription: {
        include: {
          client: true,
        },
      },
    },
  })

  const client = invoice.subscription.client
  const region = (invoice.subscription.region ?? 'BR') as Region

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
