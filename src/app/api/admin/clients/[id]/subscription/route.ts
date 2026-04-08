import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseBody, badRequest } from '@/lib/api'
import { isValidTransition } from '@/lib/transitions'
import { SubscriptionStatus } from '@prisma/client'

type Params = { params: { id: string } }

// GET /api/admin/clients/[id]/subscription
export async function GET(_req: NextRequest, { params }: Params) {
  const sub = await prisma.subscription.findUnique({
    where: { clientId: params.id },
    include: {
      invoices: { orderBy: { createdAt: 'desc' } },
      license:  { select: { key: true, status: true, maxSeats: true } },
    },
  })
  return NextResponse.json(sub ?? null)
}

// PATCH /api/admin/clients/[id]/subscription — update status manually
export async function PATCH(req: NextRequest, { params }: Params) {
  const { body, error } = await parseBody<{ status?: string }>(req)
  if (error) return badRequest()
  const { status } = body

  const validStatuses = Object.values(SubscriptionStatus)
  if (!status || !validStatuses.includes(status as SubscriptionStatus)) {
    return NextResponse.json(
      { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
      { status: 400 },
    )
  }

  const sub = await prisma.subscription.findUnique({ where: { clientId: params.id } })
  if (!sub) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (!isValidTransition(sub.status, status)) {
    return NextResponse.json(
      { error: `Invalid transition: ${sub.status} → ${status}` },
      { status: 400 },
    )
  }

  const updated = await prisma.subscription.update({
    where: { id: sub.id },
    data:  { status: status as SubscriptionStatus },
    include: {
      invoices: { orderBy: { createdAt: 'desc' } },
      license:  { select: { key: true, status: true, maxSeats: true } },
    },
  })
  return NextResponse.json(updated)
}
