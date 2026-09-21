import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { generateLicenseKey } from '@/lib/license'
import { generateTemporaryPassword } from '@/lib/temporary-password'
import { sendTemporaryPasswordEmail } from '@/lib/email'
import { getPriceByLabel, getTierByLabel, type Region } from '@/lib/pricing'
import { parseSignupSlug } from '@/lib/signup-slug'
import { defaultCurrencyForCountry, type SignupCountryCode } from '@/lib/signup-countries'
import { createTurboISPTenant, STARTER_STAFF_PASSWORD, STARTER_STAFF_USERNAME } from '@/lib/turboisp-bootstrap'

const VALID_REGIONS: Region[] = ['BR', 'CA', 'US', 'GB']

export type OnboardTenantInput = {
  name: string
  email?: string | null
  phone?: string | null
  company?: string | null
  internalNotes?: string | null
  notes?: string | null
  subdomain?: string | null
  region?: string | null
  subscriberTier?: string | null
  product?: string | null
  createLicense?: boolean
  createSubscription?: boolean
  provisionTurboISP?: boolean
  createPortalAccess?: boolean
  trialDays?: number
}

export type OnboardTenantResult = {
  id: string
  licenseKey?: string
  temporaryPassword?: string
  emailed?: boolean
  turboisp?: { slug: string; staffLoginUrl: string; adminUsername: string; adminPassword: string }
  warnings: string[]
}

function countryForRegion(region: Region): SignupCountryCode {
  if (region === 'BR') return 'BR'
  if (region === 'CA') return 'CA'
  return 'US'
}

export async function onboardTenant(input: OnboardTenantInput): Promise<OnboardTenantResult> {
  const name = input.name.trim()
  if (!name) throw new Error('name is required')

  const email = input.email?.trim().toLowerCase() || null
  const notes = (input.internalNotes ?? input.notes)?.trim() || null
  const warnings: string[] = []
  const product = input.product?.trim() || 'TurboISP'
  const region: Region = VALID_REGIONS.includes(input.region as Region)
    ? (input.region as Region)
    : 'BR'

  let slug: string | null = null
  if (input.subdomain?.trim()) {
    const parsed = parseSignupSlug(input.subdomain)
    if ('error' in parsed) throw new Error(parsed.error)
    if (!parsed.slug) throw new Error('Subdomain must use letters or numbers (a–z, 0–9)')
    slug = parsed.slug
    const taken = await prisma.client.findFirst({
      where: { subdomain: slug },
      select: { id: true },
    })
    if (taken) throw new Error('This subdomain is already in use')
  }

  if (email) {
    const emailTaken = await prisma.client.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
      select: { id: true },
    })
    if (emailTaken) throw new Error('An account with this email already exists')
  }

  const createPlan = Boolean(input.subscriberTier || input.createSubscription || input.createLicense)
  const tier = input.subscriberTier ? getTierByLabel(input.subscriberTier) : undefined
  if (input.subscriberTier && !tier) throw new Error('Unknown subscriber tier')

  let monthlyAmount: number | null = null
  if (tier) {
    const price = getPriceByLabel(tier.label, region)
    if (price === 'inquire') throw new Error('This tier requires a custom quote')
    monthlyAmount = price
  }

  const createPortalAccess = Boolean(input.createPortalAccess && email)
  const temporaryPassword = createPortalAccess ? generateTemporaryPassword() : undefined
  const passwordHash = temporaryPassword ? await bcrypt.hash(temporaryPassword, 12) : undefined

  const client = await prisma.client.create({
    data: {
      name,
      email,
      phone: input.phone?.trim() || null,
      company: input.company?.trim() || null,
      internalNotes: notes,
      subdomain: slug,
      password: passwordHash,
      mustChangePassword: Boolean(passwordHash),
    },
    select: { id: true },
  })

  const result: OnboardTenantResult = { id: client.id, warnings }

  if (createPlan) {
    const trialDays = Number.isFinite(input.trialDays) ? Math.max(0, Number(input.trialDays)) : 14
    const seats = tier?.maxSeats ?? 1
    const shouldLicense = input.createLicense !== false

    let licenseId: string | undefined
    if (shouldLicense) {
      const license = await prisma.license.create({
        data: {
          key: generateLicenseKey(),
          product,
          clientId: client.id,
          maxSeats: seats,
          status: 'ACTIVE',
        },
        select: { id: true, key: true },
      })
      licenseId = license.id
      result.licenseKey = license.key
    }

    await prisma.subscription.create({
      data: {
        clientId: client.id,
        licenseId: licenseId ?? null,
        product,
        seats,
        status: trialDays > 0 ? 'TRIAL' : 'PENDING_PAYMENT',
        billingDate: Math.min(new Date().getDate(), 28),
        trialEndsAt: trialDays > 0 ? new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000) : null,
        region,
        subscriberTier: tier?.label ?? null,
        monthlyAmount,
        maxMapItems: tier?.maxMapItems ?? null,
      },
    })

    const catalog = await prisma.product.findUnique({
      where: { slug: product.toLowerCase().replace(/\s+/g, '') },
      include: { tiers: { where: tier ? { name: tier.label } : undefined, take: 1 } },
    })
    if (catalog) {
      await prisma.clientProduct.upsert({
        where: { clientId_productId: { clientId: client.id, productId: catalog.id } },
        create: {
          clientId: client.id,
          productId: catalog.id,
          tierId: catalog.tiers[0]?.id ?? null,
          status: 'ACTIVE',
          activatedAt: new Date(),
        },
        update: {
          tierId: catalog.tiers[0]?.id ?? null,
          status: 'ACTIVE',
          activatedAt: new Date(),
        },
      })
    }
  }

  if (temporaryPassword && email) {
    result.temporaryPassword = temporaryPassword
    try {
      await sendTemporaryPasswordEmail(email, temporaryPassword)
      result.emailed = true
    } catch (err) {
      console.error('[onboard-tenant] portal invite email failed:', err)
      result.emailed = false
      warnings.push('Client created, but the portal password email could not be sent')
    }
  }

  if (input.provisionTurboISP) {
    if (!slug) {
      warnings.push('TurboISP provisioning skipped — subdomain is required')
    } else if (!process.env.TURBOISP_DATABASE_URL) {
      warnings.push('TurboISP provisioning skipped — TURBOISP_DATABASE_URL is not set')
    } else {
      try {
        const bootstrap = await createTurboISPTenant({
          name: input.company?.trim() || name,
          slug,
          adminUsername: STARTER_STAFF_USERNAME,
          adminEmail: email || `${STARTER_STAFF_USERNAME}@${slug}.local`,
          adminPassword: STARTER_STAFF_PASSWORD,
          countryCode: countryForRegion(region),
          currency: defaultCurrencyForCountry(countryForRegion(region)),
        })
        result.turboisp = {
          slug: bootstrap.slug,
          staffLoginUrl: bootstrap.staffLoginUrl,
          adminUsername: bootstrap.adminUsername,
          adminPassword: STARTER_STAFF_PASSWORD,
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'TurboISP provisioning failed'
        console.error('[onboard-tenant] TurboISP bootstrap failed:', err)
        warnings.push(message)
      }
    }
  }

  return result
}
