import { ClientProductStatus, type Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { applySubscriptionLicenseSync } from '@/lib/billing'
import { getPriceByLabel, getTierByLabel, type Region } from '@/lib/pricing'
import { ensureDefaultCatalog } from '@/lib/product-catalog'

const VALID_STATUSES = Object.values(ClientProductStatus)
const VALID_REGIONS: Region[] = ['BR', 'CA', 'US', 'GB']

export type CatalogProductRow = {
  id: string
  name: string
  slug: string
  description: string | null
  logoEmoji: string | null
  active: boolean
  sortOrder: number
  tiers: {
    id: string
    name: string
    description: string | null
    maxSeats: number | null
    maxMapItems: number | null
    sortOrder: number
  }[]
  activation: {
    id: string
    status: ClientProductStatus
    tierId: string | null
    notes: string | null
    activatedAt: Date | null
    expiresAt: Date | null
    tier: { id: string; name: string } | null
  } | null
}

export async function listClientCatalog(clientId: string): Promise<CatalogProductRow[]> {
  await ensureDefaultCatalog()
  const [products, activations] = await Promise.all([
    prisma.product.findMany({
      where: { active: true },
      orderBy: { sortOrder: 'asc' },
      include: { tiers: { orderBy: { sortOrder: 'asc' } } },
    }),
    prisma.clientProduct.findMany({
      where: { clientId },
      include: { tier: { select: { id: true, name: true } } },
    }),
  ])

  const byProduct = Object.fromEntries(activations.map((a) => [a.productId, a]))

  return products.map((p) => {
    const act = byProduct[p.id] ?? null
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      logoEmoji: p.logoEmoji,
      active: p.active,
      sortOrder: p.sortOrder,
      tiers: p.tiers.map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        maxSeats: t.maxSeats,
        maxMapItems: t.maxMapItems,
        sortOrder: t.sortOrder,
      })),
      activation: act
        ? {
            id: act.id,
            status: act.status,
            tierId: act.tierId,
            notes: act.notes,
            activatedAt: act.activatedAt,
            expiresAt: act.expiresAt,
            tier: act.tier,
          }
        : null,
    }
  })
}

async function syncTurboIspSubscription(opts: {
  clientId: string
  status?: ClientProductStatus
  tierName?: string | null
}) {
  const sub = await prisma.subscription.findUnique({ where: { clientId: opts.clientId } })
  if (!sub) return

  const data: Prisma.SubscriptionUpdateInput = {}

  if (opts.tierName) {
    const pricing = getTierByLabel(opts.tierName)
    const region = VALID_REGIONS.includes((sub.region ?? 'BR') as Region)
      ? ((sub.region ?? 'BR') as Region)
      : 'BR'
    const price = getPriceByLabel(opts.tierName, region)
    if (pricing && price !== 'inquire') {
      data.subscriberTier = opts.tierName
      data.monthlyAmount = price
      data.maxMapItems = pricing.maxMapItems
      data.seats = pricing.maxSeats ?? sub.seats
      data.pendingDowngradeTier = null
      data.pendingDowngradeAt = null
      data.region = region
    }
  }

  if (opts.status === 'ACTIVE') data.status = 'ACTIVE'
  if (opts.status === 'SUSPENDED') data.status = 'SUSPENDED'
  if (opts.status === 'CANCELLED') {
    data.status = 'CANCELLED'
    data.gracePeriodEndsAt = null
  }

  if (Object.keys(data).length === 0) return

  const updated = await prisma.subscription.update({
    where: { id: sub.id },
    data,
  })

  await applySubscriptionLicenseSync({
    clientId: updated.clientId,
    licenseId: updated.licenseId,
    subscriptionStatus: updated.status,
  })
}

export async function upsertClientProduct(opts: {
  clientId: string
  productId: string
  status?: ClientProductStatus
  tierId?: string | null
}) {
  const product = await prisma.product.findUnique({
    where: { id: opts.productId },
    include: { tiers: true },
  })
  if (!product) return { error: 'Product not found', status: 404 as const }

  if (opts.status && !VALID_STATUSES.includes(opts.status)) {
    return { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`, status: 400 as const }
  }

  let tierName: string | null = null
  if (opts.tierId !== undefined && opts.tierId !== null) {
    const tier = product.tiers.find((t) => t.id === opts.tierId)
    if (!tier) return { error: 'Tier not found for this product', status: 400 as const }
    tierName = tier.name
  }

  const existing = await prisma.clientProduct.findUnique({
    where: { clientId_productId: { clientId: opts.clientId, productId: opts.productId } },
  })

  const nextStatus =
    opts.status ??
    (opts.tierId !== undefined && existing?.status === 'CANCELLED' ? 'ACTIVE' : existing?.status) ??
    'ACTIVE'
  const nextTierId = opts.tierId === undefined ? existing?.tierId ?? null : opts.tierId

  const activation = existing
    ? await prisma.clientProduct.update({
        where: { id: existing.id },
        data: {
          status: nextStatus,
          tierId: nextTierId,
          activatedAt:
            nextStatus === 'ACTIVE'
              ? existing.activatedAt ?? new Date()
              : existing.activatedAt,
          expiresAt: nextStatus === 'CANCELLED' ? new Date() : null,
        },
        include: { tier: { select: { id: true, name: true } }, product: { select: { slug: true } } },
      })
    : await prisma.clientProduct.create({
        data: {
          clientId: opts.clientId,
          productId: opts.productId,
          status: nextStatus,
          tierId: nextTierId,
          activatedAt: nextStatus === 'ACTIVE' ? new Date() : null,
        },
        include: { tier: { select: { id: true, name: true } }, product: { select: { slug: true } } },
      })

  if (activation.product.slug === 'turboisp') {
    await syncTurboIspSubscription({
      clientId: opts.clientId,
      status: nextStatus,
      tierName: activation.tier?.name ?? tierName,
    })
  }

  return { activation }
}
