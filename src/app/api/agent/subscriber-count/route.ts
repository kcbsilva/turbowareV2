import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  PRICING_TIERS,
  getTierForUsage,
  getPriceForUsage,
  getTierByLabel,
  getProratedAmount,
  type Region,
  type PricingTier,
} from '@/lib/pricing'

/**
 * POST /api/agent/subscriber-count
 * Sync licensed clients (Active+Suspended) and map plant items.
 * Protected by: Authorization: Bearer <CLIENT_API_KEY>
 *
 * Body: {
 *   activeSubscribers: number,
 *   mapItemCount?: number,
 *   hardwareId: string,
 *   cnpj?: string,
 *   tenantSlug?: string
 * }
 */

type AgentBody = {
  cnpj?: string
  tenantSlug?: string
  activeSubscribers?: number
  mapItemCount?: number
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
  const mapItemCount = typeof body.mapItemCount === 'number' ? body.mapItemCount : 0

  if (typeof activeSubscribers !== 'number' || !hardwareId) {
    return NextResponse.json(
      { error: 'Missing required fields: activeSubscribers, hardwareId' },
      { status: 400 },
    )
  }
  if (activeSubscribers < 0 || mapItemCount < 0) {
    return NextResponse.json({ error: 'Counts must be >= 0' }, { status: 400 })
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
    select: { id: true, name: true, subscription: true },
  })

  if (!client?.subscription) {
    return NextResponse.json({ error: 'No active subscription found for client' }, { status: 404 })
  }

  const sub = client.subscription

  if (!['ACTIVE', 'TRIAL'].includes(sub.status)) {
    return NextResponse.json(
      {
        error: `Subscription is not active (status: ${sub.status})`,
        currentPlan: buildPlanSummary(sub, activeSubscribers, mapItemCount),
      },
      { status: 422 },
    )
  }

  const region = (sub.region ?? 'BR') as Region
  const currentTierIndex = sub.subscriberTier
    ? PRICING_TIERS.findIndex((t) => t.label === sub.subscriberTier)
    : -1

  const newTier = getTierForUsage(activeSubscribers, mapItemCount)

  if (!newTier) {
    await maybeCreateTicket(client.id, client.name, {
      title: 'License capacity: enterprise pricing required',
      category: 'billing',
      priority: 'HIGH',
      body:
        `Usage exceeds the maximum automated package (12,000 clients / 90,000 map items).\n` +
        `Clients: ${activeSubscribers}. Map items: ${mapItemCount}.\n` +
        `Please contact Turboware for enterprise pricing.\nHardware: ${hardwareId}`,
      dedupeKey: 'enterprise-12k+',
    })
    return NextResponse.json(
      {
        ok: false,
        message: 'Usage exceeds maximum automated tier. Contact support for enterprise pricing.',
        activeSubscribers,
        mapItemCount,
        currentPlan: buildPlanSummary(sub, activeSubscribers, mapItemCount),
      },
      { status: 422 },
    )
  }

  const newTierIndex = PRICING_TIERS.findIndex((t) => t.label === newTier.label)
  const newPrice = getPriceForUsage(activeSubscribers, mapItemCount, region)

  if (newPrice === 'inquire') {
    return NextResponse.json(
      { error: 'New tier requires manual pricing. Contact support.' },
      { status: 422 },
    )
  }

  const now = new Date()

  // ── Same tier ─────────────────────────────────────────────────────────────
  if (newTierIndex === currentTierIndex) {
    const clearPending =
      !!sub.pendingDowngradeTier && sub.pendingDowngradeTier !== sub.subscriberTier

    await prisma.subscription.update({
      where: { id: sub.id },
      data: {
        lastSubscriberSync: now,
        lastMapItemSync: now,
        maxMapItems: newTier.maxMapItems,
        ...(clearPending ? { pendingDowngradeTier: null, pendingDowngradeAt: null } : {}),
      },
    })

    const approaching = await maybeApproachingLimitTicket(
      client.id,
      client.name,
      activeSubscribers,
      mapItemCount,
      newTier,
      hardwareId,
    )

    const refreshed = {
      ...sub,
      maxMapItems: newTier.maxMapItems,
      pendingDowngradeTier: clearPending ? null : sub.pendingDowngradeTier,
    }

    return NextResponse.json({
      ok: true,
      change: 'none',
      message: clearPending
        ? 'Usage synced — pending downgrade cleared.'
        : 'Usage synced — no tier change.',
      activeSubscribers,
      mapItemCount,
      approachingLimit: approaching,
      pendingDowngradeTier: refreshed.pendingDowngradeTier,
      currentPlan: buildPlanSummary(refreshed, activeSubscribers, mapItemCount),
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
          maxMapItems: newTier.maxMapItems,
          lastSubscriberSync: now,
          lastMapItemSync: now,
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
                notes: `Tier upgrade: ${sub.subscriberTier ?? 'previous'} → ${newTier.label} | ${activeSubscribers} clients / ${mapItemCount} map items | Prorated difference`,
              },
            }),
          ]
        : []),
    ])

    await linkClientProduct(client.id, newTier.label)

    await maybeCreateTicket(client.id, client.name, {
      title: `License upgraded to ${newTier.label}`,
      category: 'billing',
      priority: 'MEDIUM',
      body:
        `Your TurboISP package was upgraded from ${sub.subscriberTier ?? 'unknown'} to ${newTier.label}.\n` +
        `Clients: ${activeSubscribers} / ${newTier.maxSeats}. Map items: ${mapItemCount} / ${newTier.maxMapItems}.\n` +
        (proratedAmount > 0
          ? `A prorated invoice of ${proratedAmount.toFixed(2)} was created.\n`
          : '') +
        `Hardware: ${hardwareId}`,
      dedupeKey: `upgrade-${newTier.label}`,
    })

    return NextResponse.json({
      ok: true,
      change: 'upgrade',
      message: `Tier upgraded from ${sub.subscriberTier ?? 'unknown'} to ${newTier.label}.`,
      activeSubscribers,
      mapItemCount,
      previousTier: sub.subscriberTier,
      newTier: newTier.label,
      newMonthlyAmount: newPrice,
      approachingLimit: false,
      pendingDowngradeTier: null,
      proratedInvoice:
        proratedAmount > 0
          ? { amount: proratedAmount, dueDate: dueDate.toISOString() }
          : null,
      currentPlan: buildPlanSummary(
        {
          ...sub,
          subscriberTier: newTier.label,
          monthlyAmount: newPrice,
          maxMapItems: newTier.maxMapItems,
        },
        activeSubscribers,
        mapItemCount,
      ),
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
      lastMapItemSync: now,
    },
  })

  if (!alreadyPending) {
    await maybeCreateTicket(client.id, client.name, {
      title: `License downgrade scheduled to ${newTier.label}`,
      category: 'billing',
      priority: 'MEDIUM',
      body:
        `Usage now fits the ${newTier.label} package (current: ${sub.subscriberTier}).\n` +
        `Clients: ${activeSubscribers}. Map items: ${mapItemCount}.\n\n` +
        `Your plan will cycle down to ${newTier.label} at the next billing date. ` +
        `If usage rises again before then, the pending downgrade will be cancelled.\n` +
        `Hardware: ${hardwareId}`,
      dedupeKey: `downgrade-${sub.subscriberTier}-to-${newTier.label}`,
    })
  }

  const currentTier = getTierByLabel(sub.subscriberTier ?? '')

  return NextResponse.json({
    ok: true,
    change: 'downgrade_pending',
    message: `Downgrade from ${sub.subscriberTier} to ${newTier.label} is scheduled for your next billing cycle.`,
    activeSubscribers,
    mapItemCount,
    currentTier: sub.subscriberTier,
    pendingDowngradeTier: newTier.label,
    pendingDowngradeAt: now.toISOString(),
    approachingLimit: false,
    currentPlan: buildPlanSummary(
      {
        ...sub,
        pendingDowngradeTier: newTier.label,
        maxMapItems: currentTier?.maxMapItems ?? sub.maxMapItems,
      },
      activeSubscribers,
      mapItemCount,
    ),
  })
}

