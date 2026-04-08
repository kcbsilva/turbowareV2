import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  PRICING_TIERS,
  getPriceForTier,
  getPriceByLabel,
  getProratedAmount,
  type Region,
} from '@/lib/pricing'

/**
 * POST /api/agent/subscriber-count
 * Agent endpoint called by TurboISP (Prolter) every hour to sync subscriber count.
 * Protected by: Authorization: Bearer <CLIENT_API_KEY>
 *
 * Body: { cnpj: string, activeSubscribers: number, hardwareId: string }
 *
 * Logic:
 *  - Same tier    → update lastSubscriberSync only
 *  - Upgrade      → apply immediately + prorated invoice for difference
 *  - Downgrade    → defer to next billing cycle via pendingDowngradeTier
 */
export async function POST(req: NextRequest) {
  // ── Auth ─────────────────────────────────────────────────────────────────────
  const clientApiKey = process.env.CLIENT_API_KEY
  if (clientApiKey) {
    const auth = req.headers.get('authorization')
    if (!auth || auth !== `Bearer ${clientApiKey}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  // ── Parse body ────────────────────────────────────────────────────────────────
  let body: { cnpj?: string; activeSubscribers?: number; hardwareId?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { cnpj, activeSubscribers, hardwareId } = body

  if (!cnpj || typeof activeSubscribers !== 'number' || !hardwareId) {
    return NextResponse.json(
      { error: 'Missing required fields: cnpj, activeSubscribers, hardwareId' },
      { status: 400 },
    )
  }

  if (activeSubscribers < 0) {
    return NextResponse.json({ error: 'activeSubscribers must be >= 0' }, { status: 400 })
  }

  // ── Normalize CNPJ (digits only) and find client ──────────────────────────────
  const normalizedCnpj = cnpj.replace(/\D/g, '')
  if (normalizedCnpj.length !== 14) {
    return NextResponse.json({ error: 'Invalid CNPJ format' }, { status: 400 })
  }

  // Use raw query to match regardless of how CNPJ is stored (with or without punctuation)
  const clientRows = await prisma.$queryRaw<{ id: string }[]>`
    SELECT id FROM clients
    WHERE regexp_replace(cnpj, '[^0-9]', '', 'g') = ${normalizedCnpj}
    LIMIT 1
  `

  if (!clientRows.length) {
    return NextResponse.json({ error: 'Client not found for provided CNPJ' }, { status: 404 })
  }

  const client = await prisma.client.findUnique({
    where: { id: clientRows[0].id },
    select: {
      id: true,
      subscription: {
        include: { invoices: { orderBy: { createdAt: 'asc' } } },
      },
    },
  })

  if (!client?.subscription) {
    return NextResponse.json({ error: 'No active subscription found for client' }, { status: 404 })
  }

  const sub = client.subscription

  if (!['ACTIVE', 'TRIAL'].includes(sub.status)) {
    return NextResponse.json(
      {
        error: `Subscription is not active (status: ${sub.status})`,
        currentPlan: buildPlanSummary(sub),
      },
      { status: 422 },
    )
  }

  const region = (sub.region ?? 'BR') as Region

  // ── Determine current tier ────────────────────────────────────────────────────
  const currentTierIndex = sub.subscriberTier
    ? PRICING_TIERS.findIndex((t) => t.label === sub.subscriberTier)
    : -1

  // ── Determine new tier from activeSubscribers ─────────────────────────────────
  const newTier = PRICING_TIERS.find((t) => t.maxSeats !== null && activeSubscribers <= t.maxSeats)

  if (!newTier) {
    // > 12,000 subscribers — pricing requires manual negotiation
    return NextResponse.json(
      {
        ok: false,
        message: 'Subscriber count exceeds maximum automated tier (12,000). Contact support for enterprise pricing.',
        activeSubscribers,
        currentPlan: buildPlanSummary(sub),
      },
      { status: 422 },
    )
  }

  const newTierIndex  = PRICING_TIERS.findIndex((t) => t.label === newTier.label)
  const newPrice      = getPriceForTier(activeSubscribers, region)

  if (newPrice === 'inquire') {
    return NextResponse.json(
      { error: 'New tier requires manual pricing. Contact support.' },
      { status: 422 },
    )
  }

  const now = new Date()

  // ── Same tier ─────────────────────────────────────────────────────────────────
  if (newTierIndex === currentTierIndex) {
    await prisma.subscription.update({
      where: { id: sub.id },
      data:  { lastSubscriberSync: now },
    })

    return NextResponse.json({
      ok:                true,
      change:            'none',
      message:           'Subscriber count synced — no tier change.',
      activeSubscribers,
      currentPlan:       buildPlanSummary(sub),
    })
  }

  // ── UPGRADE (new tier > current tier) ─────────────────────────────────────────
  if (newTierIndex > currentTierIndex) {
    const currentAmount = sub.monthlyAmount ?? 0
    const priceDiff     = newPrice - currentAmount

    // Prorated invoice: (days remaining / days in month) × price difference
    const proratedAmount = priceDiff > 0
      ? getProratedAmount(priceDiff, sub.billingDate)
      : 0

    const dueDate = new Date(now)
    dueDate.setDate(dueDate.getDate() + 7)

    await prisma.$transaction([
      // 1. Apply new tier immediately
      prisma.subscription.update({
        where: { id: sub.id },
        data:  {
          subscriberTier:    newTier.label,
          monthlyAmount:     newPrice,
          lastSubscriberSync: now,
          // Clear any pending downgrade since we just upgraded
          pendingDowngradeTier: null,
          pendingDowngradeAt:   null,
        },
      }),
      // 2. Create prorated invoice for the difference
      ...(proratedAmount > 0
        ? [
            prisma.invoice.create({
              data: {
                subscriptionId: sub.id,
                type:           'PRORATED',
                amount:         proratedAmount,
                status:         'PENDING',
                dueDate,
                notes: `Tier upgrade: ${sub.subscriberTier ?? 'previous'} → ${newTier.label} | ${activeSubscribers} active subscribers | Prorated difference for remainder of billing period`,
              },
            }),
          ]
        : []),
    ])

    return NextResponse.json({
      ok:               true,
      change:           'upgrade',
      message:          `Tier upgraded from ${sub.subscriberTier ?? 'unknown'} to ${newTier.label}.`,
      activeSubscribers,
      previousTier:     sub.subscriberTier,
      newTier:          newTier.label,
      newMonthlyAmount: newPrice,
      proratedInvoice:  proratedAmount > 0
        ? { amount: proratedAmount, dueDate: dueDate.toISOString() }
        : null,
      currentPlan: {
        ...buildPlanSummary(sub),
        subscriberTier: newTier.label,
        monthlyAmount:  newPrice,
      },
    })
  }

  // ── DOWNGRADE (new tier < current tier) ───────────────────────────────────────
  // Do NOT apply immediately — defer to next billing cycle
  await prisma.subscription.update({
    where: { id: sub.id },
    data:  {
      pendingDowngradeTier: newTier.label,
      pendingDowngradeAt:   now,
      lastSubscriberSync:   now,
    },
  })

  return NextResponse.json({
    ok:                   true,
    change:               'downgrade_pending',
    message:              `Downgrade from ${sub.subscriberTier} to ${newTier.label} is scheduled for your next billing cycle.`,
    activeSubscribers,
    currentTier:          sub.subscriberTier,
    pendingDowngradeTier: newTier.label,
    pendingDowngradeAt:   now.toISOString(),
    currentPlan:          buildPlanSummary(sub),
  })
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildPlanSummary(sub: {
  status:        string
  subscriberTier: string | null
  monthlyAmount:  number | null
  region:         string | null
  billingDate:    number
}) {
  return {
    status:        sub.status,
    subscriberTier: sub.subscriberTier,
    monthlyAmount:  sub.monthlyAmount,
    region:         sub.region ?? 'BR',
    billingDate:    sub.billingDate,
  }
}
