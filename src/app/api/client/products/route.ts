import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/** GET — list all active products with the client's activation status for each */
export async function GET(req: NextRequest) {
  const clientId = req.headers.get('x-client-id')
  if (!clientId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [products, activations] = await Promise.all([
    prisma.product.findMany({
      where: { active: true },
      orderBy: { sortOrder: 'asc' },
      include: { tiers: { orderBy: { sortOrder: 'asc' } } },
    }),
    prisma.clientProduct.findMany({
      where: { clientId },
      include: { tier: true },
    }),
  ])

  const activationMap = Object.fromEntries(activations.map(a => [a.productId, a]))

  return NextResponse.json(
    products.map(p => ({
      ...p,
      activation: activationMap[p.id] ?? null,
    }))
  )
}

/** POST — request activation for a product/tier */
export async function POST(req: NextRequest) {
  const clientId = req.headers.get('x-client-id')
  if (!clientId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { productId, tierId } = await req.json().catch(() => ({}))
  if (!productId) return NextResponse.json({ error: 'productId required' }, { status: 400 })

  const product = await prisma.product.findUnique({ where: { id: productId, active: true } })
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

  if (tierId) {
    const tier = await prisma.productTier.findFirst({ where: { id: tierId, productId } })
    if (!tier) return NextResponse.json({ error: 'Tier not found' }, { status: 404 })
  }

  const existing = await prisma.clientProduct.findUnique({ where: { clientId_productId: { clientId, productId } } })
  if (existing) {
    if (existing.status === 'ACTIVE') return NextResponse.json({ error: 'Already activated' }, { status: 409 })
    // Re-request if cancelled or suspended
    const updated = await prisma.clientProduct.update({
      where: { id: existing.id },
      data: { tierId: tierId ?? null, status: 'PENDING', notes: null, updatedAt: new Date() },
      include: { tier: true },
    })
    return NextResponse.json(updated)
  }

  const activation = await prisma.clientProduct.create({
    data: { clientId, productId, tierId: tierId ?? null, status: 'PENDING' },
    include: { product: true, tier: true },
  })

  return NextResponse.json(activation, { status: 201 })
}
