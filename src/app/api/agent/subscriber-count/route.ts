import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  PRICING_TIERS,
  getPriceForTier,
  getProratedAmount,
  type Region,
} from '@/lib/pricing'

/**
 * POST /api/agent/subscriber-count
 * Called by TurboISP to sync licensed subscriber count (Active + Suspended).
 * Protected by: Authorization: Bearer <CLIENT_API_KEY>
 *
 * Body: {
 *   activeSubscribers: number,
 *   hardwareId: string,
 *   cnpj?: string,
 *   tenantSlug?: string
 * }
 *
 * Logic:
 *  - Same tier    → update lastSubscriberSync; maybe approaching-limit ticket
 *  - Upgrade      → apply immediately + prorated invoice; clear warning sentinels
 *  - Downgrade    → defer via pendingDowngradeTier + inform via portal ticket
 */

type AgentBody = {
  cnpj?: string
  tenantSlug?: string
  activeSubscribers?: number
  hardwareId?: string
}

export async function POST(req: NextRequest) {
  const clientApiKey = process.env.CLIENT_API_KEY
  if (clientApiKey) {
    const auth = req.headers.get('authorization')
    if (!auth || auth !== `Bearer ${clientApiKey}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  let body: AgentBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { cnpj, tenantSlug, activeSubscribers, hardwareId } = body

  if (typeof activeSubscribers !== 'number' || !hardwareId) {
    return NextResponse.json(
      { error: 'Missing required fields: activeSubscribers, hardwareId' },
      { status: 400 },
    )
  }
  if (activeSubscribers < 0) {
    return NextResponse.json({ error: 'activeSubscribers must be >= 0' }, { status: 400 })
  }

  const normalizedCnpj = cnpj ? cnpj.replace(/\D/g, '') : ''
  const slug = (tenantSlug ?? '').trim().toLowerCase()
  if (!slug && normalizedCnpj.length !== 14) {
    return NextResponse.json(
      { error: 'Provide tenantSlug or a valid 14-digit cnpj' },
      { status: 400 },
    )
  }

  let clientId: string | null = null

  if (normalizedCnpj.length === 14) {
    const clientRows = await prisma.$queryRaw<{ id: string }[]>`
      SELECT id FROM clients
      WHERE regexp_replace(cnpj, '[^0-9]', '', 'g') = ${normalizedCnpj}
      LIMIT 1
    `
    clientId = clientRows[0]?.id ?? null
  }

  if (!clientId && slug) {
    const bySlug = await prisma.client.findFirst({
      where: { subdomain: slug },
      select: { id: true },
    })
    clientId = bySlug?.id ?? null
  }

  if (!clientId) {
    return NextResponse.json({ error: 'Client not found for provided identity' }, { status: 404 })
  }

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: {
      id: true,
      name: true,
      subscription: true,
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
  const currentTierIndex = sub.subscriberTier
    ? PRICING_TIERS.findIndex((t) => t.label === sub.subscriberTier)
    : -1

  const newTier = PRICING_TIERS.find((t) => t.maxSeats !== null && activeSubscribers <= t.maxSeats)

  if (!newTier) {
    await maybeCreateTicket(client.id, client.name, {
      title: 'License capacity: enterprise pricing required',
      category: 'billing',
      priority: 'HIGH',
      body:
        `Licensed subscriber count is ${activeSubscribers}, which exceeds the maximum automated tier (12,000).\n` +
        `Please contact Turboware for enterprise pricing.\n` +
        `Hardware: ${hardwareId}`,
      dedupeKey: 'enterprise-12k+',
    })
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

  const newTierIndex = PRICING_TIERS.findIndex((t) => t.label === newTier.label)
  const newPrice = getPriceForTier(activeSubscribers, region)

  if (newPrice === 'inquire') {
    return NextResponse.json(
      { error: 'New tier requires manual pricing. Contact support.' },
      { status: 422 },
    )
  }

  const now = new Date()

  // ── Same tier ─────────────────────────────────────────────────────────────
  if (newTierIndex === currentTierIndex) {
    // Count rose back into current tier — clear a pending downgrade.
    const clearPending =
      !!sub.pendingDowngradeTier && sub.pendingDowngradeTier !== sub.subscriberTier

    await prisma.subscription.update({
      where: { id: sub.id },
      data: {
        lastSubscriberSync: now,
        ...(clearPending
          ? { pendingDowngradeTier: null, pendingDowngradeAt: null }
          : {}),
      },
    })

    const approaching = await maybeApproachingLimitTicket(
      client.id,
      client.name,
      activeSubscribers,
      newTier.maxSeats,
      newTier.label,
      hardwareId,
    )

    const refreshed = { ...sub, pendingDowngradeTier: clearPending ? null : sub.pendingDowngradeTier }

    return NextResponse.json({
      ok: true,
      change: 'none',
      message: clearPending
        ? 'Subscriber count synced — pending downgrade cleared.'
        : 'Subscriber count synced — no tier change.',
      activeSubscribers,
      approachingLimit: approaching,
      pendingDowngradeTier: refreshed.pendingDowngradeTier,
      currentPlan: {
        ...buildPlanSummary(refreshed),
        remaining: newTier.maxSeats != null ? Math.max(0, newTier.maxSeats - activeSubscribers) : null,
      },
    })
  }

  // ── UPGRADE ───────────────────────────────────────────────────────────────
  if (newTierIndex > currentTierIndex) {
    const currentAmount = sub.monthlyAmount ?? 0
    const priceDiff = newPrice - currentAmount
    const proratedAmount = priceDiff > 0 ? getProratedAmount(priceDiff, sub.billingDate) : 0

    const dueDate = new Date(now)
    dueDate.setDate(dueDate.getDate() + 7)

    await prisma.$transaction([
      prisma.subscription.update({
        where: { id: sub.id },
        data: {
          subscriberTier: newTier.label,
          monthlyAmount: newPrice,
          lastSubscriberSync: now,
          pendingDowngradeTier: null,
          pendingDowngradeAt: null,
        },
      }),
      ...(proratedAmount > 0
        ? [
            prisma.invoice.create({
              data: {
                subscriptionId: sub.id,
                type: 'PRORATED',
                amount: proratedAmount,
                status: 'PENDING',
                dueDate,
                notes: `Tier upgrade: ${sub.subscriberTier ?? 'previous'} → ${newTier.label} | ${activeSubscribers} active subscribers | Prorated difference for remainder of billing period`,
              },
            }),
          ]
        : []),
    ])

    await maybeCreateTicket(client.id, client.name, {
      title: `License upgraded to ${newTier.label}`,
      category: 'billing',
      priority: 'MEDIUM',
      body:
        `Your TurboISP license was automatically upgraded from ${sub.subscriberTier ?? 'unknown'} to ${newTier.label} ` +
        `because licensed subscribers reached ${activeSubscribers}.\n` +
        (proratedAmount > 0
          ? `A prorated invoice of ${proratedAmount.toFixed(2)} was created for the remainder of this billing period.\n`
          : '') +
        `Hardware: ${hardwareId}`,
      dedupeKey: `upgrade-${newTier.label}`,
    })

    return NextResponse.json({
      ok: true,
      change: 'upgrade',
      message: `Tier upgraded from ${sub.subscriberTier ?? 'unknown'} to ${newTier.label}.`,
      activeSubscribers,
      previousTier: sub.subscriberTier,
      newTier: newTier.label,
      newMonthlyAmount: newPrice,
      approachingLimit: false,
      pendingDowngradeTier: null,
      proratedInvoice:
        proratedAmount > 0
          ? { amount: proratedAmount, dueDate: dueDate.toISOString() }
          : null,
      currentPlan: {
        ...buildPlanSummary(sub),
        subscriberTier: newTier.label,
        monthlyAmount: newPrice,
        maxSeats: newTier.maxSeats,
        remaining: newTier.maxSeats != null ? Math.max(0, newTier.maxSeats - activeSubscribers) : null,
      },
    })
  }

  // ── DOWNGRADE (deferred) ──────────────────────────────────────────────────
  const alreadyPending = sub.pendingDowngradeTier === newTier.label

  await prisma.subscription.update({
    where: { id: sub.id },
    data: {
      pendingDowngradeTier: newTier.label,
      pendingDowngradeAt: alreadyPending ? sub.pendingDowngradeAt ?? now : now,
      lastSubscriberSync: now,
    },
  })

  if (!alreadyPending) {
    await maybeCreateTicket(client.id, client.name, {
      title: `License downgrade scheduled to ${newTier.label}`,
      category: 'billing',
      priority: 'MEDIUM',
      body:
        `Licensed subscriber count has fallen to ${activeSubscribers}, which fits the ${newTier.label} tier ` +
        `(current tier: ${sub.subscriberTier}).\n\n` +
        `Your plan will automatically cycle down to ${newTier.label} at the next billing date. ` +
        `No action is required. If your count rises again before then, the pending downgrade will be cancelled.\n` +
        `Hardware: ${hardwareId}`,
      dedupeKey: `downgrade-${sub.subscriberTier}-to-${newTier.label}`,
    })
  }

  return NextResponse.json({
    ok: true,
    change: 'downgrade_pending',
    message: `Downgrade from ${sub.subscriberTier} to ${newTier.label} is scheduled for your next billing cycle.`,
    activeSubscribers,
    currentTier: sub.subscriberTier,
    pendingDowngradeTier: newTier.label,
    pendingDowngradeAt: now.toISOString(),
    approachingLimit: false,
    currentPlan: {
      ...buildPlanSummary({
        ...sub,
        pendingDowngradeTier: newTier.label,
      }),
      remaining:
        PRICING_TIERS.find((t) => t.label === sub.subscriberTier)?.maxSeats != null
          ? Math.max(
              0,
              (PRICING_TIERS.find((t) => t.label === sub.subscriberTier)!.maxSeats as number) -
                activeSubscribers,
            )
          : null,
    },
  })
}

async function maybeApproachingLimitTicket(
  clientId: string,
  clientName: string | null,
  activeSubscribers: number,
  maxSeats: number | null,
  tierLabel: string,
  hardwareId: string,
): Promise<boolean> {
  if (maxSeats == null) return false
  const remaining = maxSeats - activeSubscribers
  if (remaining < 0 || remaining > 10) return false

  await maybeCreateTicket(clientId, clientName, {
    title: `License capacity: approaching ${tierLabel} limit`,
    category: 'billing',
    priority: 'HIGH',
    body:
      `You are within 10 licensed seats of your ${tierLabel} capacity.\n` +
      `Current licensed subscribers: ${activeSubscribers} / ${maxSeats} (${remaining} remaining).\n` +
      `TurboISP will automatically upgrade your tier when you exceed this limit.\n` +
      `Hardware: ${hardwareId}`,
    dedupeKey: `approaching-${tierLabel}`,
  })
  return true
}

async function maybeCreateTicket(
  clientId: string,
  clientName: string | null,
  opts: {
    title: string
    body: string
    category: string
    priority: 'LOW' | 'MEDIUM' | 'HIGH'
    dedupeKey: string
  },
) {
  const existing = await prisma.supportTicket.findFirst({
    where: {
      clientId,
      category: opts.category,
      title: opts.title,
      status: { in: ['OPEN', 'IN_PROGRESS'] },
    },
    select: { id: true },
  })
  if (existing) return existing.id

  // Also dedupe by scanning recent messages for the sentinel key.
  const recent = await prisma.supportTicket.findFirst({
    where: {
      clientId,
      category: opts.category,
      status: { in: ['OPEN', 'IN_PROGRESS'] },
      messages: { some: { body: { contains: `dedupe:${opts.dedupeKey}` } } },
    },
    select: { id: true },
  })
  if (recent) return recent.id

  const ticket = await prisma.supportTicket.create({
    data: {
      clientId,
      title: opts.title,
      category: opts.category,
      priority: opts.priority,
      messages: {
        create: {
          body: `${opts.body}\n\n[dedupe:${opts.dedupeKey}]`,
          authorType: 'ADMIN',
          authorName: 'TurboISP Licensing',
        },
      },
    },
  })
  return ticket.id
}

function buildPlanSummary(sub: {
  status: string
  subscriberTier: string | null
  monthlyAmount: number | null
  region: string | null
  billingDate: number
  pendingDowngradeTier?: string | null
}) {
  const tier = PRICING_TIERS.find((t) => t.label === sub.subscriberTier)
  return {
    status: sub.status,
    subscriberTier: sub.subscriberTier,
    monthlyAmount: sub.monthlyAmount,
    region: sub.region ?? 'BR',
    billingDate: sub.billingDate,
    maxSeats: tier?.maxSeats ?? null,
    pendingDowngradeTier: sub.pendingDowngradeTier ?? null,
  }
}
