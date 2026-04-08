import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type Status = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'CANCELLED'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { status, notes } = await req.json().catch(() => ({})) as { status: Status; notes?: string }
  if (!status) return NextResponse.json({ error: 'status required' }, { status: 400 })

  const activation = await prisma.clientProduct.update({
    where: { id: params.id },
    data: {
      status,
      notes:       notes ?? null,
      activatedAt: status === 'ACTIVE' ? new Date() : undefined,
    },
    include: { product: true, tier: true, client: { select: { id: true, name: true, email: true } } },
  })

  return NextResponse.json(activation)
}
