import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type Params = { params: { id: string } }

// GET /api/admin/clients/[id]/subscription
export async function GET(_req: NextRequest, { params }: Params) {
  const sub = await prisma.subscription.findUnique({
    where: { clientId: params.id },
    include: {
      invoices: { orderBy: { createdAt: 'desc' } },
      license:  { select: { key: true, status: true, maxSeats: true } },
    },
  })
  return NextResponse.json(sub ?? null)
}

// POST /api/admin/clients/[id]/subscription/invoices/[invoiceId]/pay
// (handled in a separate route — see below)
// PATCH /api/admin/clients/[id]/subscription — update status manually
export async function PATCH(req: NextRequest, { params }: Params) {
  const { status } = await req.json()
  const sub = await prisma.subscription.findUnique({ where: { clientId: params.id } })
  if (!sub) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const updated = await prisma.subscription.update({
    where: { id: sub.id },
    data:  { status },
    include: {
      invoices: { orderBy: { createdAt: 'desc' } },
      license:  { select: { key: true, status: true, maxSeats: true } },
    },
  })
  return NextResponse.json(updated)
}
