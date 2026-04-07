/**
 * Stripe payment gateway client.
 * Used for international clients billed in BRL via Stripe Checkout.
 */
import Stripe from 'stripe'

// ── Client ────────────────────────────────────────────────────────────────────

function getStripe(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) throw new Error('STRIPE_SECRET_KEY is not set')
  return new Stripe(secretKey, { apiVersion: '2026-03-25.dahlia' })
}

// ── Customer ──────────────────────────────────────────────────────────────────

/**
 * Creates a Stripe customer for a client.
 * NOTE: Unlike Asaas, we don't cache this on the Client model — Stripe customers
 * are referenced via the Checkout Session and the invoice metadata is enough
 * for reconciliation.
 */
export async function createStripeCustomer(client: {
  name:  string
  email: string | null
}): Promise<Stripe.Customer> {
  const stripe = getStripe()
  return stripe.customers.create({
    name:  client.name,
    email: client.email || undefined,
    metadata: { source: 'TurboISP' },
  })
}

// ── Payment Link (Checkout Session) ──────────────────────────────────────────

/**
 * Creates a Stripe Checkout Session for a one-time invoice payment in BRL.
 * Returns the session URL — valid for 72 hours.
 * The invoice ID is stored in `metadata` for webhook reconciliation.
 */
export async function createStripePaymentLink(
  invoice: {
    id:     string
    amount: number
    type:   string
    notes:  string | null
  },
  client: {
    name:  string
    email: string | null
  },
): Promise<{ url: string; sessionId: string }> {
  const stripe      = getStripe()
  const appUrl      = process.env.NEXT_PUBLIC_APP_URL || 'https://app.turboisp.com.br'
  const customer    = await createStripeCustomer(client)

  // Amount in centavos (Stripe requires integer smallest-unit)
  const amountCents = Math.round(invoice.amount * 100)

  const description = invoice.notes
    ? `TurboISP — ${invoice.notes}`
    : `TurboISP — ${invoice.type}`

  const session = await stripe.checkout.sessions.create({
    customer:   customer.id,
    mode:       'payment',
    currency:   'brl',
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency:     'brl',
          unit_amount:  amountCents,
          product_data: { name: description },
        },
      },
    ],
    metadata: {
      invoiceId: invoice.id,
      source:    'TurboISP',
    },
    payment_intent_data: {
      // Copy metadata to the PaymentIntent so payment_intent.succeeded
      // can also reconcile if needed
      metadata: { invoiceId: invoice.id },
    },
    success_url: `${appUrl}/client/dashboard?payment=success`,
    cancel_url:  `${appUrl}/client/dashboard?payment=cancelled`,
    expires_at:  Math.floor(Date.now() / 1000) + 72 * 60 * 60, // 72 h
  })

  if (!session.url) throw new Error('Stripe did not return a session URL')

  return { url: session.url, sessionId: session.id }
}

// ── Webhook Verification ──────────────────────────────────────────────────────

/**
 * Constructs and verifies a Stripe webhook event from the raw request body
 * and the Stripe-Signature header.
 * Throws if the signature is invalid.
 */
export function constructStripeWebhookEvent(
  body:      string | Buffer,
  signature: string,
): Stripe.Event {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) throw new Error('STRIPE_WEBHOOK_SECRET is not set')
  return getStripe().webhooks.constructEvent(body, signature, secret)
}
