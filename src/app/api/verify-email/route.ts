import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/verify-email?token=<hex-token>
 *
 * Validates the email verification token, marks the client as verified,
 * and redirects to the login page.
 */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')

  if (!token) {
    return NextResponse.json({ error: 'Verification token is required' }, { status: 400 })
  }

  const client = await prisma.client.findFirst({
    where: { emailVerificationToken: token },
    select: {
      id: true,
      emailVerificationTokenExpiresAt: true,
    },
  })

  if (!client) {
    return NextResponse.json(
      { error: 'Invalid or already used verification token' },
      { status: 400 },
    )
  }

  if (
    !client.emailVerificationTokenExpiresAt ||
    client.emailVerificationTokenExpiresAt < new Date()
  ) {
    return NextResponse.json(
      { error: 'Verification token has expired. Please contact support.' },
      { status: 400 },
    )
  }

  await prisma.client.update({
    where: { id: client.id },
    data: {
      emailVerified:                   true,
      emailVerificationToken:          null,
      emailVerificationTokenExpiresAt: null,
    },
  })

  return NextResponse.redirect(new URL('/client/login?verified=1', req.url))
}
