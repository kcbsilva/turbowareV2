import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { sendTemporaryPasswordEmail } from '@/lib/email'

type Params = { params: { id: string } }

function generateTemporaryPassword() {
  return crypto.randomBytes(9).toString('base64url')
}

// POST /api/admin/clients/[id]/reset-password
export async function POST(_req: NextRequest, { params }: Params) {
  const client = await prisma.client.findUnique({
    where: { id: params.id },
    select: { id: true, email: true },
  })

  if (!client) {
    return NextResponse.json({ error: 'Client not found.' }, { status: 404 })
  }

  if (!client.email) {
    return NextResponse.json({ error: 'Client does not have an email address.' }, { status: 400 })
  }

  const temporaryPassword = generateTemporaryPassword()
  const passwordHash = await bcrypt.hash(temporaryPassword, 12)

  await prisma.client.update({
    where: { id: client.id },
    data: {
      password: passwordHash,
      mustChangePassword: true,
    },
  })

  try {
    await sendTemporaryPasswordEmail(client.email, temporaryPassword)
  } catch (err) {
    console.error('[admin/clients/reset-password] Failed to send temporary password email:', err)
    return NextResponse.json({ error: 'Failed to send temporary password email.' }, { status: 502 })
  }

  return NextResponse.json({ ok: true })
}
