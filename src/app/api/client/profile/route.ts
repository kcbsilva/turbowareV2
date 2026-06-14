import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { getClientId } from '@/lib/client-auth'
import { sendVerificationEmail } from '@/lib/email'
import { parseBody, badRequest } from '@/lib/api'

export async function PATCH(req: NextRequest) {
  const clientId = getClientId(req)
  if (!clientId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { body, error } = await parseBody<{
    name?: string
    email?: string
    phone?: string
    company?: string
  }>(req)
  if (error) return badRequest()

  const { name, email, phone, company } = body

  if (name !== undefined && typeof name === 'string' && !name.trim()) {
    return NextResponse.json({ error: 'Name cannot be empty' }, { status: 400 })
  }

  const existing = await prisma.client.findUnique({
    where: { id: clientId },
    select: { email: true },
  })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const newEmail = email !== undefined ? email?.trim().toLowerCase() || null : undefined
  const emailChanged = newEmail !== undefined && newEmail !== existing.email
  const verificationToken = emailChanged && newEmail
    ? crypto.randomBytes(32).toString('hex')
    : undefined

  const updated = await prisma.client.update({
    where: { id: clientId },
    data: {
      ...(name    !== undefined ? { name:    name.trim()    } : {}),
      ...(email   !== undefined ? { email:   newEmail       } : {}),
      ...(phone   !== undefined ? { phone:   phone?.trim() || null } : {}),
      ...(company !== undefined ? { company: company?.trim() || null } : {}),
      ...(emailChanged ? {
        emailVerified: false,
        emailVerificationToken: verificationToken ?? null,
        emailVerificationTokenExpiresAt: verificationToken
          ? new Date(Date.now() + 24 * 60 * 60 * 1000)
          : null,
      } : {}),
    },
    select: { id: true, name: true, email: true, phone: true, company: true, cnpj: true, emailVerified: true },
  })

  if (emailChanged && newEmail && verificationToken) {
    try {
      await sendVerificationEmail(newEmail, verificationToken)
    } catch (err) {
      console.error('[client/profile] Failed to send verification email:', err)
    }
  }

  return NextResponse.json(updated)
}
