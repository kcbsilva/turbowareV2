import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    select: { id: true, status: true, paymentPlanId: true },
  })

  if (!invoice) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
  }

  if (invoice.status === 'PAID') {
    return NextResponse.json({ error: 'Paid invoices cannot be removed' }, { status: 400 })
  }

  await prisma.$transaction(async (tx) => {
    await tx.invoice.delete({ where: { id } })
    if (invoice.paymentPlanId) {
      const remaining = await tx.invoice.count({ where: { paymentPlanId: invoice.paymentPlanId } })
      if (remaining === 0) {
        await tx.paymentPlan.delete({ where: { id: invoice.paymentPlanId } })
      }
    }
  })

  return NextResponse.json({ ok: true })
}
