import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { parseBody, badRequest } from '@/lib/api'
import {
  getAdminSession,
  isOwnerRole,
  normalizeAdminRole,
  requireOwnerSession,
} from '@/lib/auth'
import { generateTemporaryPassword } from '@/lib/temporary-password'
import { sendAdminInviteEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

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

// GET /api/admin/team — list operator accounts
export async function GET(req: NextRequest) {
  const session = await getAdminSession(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const users = await prisma.adminUser.findMany({
    select: teamSelect,
    orderBy: [{ active: 'desc' }, { createdAt: 'asc' }],
  })

  return NextResponse.json({
    users,
    currentUser: {
      id: session.id ?? null,
      name: session.name ?? null,
      email: session.email ?? null,
      role: session.role,
      canManage: isOwnerRole(session.role),
    },
  })
}

// POST /api/admin/team — create a helper / operator (owner only)
export async function POST(req: NextRequest) {
  const { error } = await requireOwnerSession(req)
  if (error) return error

  const { body, error: parseError } = await parseBody<{
    name?: string
    email?: string
    role?: string
    password?: string
  }>(req)
  if (parseError) return badRequest()

  const name = body.name?.trim() ?? ''
  const email = body.email?.trim().toLowerCase() ?? ''
  const role = normalizeAdminRole(body.role) ?? 'support'

  if (!name) return NextResponse.json({ error: 'name is required' }, { status: 400 })
  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'A valid email is required' }, { status: 400 })
  }

  const existing = await prisma.adminUser.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: 'An operator with that email already exists' }, { status: 409 })
  }

  const temporaryPassword = body.password?.trim() || generateTemporaryPassword()
  if (temporaryPassword.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
  }

  const passwordHash = await bcrypt.hash(temporaryPassword, 12)
  const user = await prisma.adminUser.create({
    data: {
      name,
      email,
      role,
      passwordHash,
      mustChangePassword: true,
      active: true,
    },
    select: teamSelect,
  })

  let emailed = false
  try {
    await sendAdminInviteEmail(email, temporaryPassword, role)
    emailed = true
  } catch (err) {
    console.error('[admin/team] invite email failed:', err)
  }

  return NextResponse.json(
    { ...user, temporaryPassword, emailed },
    { status: 201 },
  )
}
