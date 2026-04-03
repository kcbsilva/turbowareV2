import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isLicenseUsable } from '@/lib/license'

/**
 * POST /api/client/activate
 * Body: { key: string, hardwareId: string, label?: string }
 *
 * Activates a license key on a specific hardware/device.
 * Idempotent — calling again with the same hardwareId just updates lastSeenAt.
 *
 * Protected by CLIENT_API_KEY when set. Pass `Authorization: Bearer <token>`.
 * If CLIENT_API_KEY is not configured the check is skipped (backward compat).
 */
export async function POST(req: NextRequest) {
  const clientApiKey = process.env.CLIENT_API_KEY
  if (clientApiKey) {
    const auth = req.headers.get('authorization')
    if (!auth || auth !== `Bearer ${clientApiKey}`) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }
  }

  const { key, hardwareId, label } = await req.json()

  if (!key || !hardwareId) {
    return NextResponse.json(
      { success: false, message: 'key and hardwareId are required' },
      { status: 400 }
    )
  }

  const license = await prisma.license.findUnique({
    where: { key },
    include: { activations: true },
  })

  if (!license) {
    return NextResponse.json({ success: false, message: 'License key not found.' })
  }

  // Check if already activated on this hardware
  const existing = license.activations.find((a) => a.hardwareId === hardwareId)
  if (existing) {
    await prisma.activation.update({
      where: { id: existing.id },
      data: { lastSeenAt: new Date(), ...(label ? { label } : {}) },
    })
    return NextResponse.json({
      success: true,
      message: 'Already activated on this device.',
      alreadyActivated: true,
    })
  }

  // Check if the license can accept a new activation
  const { ok, reason } = isLicenseUsable(
    license.status,
    license.expiresAt,
    license.activations.length,
    license.maxSeats
  )

  if (!ok) {
    return NextResponse.json({ success: false, message: reason })
  }

  await prisma.activation.create({
    data: {
      licenseId: license.id,
      hardwareId,
      label: label || null,
    },
  })

  return NextResponse.json({
    success: true,
    message: 'License activated successfully.',
    alreadyActivated: false,
  })
}
