import { createHash } from 'crypto'
import bcrypt from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseBody } from '@/lib/api'
import { clientIP, forgotPasswordRateLimiter } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  if (!(await forgotPasswordRateLimiter.check(`reset:${clientIP(req)}`))) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
  }

  const { body, error } = await parseBody<{ token?: string; password?: string }>(req)
  if (error) return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })

  const token = body.token?.trim() ?? ''
  const password = body.password ?? ''
  if (!/^[a-f0-9]{64}$/i.test(token) || password.length < 12) {
    return NextResponse.json(
      { error: 'Invalid token or password. Passwords must be at least 12 characters.' },
      { status: 400 },
    )
  }

  const tokenHash = createHash('sha256').update(token).digest('hex')
  const passwordHash = await bcrypt.hash(password, 12)
  const updated = await prisma.adminUser.updateMany({
    where: {
      passwordResetTokenHash: tokenHash,
      passwordResetExpiresAt: { gt: new Date() },
    },
    data: {
      passwordHash,
      mustChangePassword: false,
      passwordResetTokenHash: null,
      passwordResetExpiresAt: null,
    },
  })

  if (updated.count !== 1) {
    return NextResponse.json({ error: 'This password reset link is invalid or has expired.' }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
