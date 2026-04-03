import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getPriceByLabel, type Region } from '@/lib/pricing'

type Params = { params: { id: string } }

// POST /api/admin/clients/[id]/plan
export async function POST(req: NextRequest, { params }: Params) {
  const { subscriberTier, region } = await req.json()

  if (!subscriberTier || !region) {
    return NextResponse.json({ error: 'subscriberTier and region are required' }, { status: 400 })
  }

  const validRegions: Region[] = ['BR', 'CA', 'US', 'GB']
  if (!validRegions.includes(region as Region)) {
    return NextResponse.json({ error: 'Invalid region. Must be BR, CA, US, or GB.' }, { status: 400 })
  }

  // Resolve monthly price
  const priceResult = getPriceByLabel(subscriberTier, region as Region)
  if (priceResult === 'inquire') {
    return NextResponse.json({ error: 'This tier requires a custom quote. Please contact sales.' }, { status: 400 })
  }

  // Find or fail subscription
  const existing = await prisma.subscription.findUnique({ where: { clientId: params.id } })
  if (!existing) {
    return NextResponse.json({ error: 'No subscription found for this client.' }, { status: 404 })
  }

  const updated = await prisma.subscription.update({
    where: { id: existing.id },
    data: {
      region,
      subscriberTier,
      monthlyAmount: priceResult,
    },
  })

  return NextResponse.json(updated)
}
