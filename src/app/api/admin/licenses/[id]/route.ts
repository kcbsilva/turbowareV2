import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { resolveStatus } from '@/lib/license'
import { LicenseStatus } from '@prisma/client'
import { parseBody, badRequest } from '@/lib/api'

type Params = { params: { id: string } }

// GET /api/admin/licenses/[id]
export async function GET(_req: NextRequest, { params }: Params) {
  const license = await prisma.license.findUnique({
    where: { id: params.id },
    include: { activations: { orderBy: { activatedAt: 'desc' } } },
  })

  if (!license) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({
    ...license,
    effectiveStatus: resolveStatus(license.status, license.expiresAt),
  })
}

// PATCH /api/admin/licenses/[id] — update status, notes, expiry, seats
export async function PATCH(req: NextRequest, { params }: Params) {
  const { body: parsed, error } = await parseBody<{ status?: string; notes?: string; maxSeats?: unknown; expiresAt?: string; product?: string; clientId?: string }>(req)
  if (error) return badRequest()
  const { status, notes, maxSeats, expiresAt, product, clientId } = parsed

  const validStatuses = Object.values(LicenseStatus)
  if (status && !validStatuses.includes(status as LicenseStatus)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  let parsedMaxSeats: number | undefined
  if (maxSeats !== undefined) {
    const parsed = parseInt(String(maxSeats), 10)
    if (isNaN(parsed) || parsed < 1)
      return NextResponse.json({ error: 'maxSeats must be a positive integer.' }, { status: 400 })
    parsedMaxSeats = parsed
  }

  const license = await prisma.license.update({
    where: { id: params.id },
    data: {
      ...(status !== undefined ? { status: status as LicenseStatus } : {}),
      ...(notes !== undefined ? { notes: notes?.trim() || null } : {}),
      ...(parsedMaxSeats !== undefined ? { maxSeats: parsedMaxSeats } : {}),
      ...(expiresAt !== undefined
        ? { expiresAt: expiresAt ? new Date(expiresAt) : null }
        : {}),
      ...(product !== undefined ? { product: (product as string).trim() } : {}),
      ...(clientId !== undefined ? { clientId: clientId || null } : {}),
    },
  })

  return NextResponse.json(license)
}

// DELETE /api/admin/licenses/[id]
export async function DELETE(_req: NextRequest, { params }: Params) {
  await prisma.license.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
