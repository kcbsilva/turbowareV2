import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseBody, badRequest } from '@/lib/api'
import { isOwnerRole, normalizeAdminRole, requireOwnerSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

type Params = { params: Promise<{ id: string }> }

const teamSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  active: true,
  mfaEnabled: true,
  mustChangePassword: true,
  createdAt: true,
  updatedAt: true,
} as const

// PATCH /api/admin/team/[id] — update name/role/active (owner only)
export async function PATCH(req: NextRequest, { params }: Params) {
  const { session, error } = await requireOwnerSession(req)
  if (error) return error

  const { id } = await params
  const { body, error: parseError } = await parseBody<{
    name?: string
    role?: string
    active?: boolean
  }>(req)
  if (parseError) return badRequest()

  const existing = await prisma.adminUser.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const nextRole = body.role !== undefined ? normalizeAdminRole(body.role) : undefined
  if (body.role !== undefined && !nextRole) {
    return NextResponse.json({ error: 'Invalid role. Use owner, admin, support, or helper.' }, { status: 400 })
  }

  if (session.id && session.id === id && body.active === false) {
    return NextResponse.json({ error: 'You cannot deactivate your own account' }, { status: 400 })
  }

  const demotingOwner =
    isOwnerRole(existing.role) &&
    ((nextRole && !isOwnerRole(nextRole)) || body.active === false)

  if (demotingOwner) {
    const ownerCount = await prisma.adminUser.count({
      where: { active: true, role: { in: ['admin', 'owner'] } },
    })
    if (ownerCount <= 1) {
      return NextResponse.json(
        { error: 'Cannot remove the last active owner/admin' },
        { status: 400 },
      )
    }
  }

  const updated = await prisma.adminUser.update({
    where: { id },
    data: {
      ...(body.name !== undefined ? { name: body.name.trim() || existing.name } : {}),
      ...(nextRole ? { role: nextRole } : {}),
      ...(body.active !== undefined ? { active: body.active } : {}),
    },
    select: teamSelect,
  })

  return NextResponse.json(updated)
}
