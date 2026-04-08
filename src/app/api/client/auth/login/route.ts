import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { signClientToken, CLIENT_COOKIE_NAME } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { parseBody, badRequest } from '@/lib/api'
import { loginRateLimiter } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  const { body, error } = await parseBody<{ cnpj?: string; password?: string }>(req)
  if (error) return badRequest()
  const { cnpj, password } = body

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1'
  if (!loginRateLimiter.check(ip)) {
    return NextResponse.json(
      { error: 'Too many login attempts. Please try again in 15 minutes.' },
      { status: 429 },
    )
  }

  if (!cnpj || !password) {
    return NextResponse.json({ error: 'CNPJ and password are required' }, { status: 400 })
  }

  // Normalize CNPJ — strip formatting so XX.XXX.XXX/XXXX-XX and 00000000000000 both work
  const normalized = cnpj.replace(/\D/g, '')

  const client = await prisma.client.findFirst({
    where: {
      OR: [
        { cnpj: normalized },
        { cnpj: cnpj.trim() },
      ],
    },
    select: { id: true, password: true, emailVerified: true, mustChangePassword: true },
  })

  if (!client || !client.password) {
    return NextResponse.json({ error: 'Invalid CNPJ or password' }, { status: 401 })
  }

  const valid = await bcrypt.compare(password, client.password)
  if (!valid) {
    return NextResponse.json({ error: 'Invalid CNPJ or password' }, { status: 401 })
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
