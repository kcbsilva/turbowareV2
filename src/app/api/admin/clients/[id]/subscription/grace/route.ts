import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseBody, badRequest } from '@/lib/api'
import { requireAdminSession } from '@/lib/auth'
import { MAX_ADMIN_GRACE_DAYS, resolveGracePeriodEnd } from '@/lib/grace-period'

type Params = { params: Promise<{ id: string }> }

/**
 * POST /api/admin/clients/[id]/subscription/grace
 * Staff extend TurboISP access to extra days or an absolute calendar date.
 * Does not charge a grace fee.
 */
export async function POST(req: NextRequest, { params }: Params) {
  const auth = await requireAdminSession(req)
  if (auth.error) return auth.error

  const { id } = await params
  const { body, error } = await parseBody<{ days?: number; until?: string }>(req)
  if (error) return badRequest()

  const sub = await prisma.subscription.findUnique({ where: { clientId: id } })
  if (!sub) return NextResponse.json({ error: 'No subscription found.' }, { status: 404 })
  if (sub.status === 'CANCELLED') {
    return NextResponse.json({ error: 'Cannot extend grace on a cancelled subscription.' }, { status: 400 })
  }

  const resolved = resolveGracePeriodEnd({
    input: { days: body.days, until: body.until },
    currentEndsAt: sub.gracePeriodEndsAt,
    maxDays: MAX_ADMIN_GRACE_DAYS,
  })
  if (!resolved.ok) {
    return NextResponse.json({ error: resolved.error }, { status: 400 })
  }

  const updated = await prisma.subscription.update({
    where: { id: sub.id },
    data: {
      gracePeriodUsedAt: new Date(),
      gracePeriodEndsAt: resolved.endsAt,
    },
    include: {
      invoices: { orderBy: { createdAt: 'desc' } },
      license: { select: { key: true, status: true, maxSeats: true } },
    },
  })

  return NextResponse.json({
    ok: true,
    gracePeriodEndsAt: updated.gracePeriodEndsAt,
    subscription: updated,
  })
}
