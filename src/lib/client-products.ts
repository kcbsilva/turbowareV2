import { ClientProductStatus, type Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { reconcileSubscriptionLicenseSync } from '@/lib/billing'
import { getPriceByLabel, getTierByLabel, type Region } from '@/lib/pricing'
import { ensureDefaultCatalog } from '@/lib/product-catalog'
import { isValidSignupSlug, normalizeSignupSlug } from '@/lib/signup-slug'
import { defaultCurrencyForCountry, type SignupCountryCode } from '@/lib/signup-countries'
import { RESERVED_SLUGS } from '@/lib/slug'
import { generateTemporaryPassword } from '@/lib/temporary-password'
import { createTurboISPTenant } from '@/lib/turboisp-bootstrap'
import { isTurboISPTenantSlugTaken } from '@/lib/turboisp-tenant-slug-check'

const VALID_STATUSES = Object.values(ClientProductStatus)
const VALID_REGIONS: Region[] = ['BR', 'CA', 'US', 'GB']

export type ClientLicenseRow = {
  id: string
  productId: string
  status: ClientProductStatus
  tierId: string | null
  tenantSlug: string | null
  expiresAt: Date | null
  activatedAt: Date | null
  product: { id: string; name: string; slug: string; logoEmoji: string | null }
  tier: { id: string; name: string } | null
}

export async function listClientLicenses(clientId: string): Promise<{
  defaultSlug: string | null
  licenses: ClientLicenseRow[]
}> {
  await ensureDefaultCatalog()
  await reconcileSubscriptionLicenseSync(clientId)
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: {
      subdomain: true,
      products: {
        orderBy: { createdAt: 'desc' },
        include: {
          product: { select: { id: true, name: true, slug: true, logoEmoji: true } },
          tier: { select: { id: true, name: true } },
        },
      },
    },
  })
  if (!client) return { defaultSlug: null, licenses: [] }

  return {
    defaultSlug: client.subdomain,
    licenses: client.products.map((row) => ({
      id: row.id,
      productId: row.productId,
      status: row.status,
      tierId: row.tierId,
      tenantSlug: row.tenantSlug,
      expiresAt: row.expiresAt,
      activatedAt: row.activatedAt,
      product: row.product,
      tier: row.tier,
    })),
  }
}

function parseDueDate(raw: string): Date | null {
  const trimmed = raw.trim()
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return null
  const d = new Date(`${trimmed}T12:00:00.000Z`)
  return Number.isNaN(d.getTime()) ? null : d
}

function parseTenantSlug(raw: string): { slug: string } | { error: string } {
  const slug = normalizeSignupSlug(raw)
  if (!slug) return { error: 'Tenant slug is required' }
  if (RESERVED_SLUGS.has(slug) || !isValidSignupSlug(slug)) {
    return { error: 'Invalid tenant slug' }
  }
  return { slug }
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
  if (opts.status === 'PENDING') data.status = 'PENDING_PAYMENT'
  if (opts.status === 'SUSPENDED') data.gracePeriodEndsAt = null
  if (opts.status === 'CANCELLED') {
    data.status = 'CANCELLED'
    data.gracePeriodEndsAt = null
  }

  if (Object.keys(data).length > 0) {
    await prisma.subscription.update({ where: { id: sub.id }, data })
  }
  await reconcileSubscriptionLicenseSync(opts.clientId, { activateLicenses: opts.status === 'ACTIVE' })
}

async function assertSlugAvailable(clientId: string, slug: string) {
  const taken = await prisma.client.findFirst({
    where: { subdomain: slug, NOT: { id: clientId } },
    select: { id: true },
  })
  if (taken) return { error: 'This tenant slug is already in use', status: 409 as const }
  return null
}

function countryForRegion(region: Region): SignupCountryCode {
  if (region === 'BR') return 'BR'
  if (region === 'CA') return 'CA'
  return 'US'
}

async function ensureTurboIspTenant(clientId: string, slug: string): Promise<
  | { ok: true; provisioned?: { adminUsername: string; staffLoginUrl: string; temporaryPassword: string } }
  | { ok: false; error: string; status: number }
