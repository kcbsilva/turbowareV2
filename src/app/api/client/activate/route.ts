import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isLicenseUsable } from '@/lib/license'
import { parseBody, badRequest } from '@/lib/api'

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
  if (!clientApiKey && process.env.NODE_ENV === 'production') {
    console.error('[activate] CLIENT_API_KEY is not set in production')
    return NextResponse.json({ success: false, message: 'Service misconfigured' }, { status: 503 })
  }
  if (clientApiKey) {
    const auth = req.headers.get('authorization')
    if (!auth || auth !== `Bearer ${clientApiKey}`) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }
  }

  const { body, error } = await parseBody<{ key?: string; hardwareId?: string; label?: string }>(req)
  if (error) return badRequest()
  const { key, hardwareId, label } = body

  if (!key || !hardwareId) {
    return NextResponse.json(
      { success: false, message: 'key and hardwareId are required' },
      { status: 400 }
    )
  }

  const result = await prisma.$transaction(async (tx) => {
    // Re-fetch inside transaction to get consistent activation count
    const freshLicense = await tx.license.findUnique({
      where: { key },
      include: { activations: true },
    })

    if (!freshLicense) return { type: 'not_found' as const }

    const existing = freshLicense.activations.find((a) => a.hardwareId === hardwareId)
    if (existing) {
      await tx.activation.update({
        where: { id: existing.id },
        data: { lastSeenAt: new Date(), ...(label ? { label } : {}) },
      })
      return { type: 'already_activated' as const }
    }

    const { ok, reason } = isLicenseUsable(
      freshLicense.status,
      freshLicense.expiresAt,
      freshLicense.activations.length,
      freshLicense.maxSeats,
    )
    if (!ok) return { type: 'not_usable' as const, reason }

    await tx.activation.create({
      data: { licenseId: freshLicense.id, hardwareId, label: label || null },
    })
    return { type: 'activated' as const }
  })

  if (result.type === 'not_found')
    return NextResponse.json({ success: false, message: 'License key not found.' }, { status: 404 })
  if (result.type === 'not_usable')
    return NextResponse.json({ success: false, message: result.reason })
  if (result.type === 'already_activated')
    return NextResponse.json({ success: true, message: 'Already activated on this device.', alreadyActivated: true })

  return NextResponse.json({ success: true, message: 'License activated successfully.', alreadyActivated: false })
}
