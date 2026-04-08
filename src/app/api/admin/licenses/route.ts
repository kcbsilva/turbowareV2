import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateLicenseKey, resolveStatus } from '@/lib/license'
import { LicenseStatus } from '@prisma/client'
import { parseBody, badRequest } from '@/lib/api'

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
  const { body: parsed, error } = await parseBody<{ product?: string; notes?: string; maxSeats?: unknown; expiresAt?: string; clientId?: string }>(req)
  if (error) return badRequest()
  const { product, notes, maxSeats, expiresAt, clientId } = parsed

  if (!product?.trim()) {
    return NextResponse.json({ error: 'product is required' }, { status: 400 })
  }

  let parsedMaxSeats = 1
  if (maxSeats !== undefined) {
    const parsed = parseInt(String(maxSeats), 10)
    if (isNaN(parsed) || parsed < 1)
      return NextResponse.json({ error: 'maxSeats must be a positive integer.' }, { status: 400 })
    parsedMaxSeats = parsed
  }

  const key = generateLicenseKey()

  const license = await prisma.license.create({
    data: {
      key,
      product: (product as string).trim(),
      notes: notes?.trim() || null,
      maxSeats: parsedMaxSeats,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      clientId: clientId || null,
    },
  })

  return NextResponse.json(license, { status: 201 })
}
