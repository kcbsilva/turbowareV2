import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseBody, badRequest } from '@/lib/api'
import { onboardTenant } from '@/lib/onboard-tenant'

export const dynamic = 'force-dynamic'

// GET /api/admin/clients — list all clients with license count
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const search = searchParams.get('search') || ''

  const clients = await prisma.client.findMany({
    where: search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { company: { contains: search, mode: 'insensitive' } },
          ],
        }
      : undefined,
    select: {
      id: true,
      name: true,
      company: true,
      email: true,
      phone: true,
      createdAt: true,
      _count: { select: { licenses: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(clients, {
    headers: { 'Cache-Control': 'no-store' },
  })
}

// POST /api/admin/clients — create a client, optionally with plan + license + tenant
export async function POST(req: NextRequest) {
  const { body: parsed, error } = await parseBody<{
    name?: string
    email?: string
    phone?: string
    company?: string
    internalNotes?: string
    notes?: string
    subdomain?: string
    region?: string
    subscriberTier?: string
    product?: string
    createLicense?: boolean
    createSubscription?: boolean
    provisionTurboISP?: boolean
    createPortalAccess?: boolean
    trialDays?: number
  }>(req)
  if (error) return badRequest()

  if (!parsed.name?.trim()) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 })
  }

  try {
    const result = await onboardTenant({
      name: parsed.name,
      email: parsed.email,
      phone: parsed.phone,
      company: parsed.company,
      internalNotes: parsed.internalNotes,
      notes: parsed.notes,
      subdomain: parsed.subdomain,
      region: parsed.region,
      subscriberTier: parsed.subscriberTier,
      product: parsed.product,
      createLicense: parsed.createLicense,
      createSubscription: parsed.createSubscription,
      provisionTurboISP: parsed.provisionTurboISP,
      createPortalAccess: parsed.createPortalAccess,
      trialDays: parsed.trialDays,
    })
    return NextResponse.json(result, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create client'
    const status =
      message.includes('already') || message.includes('in use') ? 409 : 400
    return NextResponse.json({ error: message }, { status })
  }
}
