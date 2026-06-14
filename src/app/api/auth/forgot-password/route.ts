import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { parseBody, badRequest } from '@/lib/api'
import { sendAdminTemporaryPasswordEmail } from '@/lib/email'
import { forgotPasswordRateLimiter } from '@/lib/rate-limit'
import { generateTemporaryPassword } from '@/lib/temporary-password'

const GENERIC_OK = {
  ok: true,
  message: 'If an account exists for that email, a temporary password has been sent.',
}

/** POST /api/auth/forgot-password — email a temporary admin password */
export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1'
  if (!forgotPasswordRateLimiter.check(ip)) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again in 15 minutes.' },
      { status: 429 },
    )
  }

  const { body, error } = await parseBody<{ email?: string }>(req)
  if (error) return badRequest()

  const email = body.email?.trim().toLowerCase() ?? ''
  if (!email) {
    return NextResponse.json({ error: 'Email is required.' }, { status: 400 })
  }

  try {
    const user = await prisma.adminUser.findUnique({
      where: { email },
      select: { id: true, email: true },
    })

    if (!user) {
      return NextResponse.json(GENERIC_OK)
    }

    const temporaryPassword = generateTemporaryPassword()
    const passwordHash = await bcrypt.hash(temporaryPassword, 12)

    await prisma.adminUser.update({
      where: { id: user.id },
      data: {
        passwordHash,
        mustChangePassword: true,
        mfaEnabled: false,
        totpSecret: null,
      },
    })

    await sendAdminTemporaryPasswordEmail(user.email, temporaryPassword)
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
