/**
 * POST /api/webhooks/asaas
 *
 * Receives Asaas payment events and marks invoices as paid.
 * Asaas sends a JSON body with an `event` field and authenticates via the
 * `asaas-access-token` header (set in your Asaas webhook configuration).
 *
 * Relevant events:
 *   PAYMENT_RECEIVED  — payment confirmed by Asaas
 *   PAYMENT_CONFIRMED — payment confirmed (credit card / Pix)
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma }           from '@/lib/prisma'
import { markInvoicePaid }  from '@/lib/billing'

// Asaas webhook payload shape (minimal — only fields we use)
interface AsaasWebhookPayload {
  event:   string
  payment: {
    id:                string   // Asaas payment ID
    externalReference: string   // Our invoice ID
    status:            string
    value:             number
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  // ── Authentication ─────────────────────────────────────────────────────────
  const webhookToken = process.env.ASAAS_API_KEY
  const sentToken    = req.headers.get('asaas-access-token')

  // Validate only when the key is set (always set in production)
  if (webhookToken && sentToken !== webhookToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── Parse body ─────────────────────────────────────────────────────────────
  let payload: AsaasWebhookPayload
  try {
    payload = (await req.json()) as AsaasWebhookPayload
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { event, payment } = payload

  // ── Handle relevant events ─────────────────────────────────────────────────
  if (event === 'PAYMENT_RECEIVED' || event === 'PAYMENT_CONFIRMED') {
    const invoiceId = payment.externalReference

    if (!invoiceId) {
      // No invoice reference — nothing to do, but acknowledge gracefully
      return NextResponse.json({ ok: true, note: 'no externalReference' })
    }

    try {
      const result = await markInvoicePaid(invoiceId)

      if (result.alreadyPaid) {
        // Idempotent — already processed, tell Asaas it's fine
        return NextResponse.json({ ok: true, note: 'already paid' })
      }

      // Log the Asaas payment ID for audit (best-effort, don't fail webhook on error)
      await prisma.invoice.update({
        where: { id: invoiceId },
        data:  { externalPaymentId: payment.id },
      }).catch(() => null)

      return NextResponse.json({ ok: true })
    } catch (err) {
      console.error('[asaas-webhook] markInvoicePaid failed:', err)
      return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
  }

  // All other events acknowledged but not processed
  return NextResponse.json({ ok: true, note: `event ${event} ignored` })
}
