import { prisma } from '@/lib/prisma'
import { PRICING_TIERS } from '@/lib/pricing'

const DEFAULTS = [
  {
    slug: 'turboisp',
    name: 'TurboISP',
    logoEmoji: '📡',
    description: 'ISP operations, billing, and plant management',
    sortOrder: 0,
    withPricingTiers: true,
  },
  {
    slug: 'turbochat',
    name: 'TurboChat',
    logoEmoji: '💬',
    description: 'Customer messaging and support',
    sortOrder: 1,
    withPricingTiers: false,
  },
  {
    slug: 'turbogis',
    name: 'TurboGIS',
    logoEmoji: '🗺️',
    description: 'Network mapping and GIS',
    sortOrder: 2,
    withPricingTiers: false,
  },
] as const

const SIMPLE_TIERS = ['Starter', 'Pro', 'Enterprise']

function turboIspTierRows() {
  return PRICING_TIERS.map((t, i) => ({
    name: t.label,
    maxSeats: t.maxSeats,
    maxMapItems: t.maxMapItems,
    priceBR: typeof t.prices.BR === 'number' ? t.prices.BR : null,
    priceCA: typeof t.prices.CA === 'number' ? t.prices.CA : null,
    priceUS: typeof t.prices.US === 'number' ? t.prices.US : null,
    priceGB: typeof t.prices.GB === 'number' ? t.prices.GB : null,
    sortOrder: i,
  }))
}

/** Idempotent catalog so the licenses tab always has TurboISP, TurboChat, TurboGIS. */
export async function ensureDefaultCatalog() {
  for (const item of DEFAULTS) {
    const existing = await prisma.product.findUnique({
      where: { slug: item.slug },
      include: { tiers: { select: { id: true } } },
    })

    if (!existing) {
      await prisma.product.create({
        data: {
          name: item.name,
          slug: item.slug,
          description: item.description,
          logoEmoji: item.logoEmoji,
          active: true,
          sortOrder: item.sortOrder,
          tiers: {
            create: item.withPricingTiers
              ? turboIspTierRows()
              : SIMPLE_TIERS.map((name, i) => ({ name, sortOrder: i })),
          },
        },
      })
      continue
    }

    if (existing.tiers.length > 0) continue

    if (item.withPricingTiers) {
      await prisma.productTier.createMany({
        data: turboIspTierRows().map((row) => ({ ...row, productId: existing.id })),
      })
    } else {
      await prisma.productTier.createMany({
        data: SIMPLE_TIERS.map((name, i) => ({
          productId: existing.id,
          name,
          sortOrder: i,
        })),
      })
    }
  }
}
