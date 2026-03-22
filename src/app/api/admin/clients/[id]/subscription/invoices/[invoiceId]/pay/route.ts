import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type Params = { params: { id: string; invoiceId: string } }

// POST /api/admin/clients/[id]/subscription/invoices/[invoiceId]/pay
// Admin marks an invoice as paid. If all setup invoices paid → activate subscription + license.
export async function POST(_req: NextRequest, { params }: Params) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: params.invoiceId },
    include: { subscription: { include: { invoices: true } } },
  })

  if (!invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
  if (invoice.status === 'PAID')
    return NextResponse.json({ error: 'Invoice already paid' }, { status: 400 })

  // Mark invoice paid
  await prisma.invoice.update({
    where: { id: params.invoiceId },
    data:  { status: 'PAID', paidAt: new Date() },
  })

  // Check if all non-GRACE_FEE invoices are now paid
  const sub      = invoice.subscription
  const allPaid  = sub.invoices
    .filter((i) => i.id !== params.invoiceId) // exclude current (before DB update)
    .every((i) => i.status === 'PAID' || i.type === 'GRACE_FEE')

  if (allPaid && (sub.status === 'TRIAL' || sub.status === 'PENDING_PAYMENT')) {
    // Activate subscription and license
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

  const updated = await prisma.subscription.findUnique({
    where: { id: sub.id },
    include: {
      invoices: { orderBy: { createdAt: 'desc' } },
      license:  { select: { key: true, status: true, maxSeats: true } },
    },
  })

  return NextResponse.json(updated)
}
