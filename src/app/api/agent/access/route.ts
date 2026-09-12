import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { resolveAccessGate } from '@/lib/access-gate'
import { turbowarePortalLoginUrl } from '@/lib/portal-url'

/**
 * GET /api/agent/access?tenantSlug=acme
 * or ?cnpj=14digits
 * Protected by Authorization: Bearer <CLIENT_API_KEY>
 */
export async function GET(req: NextRequest) {
  const clientApiKey = process.env.CLIENT_API_KEY
  if (clientApiKey) {
    const auth = req.headers.get('authorization')
    if (!auth || auth !== `Bearer ${clientApiKey}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const slug = (req.nextUrl.searchParams.get('tenantSlug') ?? '').trim().toLowerCase()
  const cnpj = (req.nextUrl.searchParams.get('cnpj') ?? '').replace(/\D/g, '')
  if (!slug && cnpj.length !== 14) {
    return NextResponse.json({ error: 'Provide tenantSlug or a valid 14-digit cnpj' }, { status: 400 })
  }

  let clientId: string | null = null
  if (cnpj.length === 14) {
    const rows = await prisma.$queryRaw<{ id: string }[]>`
      SELECT id FROM clients
      WHERE regexp_replace(cnpj, '[^0-9]', '', 'g') = ${cnpj}
      LIMIT 1
    `
    clientId = rows[0]?.id ?? null
  }
  if (!clientId && slug) {
    const bySlug = await prisma.client.findFirst({
      where: { subdomain: slug },
      select: { id: true },
    })
    clientId = bySlug?.id ?? null
  }
  if (!clientId) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  }

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: {
      subscription: {
        include: {
          invoices: { select: { status: true, type: true, dueDate: true, createdAt: true } },
          license: { select: { status: true } },
        },
      },
    },
  })

  if (!client?.subscription) {
    return NextResponse.json({
      mode: 'blocked',
      daysRemaining: 0,
      graceEndsAt: null,
      reason: 'no_subscription',
      portalUrl: turbowarePortalLoginUrl(req.nextUrl.origin),
    })
  }

  const sub = client.subscription
  const gate = resolveAccessGate({
    subscriptionStatus: sub.status,
    licenseStatus: sub.license?.status ?? null,
    invoices: sub.invoices,
    gracePeriodEndsAt: sub.gracePeriodEndsAt,
  })

  return NextResponse.json({
    ...gate,
    portalUrl: turbowarePortalLoginUrl(req.nextUrl.origin),
  })
}
