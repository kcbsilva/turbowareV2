import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { markInvoicePaid } from '@/lib/billing'

type Params = { params: Promise<{ id: string; invoiceId: string }> }

// POST /api/admin/clients/[id]/subscription/invoices/[invoiceId]/pay
// Admin marks an invoice as paid. If remaining invoices are settled → activate subscription + license.
export async function POST(_req: NextRequest, { params }: Params) {
  const { invoiceId } = await params

  try {
    const result = await markInvoicePaid(invoiceId)
    if (result.alreadyPaid) {
      return NextResponse.json({ error: 'Invoice already paid' }, { status: 400 })
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Pay failed'
    if (message.includes('not found')) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Pay failed' }, { status: 500 })
  }

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    select: { subscriptionId: true },
  })
  if (!invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })

  const updated = await prisma.subscription.findUnique({
    where: { id: invoice.subscriptionId },
    include: {
      invoices: { orderBy: { createdAt: 'desc' } },
      license: { select: { key: true, status: true, maxSeats: true } },
    },
  })

  return NextResponse.json(updated)
}