async function linkClientProduct(clientId: string, tierLabel: string) {
  const product = await prisma.product.findUnique({
    where: { slug: 'turboisp' },
    include: { tiers: { where: { name: tierLabel }, take: 1 } },
  })
  if (!product) return
  const tierId = product.tiers[0]?.id ?? null
  await prisma.clientProduct.upsert({
    where: { clientId_productId: { clientId, productId: product.id } },
    create: {
      clientId,
      productId: product.id,
      tierId,
      status: 'ACTIVE',
      activatedAt: new Date(),
    },
    update: {
      tierId,
      status: 'ACTIVE',
      activatedAt: new Date(),
    },
  })
}

async function maybeApproachingLimitTicket(
  clientId: string,
  clientName: string | null,
  activeSubscribers: number,
  mapItemCount: number,
  tier: PricingTier,
  hardwareId: string,
): Promise<boolean> {
  if (tier.maxSeats == null || tier.maxMapItems == null) return false
  const clientRemaining = tier.maxSeats - activeSubscribers
  const mapRemaining = tier.maxMapItems - mapItemCount
  const nearClients = clientRemaining >= 0 && clientRemaining <= 10
  const nearMaps = mapRemaining >= 0 && mapRemaining <= 10
  if (!nearClients && !nearMaps) return false

  const tight: string[] = []
  if (nearClients) tight.push(`clients ${activeSubscribers}/${tier.maxSeats} (${clientRemaining} left)`)
  if (nearMaps) tight.push(`map items ${mapItemCount}/${tier.maxMapItems} (${mapRemaining} left)`)

  await maybeCreateTicket(clientId, clientName, {
    title: `License capacity: approaching ${tier.label} limit`,
    category: 'billing',
    priority: 'HIGH',
    body:
      `You are within 10 of a ${tier.label} package cap.\n` +
      `${tight.join('; ')}.\n` +
      `TurboISP will automatically upgrade when either meter exceeds this package.\n` +
      `Hardware: ${hardwareId}`,
    dedupeKey: `approaching-${tier.label}`,
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

function buildPlanSummary(
  sub: {
    status: string
    subscriberTier: string | null
    monthlyAmount: number | null
    region: string | null
    billingDate: number
    maxMapItems?: number | null
    pendingDowngradeTier?: string | null
  },
  activeSubscribers?: number,
  mapItemCount?: number,
) {
  const tier = getTierByLabel(sub.subscriberTier ?? '') ?? PRICING_TIERS.find((t) => t.label === sub.subscriberTier)
  const maxSeats = tier?.maxSeats ?? null
  const maxMapItems = sub.maxMapItems ?? tier?.maxMapItems ?? null
  return {
    status: sub.status,
    subscriberTier: sub.subscriberTier,
    monthlyAmount: sub.monthlyAmount,
    region: sub.region ?? 'BR',
    billingDate: sub.billingDate,
    maxSeats,
    maxMapItems,
    remaining:
      maxSeats != null && activeSubscribers != null
        ? Math.max(0, maxSeats - activeSubscribers)
        : null,
    mapRemaining:
      maxMapItems != null && mapItemCount != null
        ? Math.max(0, maxMapItems - mapItemCount)
        : null,
    pendingDowngradeTier: sub.pendingDowngradeTier ?? null,
  }
}
