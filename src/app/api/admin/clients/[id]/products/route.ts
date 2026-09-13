import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { listClientCatalog } from '@/lib/client-products'

type Params = { params: Promise<{ id: string }> }

// GET /api/admin/clients/[id]/products — catalog + this client's activations
export async function GET(_req: Request, { params }: Params) {
  const { id } = await params
  const client = await prisma.client.findUnique({ where: { id }, select: { id: true } })
  if (!client) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const products = await listClientCatalog(id)
  return NextResponse.json(products)
}
