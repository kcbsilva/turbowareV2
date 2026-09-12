import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { canActivateGrace, GRACE_FEE } from '@/lib/pricing'
import { getClientId } from '@/lib/client-auth'
import { syncLicensesForSubscription } from '@/lib/billing'
import { LicenseStatus } from '@prisma/client'
import { MAX_CLIENT_GRACE_DAYS, resolveGracePeriodEnd } from '@/lib/grace-period'

// POST /api/client/subscription/grace
export async function POST(req: NextRequest) {
  const clientId = getClientId(req)
  if (!clientId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = (await req.json().catch(() => ({}))) as { days?: number; until?: string }

  const sub = await prisma.subscription.findUnique({
    where: { clientId },
    include: { invoices: true },
  })

  if (!sub) return NextResponse.json({ error: 'No subscription found.' }, { status: 404 })
  if (sub.status !== 'SUSPENDED')
    return NextResponse.json({ error: 'Grace period is only available for suspended subscriptions.' }, { status: 400 })

  if (!canActivateGrace(sub.gracePeriodUsedAt))
    return NextResponse.json({ error: 'Grace period already used this month.' }, { status: 400 })

  const resolved = resolveGracePeriodEnd({
    input: { days: body.days, until: body.until },
    currentEndsAt: sub.gracePeriodEndsAt,
    maxDays: MAX_CLIENT_GRACE_DAYS,
  })
  if (!resolved.ok) {
    return NextResponse.json({ error: resolved.error }, { status: 400 })
  }

  const nextBilling = sub.invoices.find(
    (i) => (i.type === 'MONTHLY' || i.type === 'PRORATED') && i.status === 'PENDING',
  )

  await prisma.$transaction(async (tx) => {
    await tx.subscription.update({
      where: { id: sub.id },
      data: {
        status: 'ACTIVE',
        gracePeriodUsedAt: new Date(),
        gracePeriodEndsAt: resolved.endsAt,
      },
    })

    const dueDate = nextBilling ? nextBilling.dueDate : new Date(Date.now() + 30 * 86_400_000)
    await tx.invoice.create({
      data: {
        subscriptionId: sub.id,
        type: 'GRACE_FEE',
        amount: GRACE_FEE,
        status: 'PENDING',
        dueDate,
        notes: `Grace period (${resolved.days} day${resolved.days === 1 ? '' : 's'}) — added to next bill`,
      },
    })
  })

  await syncLicensesForSubscription({
    clientId: sub.clientId,
    licenseId: sub.licenseId,
    status: LicenseStatus.ACTIVE,
  })

  return NextResponse.json({ ok: true, gracePeriodEndsAt: resolved.endsAt })
}
