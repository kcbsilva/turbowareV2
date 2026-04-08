import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseBody, badRequest } from '@/lib/api'
import { getClientId } from '@/lib/client-auth'
import {
  getMonthlyPrice,
  getProratedAmount,
  INSTALLATION_FEE,
  TRIAL_DAYS,
} from '@/lib/pricing'

// ── GET /api/client/subscription ─────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const clientId = getClientId(req)
  if (!clientId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sub = await prisma.subscription.findUnique({
    where: { clientId },
    include: {
      invoices: { orderBy: { createdAt: 'desc' } },
      license: { select: { key: true, status: true, maxSeats: true } },
    },
  })

  if (!sub) return NextResponse.json(null)

  // Auto-advance expired trial to PENDING_PAYMENT
  if (sub.status === 'TRIAL' && sub.trialEndsAt && sub.trialEndsAt < new Date()) {
    const hasPendingInvoices = sub.invoices.some((i) => i.status === 'PENDING')
    const updated = await prisma.subscription.update({
      where: { id: sub.id },
      data: { status: hasPendingInvoices ? 'PENDING_PAYMENT' : 'ACTIVE' },
      include: {
        invoices: { orderBy: { createdAt: 'desc' } },
        license: { select: { key: true, status: true, maxSeats: true } },
      },
    })
    return NextResponse.json(updated)
  }

  // Auto-expire grace period
  if (sub.gracePeriodEndsAt && sub.gracePeriodEndsAt < new Date()) {
    const hasPending = sub.invoices.some((i) => i.status === 'PENDING')
    if (sub.status === 'ACTIVE' && hasPending) {
      await prisma.subscription.update({ where: { id: sub.id }, data: { status: 'SUSPENDED' } })
    }
  }

  return NextResponse.json(sub)
}

// ── POST /api/client/subscription ────────────────────────────────────────────
// Body: { licenseKey, seats, billingDate }
export async function POST(req: NextRequest) {
  const clientId = getClientId(req)
  if (!clientId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // No duplicate subscriptions
  const existing = await prisma.subscription.findUnique({ where: { clientId } })
  if (existing) return NextResponse.json({ error: 'Subscription already exists.' }, { status: 409 })

  const { body, error } = await parseBody<{ licenseKey?: string; seats?: unknown; billingDate?: number }>(req)
  if (error) return badRequest()
  const { licenseKey, seats, billingDate } = body

  if (!licenseKey?.trim())
    return NextResponse.json({ error: 'License key is required.' }, { status: 400 })
  if (typeof seats !== 'number' || !Number.isInteger(seats) || seats < 1)
    return NextResponse.json({ error: 'Seat count must be a positive integer.' }, { status: 400 })
  if (!billingDate || billingDate < 1 || billingDate > 28)
    return NextResponse.json({ error: 'Billing date must be between 1 and 28.' }, { status: 400 })

  // Verify license key belongs to this client
  const license = await prisma.license.findFirst({
    where: { key: (licenseKey as string).trim().toUpperCase(), clientId },
  })
  if (!license)
    return NextResponse.json(
      { error: 'License key not found or not assigned to your account.' },
      { status: 404 },
    )

  // Check it's not already linked to another subscription
  const licenseSubExists = await prisma.subscription.findUnique({
    where: { licenseId: license.id },
  })
  if (licenseSubExists)
    return NextResponse.json({ error: 'This license key is already activated.' }, { status: 409 })

  // Validate seats → get price
  const monthly = getMonthlyPrice(seats as number)
  if (monthly === null)
    return NextResponse.json(
      { error: 'Seat count exceeds 12,000. Please contact us for enterprise pricing.' },
      { status: 400 },
    )

  // Calculate invoices
  const prorated   = getProratedAmount(monthly, billingDate)
  const trialEndsAt = new Date(Date.now() + TRIAL_DAYS * 86_400_000)

  // Build subscription + invoices in one transaction
  const sub = await prisma.$transaction(async (tx) => {
    const s = await tx.subscription.create({
      data: {
        clientId,
        licenseId:  license.id,
        product:    'TurboISP',
        seats: seats as number,
        status:     'TRIAL',
        billingDate: billingDate as number,
        trialEndsAt,
        invoices: {
          create: [
            {
              type:   'INSTALLATION',
              amount: INSTALLATION_FEE,
              status: 'PENDING',
              dueDate: trialEndsAt,
              notes:  'One-time installation fee',
            },
            {
              type:   'PRORATED',
              amount: prorated,
              status: 'PENDING',
              dueDate: trialEndsAt,
              notes:  `Prorated access — today to billing day ${billingDate} (${seats} users @ ${monthly}/mo)`,
            },
          ],
        },
      },
      include: {
        invoices: { orderBy: { createdAt: 'desc' } },
        license:  { select: { key: true, status: true, maxSeats: true } },
      },
    })

    // Update license max seats
    await tx.license.update({
      where: { id: license.id },
      data:  { maxSeats: seats },
    })

    return s
  })

  return NextResponse.json(sub, { status: 201 })
}
