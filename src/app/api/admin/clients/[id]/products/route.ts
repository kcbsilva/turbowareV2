import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseBody, badRequest } from '@/lib/api'
import { createClientLicense, listClientLicenses } from '@/lib/client-products'

type Params = { params: Promise<{ id: string }> }

// GET /api/admin/clients/[id]/products — assigned licenses only
export async function GET(_req: Request, { params }: Params) {
  const { id } = await params
  const client = await prisma.client.findUnique({ where: { id }, select: { id: true } })
  if (!client) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const payload = await listClientLicenses(id)
  return NextResponse.json(payload)
}

// POST /api/admin/clients/[id]/products — issue a new product license
export async function POST(req: NextRequest, { params }: Params) {
  const { id: clientId } = await params
  const { body, error } = await parseBody<{
    productId?: string
    tierId?: string
    dueDate?: string
    tenantSlug?: string
  }>(req)
  if (error) return badRequest()

  const client = await prisma.client.findUnique({ where: { id: clientId }, select: { id: true } })
  if (!client) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (!body.productId || !body.tierId || !body.dueDate || !body.tenantSlug) {
    return NextResponse.json(
      { error: 'productId, tierId, dueDate, and tenantSlug are required' },
      { status: 400 },
    )
  }

  const result = await createClientLicense({
    clientId,
    productId: body.productId,
    tierId: body.tierId,
    dueDate: body.dueDate,
    tenantSlug: body.tenantSlug,
  })

  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: result.status })
  }

  return NextResponse.json(
    { ...result.activation, turboisp: result.turboisp ?? null },
    { status: 201 },
  )
}
