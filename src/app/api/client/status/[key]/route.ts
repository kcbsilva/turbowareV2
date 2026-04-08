import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { resolveStatus } from '@/lib/license'

type Params = { params: { key: string } }

/**
 * GET /api/client/status/[key]
 *
 * Returns only the effective status of a license key (active/inactive).
 */
export async function GET(_req: NextRequest, { params }: Params) {
  const license = await prisma.license.findUnique({
    where: { key: params.key },
    select: { status: true, expiresAt: true },
  })

  if (!license) {
    // Return same shape for not-found to avoid key existence oracle
    return NextResponse.json({ active: false })
  }

  const effectiveStatus = resolveStatus(license.status, license.expiresAt)
  return NextResponse.json({ active: effectiveStatus === 'ACTIVE' })
}
