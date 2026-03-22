import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { resolveStatus } from '@/lib/license'

type Params = { params: { key: string } }

/**
 * GET /api/client/status/[key]
 *
 * Returns public metadata about a license key.
 */
export async function GET(_req: NextRequest, { params }: Params) {
  const license = await prisma.license.findUnique({
    where: { key: params.key },
    include: { _count: { select: { activations: true } } },
  })

  if (!license) {
    return NextResponse.json({ error: 'License key not found.' }, { status: 404 })
  }

  const effectiveStatus = resolveStatus(license.status, license.expiresAt)

  return NextResponse.json({
    key: license.key,
    product: license.product,
    status: effectiveStatus,
    expiresAt: license.expiresAt,
    maxSeats: license.maxSeats,
    activatedSeats: license._count.activations,
    createdAt: license.createdAt,
  })
}
