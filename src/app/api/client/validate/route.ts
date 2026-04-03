import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isLicenseUsable } from '@/lib/license'

/**
 * POST /api/client/validate
 * Body: { key: string, hardwareId?: string }
 *
 * Returns whether the license key is valid and usable.
 * If hardwareId is provided, also checks if this machine is already activated
 * (activated machines don't count against the seat check).
 *
 * Protected by CLIENT_API_KEY when set. Pass `Authorization: Bearer <token>`.
 * If CLIENT_API_KEY is not configured the check is skipped (backward compat).
 */
export async function POST(req: NextRequest) {
  const clientApiKey = process.env.CLIENT_API_KEY
  if (clientApiKey) {
    const auth = req.headers.get('authorization')
    if (!auth || auth !== `Bearer ${clientApiKey}`) {
      return NextResponse.json({ valid: false, message: 'Unauthorized' }, { status: 401 })
    }
  }

  const { key, hardwareId } = await req.json()

  if (!key) {
    return NextResponse.json({ valid: false, message: 'key is required' }, { status: 400 })
  }

  const license = await prisma.license.findUnique({
    where: { key },
    include: { activations: true },
  })

  if (!license) {
    return NextResponse.json({ valid: false, message: 'License key not found.' })
  }

  // If hardwareId is provided and already activated, it's always valid (seat already used)
  const alreadyActivated = hardwareId
    ? license.activations.some((a) => a.hardwareId === hardwareId)
    : false

  const checkCount = alreadyActivated
    ? license.activations.length - 1  // don't count this seat against itself
    : license.activations.length

  const { ok, reason } = isLicenseUsable(
    license.status,
    license.expiresAt,
    checkCount,
    license.maxSeats
  )

  if (!ok) {
    return NextResponse.json({ valid: false, message: reason })
  }

  // Update lastSeenAt if hardware matches an existing activation
  if (alreadyActivated && hardwareId) {
    await prisma.activation.updateMany({
      where: { licenseId: license.id, hardwareId },
      data: { lastSeenAt: new Date() },
    })
  }

  return NextResponse.json({
    valid: true,
    message: 'License is valid.',
    license: {
      key: license.key,
      product: license.product,
      expiresAt: license.expiresAt,
      maxSeats: license.maxSeats,
      activatedSeats: license.activations.length,
    },
  })
}
