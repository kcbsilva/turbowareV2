import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { InvoiceStatus } from '@prisma/client'

export const dynamic = 'force-dynamic'

// GET /api/admin/invoices — billing inbox
export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get('status')
  const validStatus = Object.values(InvoiceStatus).includes(status as InvoiceStatus)
    ? (status as InvoiceStatus)
    : undefined

  const invoices = await prisma.invoice.findMany({
    where: validStatus ? { status: validStatus } : undefined,
    orderBy: { createdAt: 'desc' },
    take: 200,
    include: {
      subscription: {
        select: {
          id: true,
          product: true,
          status: true,
          client: { select: { id: true, name: true, company: true, email: true } },
        },
      },
    },
  })

  return NextResponse.json(invoices, { headers: { 'Cache-Control': 'no-store' } })
}
