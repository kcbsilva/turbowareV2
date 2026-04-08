import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { sendVerificationEmail } from '@/lib/email'

type Params = { params: { id: string } }

// POST /api/admin/clients/[id]/resend-verification
export async function POST(_req: NextRequest, { params }: Params) {
  try {
    const client = await prisma.client.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        email: true,
        emailVerified: true,
      },
    })

    if (!client) {
      return NextResponse.json({ error: 'Client not found.' }, { status: 404 })
    }

    if (!client.email) {
      return NextResponse.json({ error: 'Client does not have an email address.' }, { status: 400 })
    }

    if (client.emailVerified) {
      return NextResponse.json({ error: 'Client email is already verified.' }, { status: 400 })
    }

    const verificationToken = crypto.randomBytes(32).toString('hex')
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000)

    await prisma.client.update({
      where: { id: client.id },
      data: {
        emailVerificationToken: verificationToken,
        emailVerificationTokenExpiresAt: verificationExpires,
      },
    })

    await sendVerificationEmail(client.email, verificationToken)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[admin/clients/resend-verification] Failed:', err)
    const message = err instanceof Error ? err.message : 'Unknown error'
    const isEmailConfigError = message.includes('Missing required email environment variable')
    return NextResponse.json(
      {
        error: isEmailConfigError
          ? 'Email service is not configured on this deployment.'
          : 'Failed to send verification email.',
      },
      { status: isEmailConfigError ? 503 : 502 },
    )
  }
}
