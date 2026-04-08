import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { canChangeBillingDate, getProratedAmount, getMonthlyPrice } from '@/lib/pricing'
import { parseBody, badRequest } from '@/lib/api'

// PATCH /api/client/subscription/billing-date
// Body: { billingDate: number }
export async function PATCH(req: NextRequest) {
  const clientId = req.headers.get('x-client-id')
  if (!clientId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { body, error } = await parseBody<{ billingDate?: number }>(req)
  if (error) return badRequest()
  const { billingDate } = body
  if (!billingDate || billingDate < 1 || billingDate > 28)
    return NextResponse.json({ error: 'Billing date must be between 1 and 28.' }, { status: 400 })

  const sub = await prisma.subscription.findUnique({ where: { clientId } })
  if (!sub) return NextResponse.json({ error: 'No subscription found.' }, { status: 404 })

  const check = canChangeBillingDate(sub.billingDateChangedAt)
  if (!check.allowed)
    return NextResponse.json(
      {
        error: `Billing date can only be changed every 3 months. Available on ${check.availableOn?.toLocaleDateString('pt-BR')}.`,
      },
      { status: 400 },
    )

  // Generate a new prorated invoice for the new billing date gap
  const monthly   = getMonthlyPrice(sub.seats)
  const prorated  = monthly ? getProratedAmount(monthly, billingDate) : 0
  const dueDate   = new Date()
  dueDate.setDate(dueDate.getDate() + 7)

  await prisma.$transaction(async (tx) => {
    await tx.subscription.update({
      where: { id: sub.id },
      data: {
        billingDate,
        billingDateChangedAt: new Date(),
      },
    })

    if (prorated > 0 && monthly) {
      await tx.invoice.create({
        data: {
          subscriptionId: sub.id,
          type:   'PRORATED',
          amount: prorated,
          status: 'PENDING',
          dueDate,
          notes:  `Prorated adjustment for billing date change to day ${billingDate}`,
        },
      })
    }
  })

  const updated = await prisma.subscription.findUnique({
    where: { clientId },
    include: {
      invoices: { orderBy: { createdAt: 'desc' } },
      license:  { select: { key: true, status: true, maxSeats: true } },
    },
  })

  return NextResponse.json(updated)
}
