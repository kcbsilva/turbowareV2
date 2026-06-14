import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { signAdminToken, setAdminAuthCookie } from '@/lib/auth'
import { decryptTotpSecret, verifyTotpCode } from '@/lib/mfa'
import { MFA_PENDING_COOKIE, verifyMfaPendingToken } from '@/lib/mfa-pending'
import { loginRateLimiter } from '@/lib/rate-limit'
import { parseBody, badRequest } from '@/lib/api'

/** POST — second login step: verify TOTP and issue admin session cookie */
export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1'
  if (!loginRateLimiter.check(`mfa:${ip}`)) {
    return NextResponse.json(
      { error: 'Too many attempts. Please try again in 15 minutes.' },
      { status: 429 },
    )
  }

  const pending = req.cookies.get(MFA_PENDING_COOKIE)?.value
  if (!pending) {
    return NextResponse.json({ error: 'MFA session expired. Sign in again.' }, { status: 401 })
  }

  const userId = await verifyMfaPendingToken(pending)
  if (!userId) {
    return NextResponse.json({ error: 'MFA session expired. Sign in again.' }, { status: 401 })
  }

  const { body, error } = await parseBody<{ code?: string }>(req)
  if (error) return badRequest()
  const code = body.code?.trim()
  if (!code) {
    return NextResponse.json({ error: 'Verification code is required' }, { status: 400 })
  }

  const user = await prisma.adminUser.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true, mfaEnabled: true, totpSecret: true },
  })

  if (!user?.mfaEnabled || !user.totpSecret) {
    return NextResponse.json({ error: 'MFA is not configured for this account' }, { status: 400 })
  }

  const secret = decryptTotpSecret(user.totpSecret)
  if (!secret || !verifyTotpCode(secret, code)) {
    return NextResponse.json({ error: 'Invalid verification code' }, { status: 401 })
  }

  const token = await signAdminToken({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  })

  const res = NextResponse.json({ ok: true, name: user.name, email: user.email })
  setAdminAuthCookie(res, token)
  res.cookies.delete(MFA_PENDING_COOKIE)
  return res
}
