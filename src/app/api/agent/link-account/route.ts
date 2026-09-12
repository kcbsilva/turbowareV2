import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { resolveAccessGate } from '@/lib/access-gate'
import { turbowarePortalLoginUrl } from '@/lib/portal-url'
import { normalizePortalEmail } from '@/lib/portal-email'

/**
 * POST /api/agent/link-account
 * Confirm this TurboISP tenant (by slug) against the portal client that owns that subdomain.
 * Protected by Authorization: Bearer <CLIENT_API_KEY>
 */
type Body = {
  password?: string
  tenantSlug?: string
  hardwareId?: string
}

const DUMMY_HASH = '$2b$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012345'

export async function POST(req: NextRequest) {
  const clientApiKey = process.env.CLIENT_API_KEY
  if (clientApiKey) {
    const auth = req.headers.get('authorization')
    if (!auth || auth !== `Bearer ${clientApiKey}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const body = (await req.json().catch(() => null)) as Body | null
  if (!body) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const password = body.password ?? ''
  const slug = (body.tenantSlug ?? '').trim().toLowerCase()
  const hardwareId = (body.hardwareId ?? '').trim()

  if (!password || !slug) {
    return NextResponse.json(
      { error: 'password and tenantSlug are required' },
      { status: 400 },
    )
  }

  const client = await prisma.client.findFirst({
    where: { subdomain: slug },
    select: {
      id: true,
      name: true,
      email: true,
      cnpj: true,
      password: true,
    },
  })

  const passwordValid = await bcrypt.compare(password, client?.password ?? DUMMY_HASH)
  if (!client) {
    return NextResponse.json(
      { error: 'No portal account is assigned to this TurboISP site.' },
      { status: 404 },
    )
  }
  if (!client.password || !passwordValid) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  const subscription = await prisma.subscription.findUnique({
    where: { clientId: client.id },
    include: {
      invoices: { select: { status: true, type: true, dueDate: true, createdAt: true } },
      license: { select: { status: true, id: true } },
    },
  })

  if (subscription?.license && hardwareId) {
    const existing = await prisma.activation.findUnique({
      where: { licenseId_hardwareId: { licenseId: subscription.license.id, hardwareId } },
    })
    if (existing) {
      await prisma.activation.update({
        where: { id: existing.id },
        data: { lastSeenAt: new Date(), label: 'turboisp-account' },
      })
    } else {
      await prisma.activation.create({
        data: {
          licenseId: subscription.license.id,
          hardwareId,
          label: 'turboisp-account',
        },
      })
    }
  }

  const gate = subscription
    ? resolveAccessGate({
        subscriptionStatus: subscription.status,
        licenseStatus: subscription.license?.status ?? null,
        invoices: subscription.invoices,
        gracePeriodEndsAt: subscription.gracePeriodEndsAt,
      })
    : { mode: 'blocked' as const, daysRemaining: 0, graceEndsAt: null, reason: 'no_subscription' }

  return NextResponse.json({
    ok: true,
    slug,
    email: normalizePortalEmail(client.email ?? ''),
    name: client.name,
    cnpj: client.cnpj ?? '',
    access: {
      ...gate,
      portalUrl: turbowarePortalLoginUrl(req.nextUrl.origin),
    },
  })
}
