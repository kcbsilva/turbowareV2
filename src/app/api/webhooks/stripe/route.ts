/**
 * POST /api/webhooks/stripe
 *
 * Receives Stripe events and marks invoices as paid.
 * Stripe authenticates via HMAC signature in the `Stripe-Signature` header.
 *
 * Relevant events:
 *   checkout.session.completed  — Checkout Session payment succeeded
 *   payment_intent.succeeded    — underlying PaymentIntent confirmed
 *                                 (fallback; same metadata is present)
 */
import { NextRequest, NextResponse }    from 'next/server'
import Stripe                           from 'stripe'
import { constructStripeWebhookEvent }  from '@/lib/stripe'
import { markInvoicePaid }              from '@/lib/billing'

// Next.js 14: disable body parsing so we get the raw buffer for signature verification
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest): Promise<NextResponse> {
  // ── Read raw body ──────────────────────────────────────────────────────────
  const rawBody  = await req.arrayBuffer()
  const bodyBuf  = Buffer.from(rawBody)
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing Stripe-Signature header' }, { status: 400 })
  }

  // ── Verify signature ───────────────────────────────────────────────────────
  let event: Stripe.Event
  try {
    event = constructStripeWebhookEvent(bodyBuf, signature)
  } catch (err) {
    console.error('[stripe-webhook] Signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // ── Dispatch ───────────────────────────────────────────────────────────────
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session   = event.data.object as Stripe.Checkout.Session
        const invoiceId = session.metadata?.invoiceId

        if (invoiceId) {
          await markInvoicePaid(invoiceId)
        }
        break
      }

      case 'payment_intent.succeeded': {
        const pi        = event.data.object as Stripe.PaymentIntent
        const invoiceId = pi.metadata?.invoiceId

        if (invoiceId) {
          // markInvoicePaid is idempotent — safe to call even if
          // checkout.session.completed already handled this
          await markInvoicePaid(invoiceId)
        }
        break
      }

      default:
        // Acknowledge unhandled event types without processing
        break
    }
  } catch (err) {
    console.error('[stripe-webhook] Error processing event:', event.type, err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
