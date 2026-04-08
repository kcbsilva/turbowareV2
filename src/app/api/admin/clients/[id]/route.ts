import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { parseBody, badRequest } from '@/lib/api'
import { sendVerificationEmail } from '@/lib/email'

type Params = { params: { id: string } }

// GET /api/admin/clients/[id]
export async function GET(_req: NextRequest, { params }: Params) {
  const client = await prisma.client.findUnique({
    where: { id: params.id },
    include: {
      licenses: {
        include: { _count: { select: { activations: true } } },
        orderBy: { createdAt: 'desc' },
      },
      clientNotes: { orderBy: { createdAt: 'desc' } },
    },
  })

  if (!client) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Never expose the password hash to the admin UI
  const { password: _, ...safeClient } = client
  return NextResponse.json({ ...safeClient, hasPassword: !!client.password })
}

// PATCH /api/admin/clients/[id] — update fields
export async function PATCH(req: NextRequest, { params }: Params) {
  const { body: parsed, error } = await parseBody<{ name?: string; email?: string; phone?: string; company?: string; cnpj?: string; internalNotes?: string; newPassword?: string }>(req)
  if (error) return badRequest()
  const { name, email, phone, company, cnpj, internalNotes, newPassword } = parsed

  if (name !== undefined && !name?.trim()) {
    return NextResponse.json({ error: 'name cannot be empty' }, { status: 400 })
  }

  // Hash new password if provided
  let passwordHash: string | undefined
  if (newPassword) {
    passwordHash = await bcrypt.hash(newPassword, 12)
  }

  // Detect email change — if email is changing, reset verification
  const existing = await prisma.client.findUnique({
    where: { id: params.id },
    select: { email: true },
  })

  const newEmail          = email !== undefined ? email?.trim().toLowerCase() || null : undefined
  const emailChanged      = newEmail !== undefined && newEmail !== existing?.email
  const verificationToken = emailChanged && newEmail ? crypto.randomBytes(32).toString('hex') : undefined

  const client = await prisma.client.update({
    where: { id: params.id },
    data: {
      ...(name !== undefined ? { name: name.trim() } : {}),
      ...(email !== undefined ? { email: newEmail } : {}),
      ...(phone !== undefined ? { phone: phone?.trim() || null } : {}),
      ...(company !== undefined ? { company: company?.trim() || null } : {}),
      ...(cnpj !== undefined ? { cnpj: cnpj?.replace(/\D/g, '') || null } : {}),
      ...(internalNotes !== undefined ? { internalNotes: internalNotes?.trim() || null } : {}),
      ...(passwordHash ? { password: passwordHash } : {}),
      ...(emailChanged ? {
        emailVerified:                   false,
        emailVerificationToken:          verificationToken ?? null,
        emailVerificationTokenExpiresAt: verificationToken
          ? new Date(Date.now() + 24 * 60 * 60 * 1000)
          : null,
      } : {}),
    },
  })

  // Send new verification email if email changed — non-fatal
  if (emailChanged && newEmail && verificationToken) {
    try {
      await sendVerificationEmail(newEmail, verificationToken)
    } catch (err) {
      console.error('[admin/clients] Failed to send verification email:', err)
    }
  }

  const { password: _, ...safe } = client
  return NextResponse.json({ ...safe, hasPassword: !!client.password })
}

// DELETE /api/admin/clients/[id]
export async function DELETE(_req: NextRequest, { params }: Params) {
  await prisma.client.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