> {
  if (!process.env.TURBOISP_DATABASE_URL?.trim()) {
    return { ok: false, error: 'TurboISP database is not configured', status: 503 }
  }

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: {
      name: true,
      email: true,
      company: true,
      subscription: { select: { region: true } },
    },
  })
  if (!client) return { ok: false, error: 'Not found', status: 404 }

  const lookup = await isTurboISPTenantSlugTaken(slug)
  if (!('error' in lookup) && lookup.taken) {
    return { ok: true }
  }

  const region: Region = VALID_REGIONS.includes((client.subscription?.region ?? 'BR') as Region)
    ? ((client.subscription?.region ?? 'BR') as Region)
    : 'BR'
  const country = countryForRegion(region)
  const password = generateTemporaryPassword()

  try {
    const bootstrap = await createTurboISPTenant({
      name: client.company?.trim() || client.name,
      slug,
      adminUsername: `${slug}.admin`,
      adminEmail: client.email || `${slug}.admin@${slug}.local`,
      adminPassword: password,
      countryCode: country,
      currency: defaultCurrencyForCountry(country),
    })
    return {
      ok: true,
      provisioned: {
        adminUsername: bootstrap.adminUsername,
        staffLoginUrl: bootstrap.staffLoginUrl,
        temporaryPassword: password,
      },
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'TurboISP provisioning failed'
    if (message.includes('slug already in use')) return { ok: true }
    console.error('[client-products] TurboISP bootstrap failed:', err)
    return { ok: false, error: message, status: 502 }
  }
}

export async function createClientLicense(opts: {
  clientId: string
  productId: string
  tierId: string
  dueDate: string
  tenantSlug: string
}) {
  const product = await prisma.product.findUnique({
    where: { id: opts.productId },
    include: { tiers: true },
  })
  if (!product) return { error: 'Product not found', status: 404 as const }

  const tier = product.tiers.find((t) => t.id === opts.tierId)
  if (!tier) return { error: 'Tier not found for this product', status: 400 as const }

  const due = parseDueDate(opts.dueDate)
  if (!due) return { error: 'Due date is required (YYYY-MM-DD)', status: 400 as const }

  const parsedSlug = parseTenantSlug(opts.tenantSlug)
  if ('error' in parsedSlug) return { error: parsedSlug.error, status: 400 as const }

  const slugConflict = await assertSlugAvailable(opts.clientId, parsedSlug.slug)
  if (slugConflict) return slugConflict

  const existing = await prisma.clientProduct.findUnique({
    where: { clientId_productId: { clientId: opts.clientId, productId: opts.productId } },
  })
  if (existing && existing.status !== 'CANCELLED') {
    return { error: 'This client already has a license for that product', status: 409 as const }
  }

  let turboisp: {
    adminUsername: string
    staffLoginUrl: string
    temporaryPassword: string
  } | undefined
  if (product.slug === 'turboisp') {
    const provision = await ensureTurboIspTenant(opts.clientId, parsedSlug.slug)
    if (!provision.ok) return { error: provision.error, status: provision.status }
    turboisp = provision.provisioned
  }

  const activation = existing
    ? await prisma.clientProduct.update({
        where: { id: existing.id },
        data: {
          status: 'ACTIVE',
          tierId: tier.id,
          tenantSlug: parsedSlug.slug,
          expiresAt: due,
          activatedAt: new Date(),
        },
        include: {
          tier: { select: { id: true, name: true } },
          product: { select: { id: true, name: true, slug: true, logoEmoji: true } },
        },
      })
    : await prisma.clientProduct.create({
        data: {
          clientId: opts.clientId,
          productId: opts.productId,
          tierId: tier.id,
          tenantSlug: parsedSlug.slug,
          status: 'ACTIVE',
          expiresAt: due,
          activatedAt: new Date(),
        },
        include: {
          tier: { select: { id: true, name: true } },
          product: { select: { id: true, name: true, slug: true, logoEmoji: true } },
        },
      })

  if (activation.product.slug === 'turboisp') {
    await prisma.client.update({
      where: { id: opts.clientId },
      data: { subdomain: parsedSlug.slug },
    })
    await syncTurboIspSubscription({
      clientId: opts.clientId,
      tierName: tier.name,
    })
  }

  const current = await prisma.clientProduct.findUniqueOrThrow({
    where: { id: activation.id },
    include: {
      tier: { select: { id: true, name: true } },
      product: { select: { id: true, name: true, slug: true, logoEmoji: true } },
    },
  })
  return { activation: current, turboisp }
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
  if (!existing) return { error: 'License not found', status: 404 as const }

  const nextStatus = opts.status ?? existing.status
  const nextTierId = opts.tierId === undefined ? existing.tierId : opts.tierId

  const activation = await prisma.clientProduct.update({
    where: { id: existing.id },
    data: {
      status: nextStatus,
      tierId: nextTierId,
    },
    include: { tier: { select: { id: true, name: true } }, product: { select: { slug: true } } },
  })

  if (activation.product.slug === 'turboisp') {
    await syncTurboIspSubscription({
      clientId: opts.clientId,
      status: opts.status,
      tierName: activation.tier?.name ?? tierName,
    })
  }

  const current = await prisma.clientProduct.findUniqueOrThrow({
    where: { id: activation.id },
    include: { tier: { select: { id: true, name: true } }, product: { select: { slug: true } } },
  })
  return { activation: current }
}
