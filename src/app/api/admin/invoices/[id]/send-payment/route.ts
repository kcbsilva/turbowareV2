/**
 * POST /api/admin/invoices/[id]/send-payment
 *
 * Creates a payment link for an invoice, routing to Asaas (BR) or Stripe (CA/US/GB)
 * based on the subscription's region.
 * Protected by the admin middleware (JWT cookie required).
 *
 * Returns: { paymentUrl: string }
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma }                    from '@/lib/prisma'
import { requestPayment }            from '@/lib/payments'

type Params = { params: { id: string } }

export async function POST(_req: NextRequest, { params }: Params): Promise<NextResponse> {
  const invoice = await prisma.invoice.findUnique({
    where: { id: params.id },
    select: { id: true, status: true },
  })

  if (!invoice) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
  }

  if (invoice.status === 'PAID') {
    return NextResponse.json({ error: 'Invoice is already paid' }, { status: 400 })
  }

  try {
    const { paymentUrl } = await requestPayment(params.id)
    return NextResponse.json({ paymentUrl })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gateway error'
    console.error('[send-payment] error:', err)
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
