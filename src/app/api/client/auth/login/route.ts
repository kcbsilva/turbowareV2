import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { signClientToken, CLIENT_COOKIE_NAME } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const { cnpj, password } = await req.json()

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
    select: { id: true, password: true },
  })

  if (!client || !client.password) {
    return NextResponse.json({ error: 'Invalid CNPJ or password' }, { status: 401 })
  }

  const valid = await bcrypt.compare(password, client.password)
  if (!valid) {
    return NextResponse.json({ error: 'Invalid CNPJ or password' }, { status: 401 })
  }

  const token = await signClientToken(client.id)

  const res = NextResponse.json({ ok: true })
  res.cookies.set(CLIENT_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 12, // 12 hours
  })

  return res
}
