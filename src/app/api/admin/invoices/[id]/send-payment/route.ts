/**
 * POST /api/admin/invoices/[id]/send-payment
 *
 * Creates a payment link for an invoice in the chosen gateway.
 * Protected by the admin middleware (JWT cookie required).
 *
 * Body: { gateway: "asaas" | "stripe" }
 *
 * Returns: { paymentUrl: string }
 */
import { NextRequest, NextResponse }    from 'next/server'
import { prisma }                       from '@/lib/prisma'
import { createAsaasCharge }            from '@/lib/asaas'
import { createStripePaymentLink }      from '@/lib/stripe'

type Params = { params: { id: string } }

export async function POST(req: NextRequest, { params }: Params): Promise<NextResponse> {
  // ── Parse body ─────────────────────────────────────────────────────────────
  let gateway: 'asaas' | 'stripe'
  try {
    const body = await req.json()
    gateway    = body.gateway
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (gateway !== 'asaas' && gateway !== 'stripe') {
    return NextResponse.json({ error: 'gateway must be "asaas" or "stripe"' }, { status: 400 })
  }

  // ── Load invoice with full client context ──────────────────────────────────
  const invoice = await prisma.invoice.findUnique({
    where:   { id: params.id },
    include: {
      subscription: {
        include: {
          client: {
            select: {
              id:              true,
              name:            true,
              email:           true,
              phone:           true,
              cnpj:            true,
              asaasCustomerId: true,
            },
          },
        },
      },
    },
  })

  if (!invoice) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
  }

  if (invoice.status === 'PAID') {
    return NextResponse.json({ error: 'Invoice is already paid' }, { status: 400 })
  }

  const client = invoice.subscription.client

  // ── Create payment link ────────────────────────────────────────────────────
  let paymentUrl:        string
  let externalPaymentId: string

  try {
    if (gateway === 'asaas') {
      const charge = await createAsaasCharge(
        {
          id:      invoice.id,
          amount:  invoice.amount,
          dueDate: invoice.dueDate,
          type:    invoice.type,
          notes:   invoice.notes,
        },
        client,
      )
      paymentUrl        = charge.invoiceUrl
      externalPaymentId = charge.id

    } else {
      // stripe
      const { url, sessionId } = await createStripePaymentLink(
        {
          id:     invoice.id,
          amount: invoice.amount,
          type:   invoice.type,
          notes:  invoice.notes,
        },
        client,
      )
      paymentUrl        = url
      externalPaymentId = sessionId
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gateway error'
    console.error(`[send-payment] ${gateway} error:`, err)
    return NextResponse.json({ error: message }, { status: 502 })
  }

  // ── Persist on invoice ─────────────────────────────────────────────────────
  await prisma.invoice.update({
    where: { id: invoice.id },
    data: {
      externalPaymentId,
      paymentUrl,
      paymentGateway: gateway === 'asaas' ? 'ASAAS' : 'STRIPE',
    },
  })

  return NextResponse.json({ paymentUrl })
}
