import { NextRequest, NextResponse } from 'next/server'
import { ClientProductStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { parseBody, badRequest } from '@/lib/api'
import { upsertClientProduct } from '@/lib/client-products'

type Params = { params: Promise<{ id: string; productId: string }> }

// PATCH /api/admin/clients/[id]/products/[productId]
export async function PATCH(req: NextRequest, { params }: Params) {
  const { id: clientId, productId } = await params
  const { body, error } = await parseBody<{ status?: string; tierId?: string | null }>(req)
  if (error) return badRequest()

  const client = await prisma.client.findUnique({ where: { id: clientId }, select: { id: true } })
  if (!client) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (body.status === undefined && body.tierId === undefined) {
    return NextResponse.json({ error: 'status or tierId is required' }, { status: 400 })
  }

  const result = await upsertClientProduct({
    clientId,
    productId,
    status: body.status as ClientProductStatus | undefined,
    tierId: body.tierId,
  })

  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: result.status })
  }

  return NextResponse.json(result.activation)
}
