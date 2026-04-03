import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signAdminToken, COOKIE_NAME } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { email, password } = body as { email?: string; password?: string }

  if (!password) {
    return NextResponse.json({ error: 'Password is required' }, { status: 400 })
  }

  // ── Path A: email provided → look up AdminUser in DB ───────────────────────
  if (email) {
    const user = await prisma.adminUser.findUnique({ where: { email } })

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const token = await signAdminToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    })

    const res = NextResponse.json({ ok: true, name: user.name, email: user.email })
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 12, // 12 hours
    })
    return res
  }

  // ── Path B: no email → backward-compat ADMIN_PASSWORD fallback ─────────────
  // Only active when zero AdminUser rows exist (i.e. not yet migrated)
  const adminCount = await prisma.adminUser.count()
  if (adminCount > 0) {
    // DB users exist — require email+password from now on
    return NextResponse.json(
      { error: 'Please provide your email and password' },
      { status: 400 }
    )
  }

  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminPassword || password !== adminPassword) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  // Legacy token — no user identity embedded
  const token = await signAdminToken()
  const res = NextResponse.json({ ok: true })
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 12, // 12 hours
  })
  return res
}
