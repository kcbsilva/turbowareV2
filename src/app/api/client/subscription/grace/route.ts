import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { canActivateGrace, GRACE_FEE } from '@/lib/pricing'

// POST /api/client/subscription/grace
export async function POST(req: NextRequest) {
  const clientId = req.headers.get('x-client-id')
  if (!clientId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sub = await prisma.subscription.findUnique({
    where: { clientId },
    include: { invoices: true },
  })

  if (!sub) return NextResponse.json({ error: 'No subscription found.' }, { status: 404 })
  if (sub.status !== 'SUSPENDED')
    return NextResponse.json({ error: 'Grace period is only available for suspended subscriptions.' }, { status: 400 })

  if (!canActivateGrace(sub.gracePeriodUsedAt))
    return NextResponse.json({ error: 'Grace period already used this month.' }, { status: 400 })

  const gracePeriodEndsAt = new Date(Date.now() + 3 * 86_400_000) // 3 days

  // Find the next PENDING monthly invoice to add fee, or create a new one
  const nextBilling = sub.invoices.find(
    (i) => (i.type === 'MONTHLY' || i.type === 'PRORATED') && i.status === 'PENDING',
  )

  await prisma.$transaction(async (tx) => {
    // Reactivate subscription for 3 days
    await tx.subscription.update({
      where: { id: sub.id },
      data: {
        status:            'ACTIVE',
        gracePeriodUsedAt: new Date(),
        gracePeriodEndsAt,
      },
    })

    // Create a GRACE_FEE invoice on the next billing date
    const dueDate = nextBilling ? nextBilling.dueDate : new Date(Date.now() + 30 * 86_400_000)
    await tx.invoice.create({
      data: {
        subscriptionId: sub.id,
        type:           'GRACE_FEE',
        amount:         GRACE_FEE,
        status:         'PENDING',
        dueDate,
        notes:          'Grace period activation fee — added to next bill',
      },
    })
  })

  return NextResponse.json({ ok: true, gracePeriodEndsAt })
}
