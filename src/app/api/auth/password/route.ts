import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { parseBody, badRequest } from '@/lib/api'
import { getAdminSession } from '@/lib/auth'

/** PATCH /api/auth/password — set a new admin password (required after temp password login) */
export async function PATCH(req: NextRequest) {
  const session = await getAdminSession(req)
  if (!session?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { body, error } = await parseBody<{ newPassword?: string }>(req)
  if (error) return badRequest()

  const newPassword = body.newPassword?.trim() ?? ''
  if (newPassword.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 })
  }

  const passwordHash = await bcrypt.hash(newPassword, 12)

  await prisma.adminUser.update({
    where: { id: session.id },
    data: {
      passwordHash,
      mustChangePassword: false,
    },
  })

  return NextResponse.json({ ok: true })
}
