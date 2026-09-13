import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { signClientToken, CLIENT_COOKIE_NAME } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { parseBody, badRequest } from '@/lib/api'
import { clientIP, loginRateLimiter } from '@/lib/rate-limit'
import { isMissingMustChangePasswordColumn } from '@/lib/client-password-compat'
import { clientLoginWhere, loginIdentifierFromBody } from '@/lib/client-login'

async function findClientForLogin(identifier: string) {
  const where = clientLoginWhere(identifier)
  if (!where) return null

  try {
    return await prisma.client.findFirst({
      where,
      select: { id: true, password: true, emailVerified: true, mustChangePassword: true },
    })
  } catch (error) {
    if (!isMissingMustChangePasswordColumn(error)) throw error

    const client = await prisma.client.findFirst({
      where,
      select: { id: true, password: true, emailVerified: true },
    })

    return client ? { ...client, mustChangePassword: false } : null
  }
}

export async function POST(req: NextRequest) {
  const { body, error } = await parseBody<{
    identifier?: string
    email?: string
    cnpj?: string
    password?: string
  }>(req)
  if (error) return badRequest()
  const identifier = loginIdentifierFromBody(body)
  const { password } = body

  const ip = clientIP(req)
  if (!(await loginRateLimiter.check(ip))) {
    return NextResponse.json(
      { error: 'Too many login attempts. Please try again in 15 minutes.' },
      { status: 429 },
    )
  }

  if (!identifier || !password) {
    return NextResponse.json(
      { error: 'Email or business number and password are required' },
      { status: 400 },
    )
  }

  const client = await findClientForLogin(identifier)

  if (!client || !client.password) {
    return NextResponse.json(
      { error: 'Invalid email, business number, or password' },
      { status: 401 },
    )
  }

  const valid = await bcrypt.compare(password, client.password)
  if (!valid) {
    return NextResponse.json(
      { error: 'Invalid email, business number, or password' },
      { status: 401 },
    )
  }

  if (!client.emailVerified) {
    return NextResponse.json(
      { error: 'Por favor, verifique seu e-mail antes de fazer login.' },
      { status: 403 },
    )
  }

  const token = await signClientToken(client.id)

  const res = NextResponse.json({ ok: true, mustChangePassword: client.mustChangePassword })
  res.cookies.set(CLIENT_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 12, // 12 hours
  })

  return res
}
