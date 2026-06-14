import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signAdminToken, setAdminAuthCookie } from '@/lib/auth'
import { signMfaPendingToken, MFA_PENDING_COOKIE } from '@/lib/mfa-pending'
import { loginRateLimiter } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1'
  if (!loginRateLimiter.check(ip)) {
    return NextResponse.json(
      { error: 'Too many login attempts. Please try again in 15 minutes.' },
      { status: 429 },
    )
  }

  try {
    const body = await req.json()
    const { email, password } = body as { email?: string; password?: string }

    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 })
    }

    // ── Path A: email provided → look up AdminUser in DB ─────────────────────
    if (email) {
      const user = await prisma.adminUser.findUnique({ where: { email } })

      if (!user) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
      }

      const mustChangePassword =
        (user as { mustChangePassword?: boolean }).mustChangePassword ?? false

      const valid = await bcrypt.compare(password, user.passwordHash)
      if (!valid) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
      }

      if (user.mfaEnabled && !mustChangePassword) {
        const pending = await signMfaPendingToken(user.id)
        const res = NextResponse.json({
          ok: true,
          mfaRequired: true,
          email: user.email,
        })
        res.cookies.set(MFA_PENDING_COOKIE, pending, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 5,
        })
        return res
      }

      const token = await signAdminToken({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      })

      const res = NextResponse.json({
        ok: true,
        name: user.name,
        email: user.email,
        mustChangePassword,
      })
      setAdminAuthCookie(res, token)
      return res
    }

    // ── Path B: no email → backward-compat ADMIN_PASSWORD fallback ───────────
    const adminCount = await prisma.adminUser.count()
    if (adminCount > 0) {
      return NextResponse.json(
        { error: 'Please provide your email and password' },
        { status: 400 },
      )
    }

    const adminPassword = process.env.ADMIN_PASSWORD
    if (!adminPassword || password !== adminPassword) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }

    const token = await signAdminToken()
    const res = NextResponse.json({ ok: true })
    setAdminAuthCookie(res, token)
    return res
  } catch (err) {
    console.error('[/api/auth/login] Unhandled error:', err)
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 },
    )
  }
}
