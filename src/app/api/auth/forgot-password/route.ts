import { createHash, randomBytes } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseBody, badRequest } from '@/lib/api'
import { sendAdminPasswordResetEmail } from '@/lib/email'
import { clientIP, forgotPasswordRateLimiter } from '@/lib/rate-limit'

const GENERIC_OK = {
  ok: true,
  message: 'If an account exists for that email, a password reset link has been sent.',
}

/** POST /api/auth/forgot-password — email a single-use admin reset link */
export async function POST(req: NextRequest) {
  const { body, error } = await parseBody<{ email?: string }>(req)
  if (error) return badRequest()

  const email = body.email?.trim().toLowerCase() ?? ''
  if (!email) {
    return NextResponse.json({ error: 'Email is required.' }, { status: 400 })
  }
  if (!(await forgotPasswordRateLimiter.check(`${clientIP(req)}:${email}`))) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again in 15 minutes.' },
      { status: 429 },
    )
  }

  try {
    const user = await prisma.adminUser.findUnique({
      where: { email },
      select: { id: true, email: true },
    })

    if (!user) {
      return NextResponse.json(GENERIC_OK)
    }

    const token = randomBytes(32).toString('hex')
    const tokenHash = createHash('sha256').update(token).digest('hex')

    await prisma.adminUser.update({
      where: { id: user.id },
      data: {
        passwordResetTokenHash: tokenHash,
        passwordResetExpiresAt: new Date(Date.now() + 30 * 60 * 1000),
      },
    })

    try {
      await sendAdminPasswordResetEmail(user.email, token)
    } catch (err) {
      await prisma.adminUser.updateMany({
        where: { id: user.id, passwordResetTokenHash: tokenHash },
        data: { passwordResetTokenHash: null, passwordResetExpiresAt: null },
      })
      throw err
    }
    return NextResponse.json(GENERIC_OK)
  } catch (err) {
    console.error('[auth/forgot-password] Failed:', err)
    const message = err instanceof Error ? err.message : 'Unknown error'
    const isEmailConfigError = message.includes('Missing required email environment variable')
    if (isEmailConfigError) {
      return NextResponse.json(
        { error: 'Email service is not configured on this deployment.' },
        { status: 503 },
      )
    }
    return NextResponse.json(
      { error: 'Could not send reset email. Please try again later.' },
      { status: 502 },
    )
  }
}
