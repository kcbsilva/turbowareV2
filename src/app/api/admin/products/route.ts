import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Auth is handled by middleware for /api/admin/* routes

export async function GET() {
  const products = await prisma.product.findMany({
    orderBy: { sortOrder: 'asc' },
    include: { tiers: { orderBy: { sortOrder: 'asc' } }, _count: { select: { activations: true } } },
  })
  return NextResponse.json(products)
}

export async function POST(req: NextRequest) {
  const { name, slug, description, logoEmoji, active, sortOrder, tiers } = await req.json().catch(() => ({}))
  if (!name?.trim() || !slug?.trim()) return NextResponse.json({ error: 'name and slug required' }, { status: 400 })

  const product = await prisma.product.create({
    data: {
      name: name.trim(), slug: slug.trim().toLowerCase(),
      description: description?.trim() || null,
      logoEmoji: logoEmoji || '📦',
      active: active ?? true,
      sortOrder: sortOrder ?? 0,
      tiers: tiers?.length ? {
        create: tiers.map((t: Record<string, unknown>, i: number) => ({
          name: t.name, description: t.description ?? null,
          maxSeats: t.maxSeats ?? null, priceBR: t.priceBR ?? null,
          priceCA: t.priceCA ?? null, priceUS: t.priceUS ?? null,
          priceGB: t.priceGB ?? null, features: t.features ?? null,
          sortOrder: i,
        })),
      } : undefined,
    },
    include: { tiers: true },
  })

  return NextResponse.json(product, { status: 201 })
}
