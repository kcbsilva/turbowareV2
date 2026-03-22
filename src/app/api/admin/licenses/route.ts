import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateLicenseKey, resolveStatus } from '@/lib/license'
import { LicenseStatus } from '@prisma/client'

// GET /api/admin/licenses — list all licenses
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const status = searchParams.get('status') as LicenseStatus | null
  const search = searchParams.get('search') || ''

  const licenses = await prisma.license.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { key: { contains: search, mode: 'insensitive' } },
              { product: { contains: search, mode: 'insensitive' } },
              { notes: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    include: { _count: { select: { activations: true } } },
    orderBy: { createdAt: 'desc' },
  })

  // Resolve effective status (mark expired if past expiresAt)
  const result = licenses.map((l) => ({
    ...l,
    effectiveStatus: resolveStatus(l.status, l.expiresAt),
    activationCount: l._count.activations,
  }))

  return NextResponse.json(result)
}

// POST /api/admin/licenses — create a new license
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { product, notes, maxSeats, expiresAt, clientId } = body

  if (!product?.trim()) {
    return NextResponse.json({ error: 'product is required' }, { status: 400 })
  }

  const key = generateLicenseKey()

  const license = await prisma.license.create({
    data: {
      key,
      product: product.trim(),
      notes: notes?.trim() || null,
      maxSeats: maxSeats ? parseInt(maxSeats) : 1,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      clientId: clientId || null,
    },
  })

  return NextResponse.json(license, { status: 201 })
}
