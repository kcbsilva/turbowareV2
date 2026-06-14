import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import {
  signAdminToken,
  setAdminAuthCookie,
  getAdminSession,
} from '@/lib/auth'
import {
  decryptTotpSecret,
  encryptTotpSecret,
  generateTotpSecret,
  totpKeyUri,
  verifyTotpCode,
} from '@/lib/mfa'
import { parseBody, badRequest } from '@/lib/api'

/** GET — whether MFA is enabled for the signed-in admin */
export async function GET(req: NextRequest) {
  const session = await getAdminSession(req)
  if (!session?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.adminUser.findUnique({
    where: { id: session.id },
    select: { mfaEnabled: true },
  })
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ mfaEnabled: user.mfaEnabled })
}

/** POST — generate a new TOTP secret (stored pending until /enable confirms a code) */
export async function POST(req: NextRequest) {
  const session = await getAdminSession(req)
  if (!session?.id || !session.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const secret = generateTotpSecret()
  await prisma.adminUser.update({
    where: { id: session.id },
    data: {
      totpSecret: encryptTotpSecret(secret),
      mfaEnabled: false,
    },
  })

  return NextResponse.json({
    otpauthUrl: totpKeyUri(session.email, secret),
    secret,
  })
}

/** PATCH — confirm TOTP code and turn MFA on */
export async function PATCH(req: NextRequest) {
  const session = await getAdminSession(req)
  if (!session?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { body, error } = await parseBody<{ code?: string }>(req)
  if (error) return badRequest()
  const code = body.code?.trim()
  if (!code) {
    return NextResponse.json({ error: 'Verification code is required' }, { status: 400 })
  }

  const user = await prisma.adminUser.findUnique({
    where: { id: session.id },
    select: { totpSecret: true },
  })
  if (!user?.totpSecret) {
    return NextResponse.json({ error: 'Run setup first' }, { status: 400 })
  }

  const plain = decryptTotpSecret(user.totpSecret)
  if (!plain || !verifyTotpCode(plain, code)) {
    return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 })
  }

  await prisma.adminUser.update({
    where: { id: session.id },
    data: { mfaEnabled: true },
  })

  return NextResponse.json({ ok: true, mfaEnabled: true })
}

/** DELETE — disable MFA (requires current TOTP code + password) */
export async function DELETE(req: NextRequest) {
  const session = await getAdminSession(req)
  if (!session?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { body, error } = await parseBody<{ code?: string; password?: string }>(req)
  if (error) return badRequest()

  const user = await prisma.adminUser.findUnique({
    where: { id: session.id },
    select: { passwordHash: true, totpSecret: true, mfaEnabled: true },
  })
  if (!user?.mfaEnabled || !user.totpSecret) {
    return NextResponse.json({ error: 'MFA is not enabled' }, { status: 400 })
  }

  if (!body.password || !body.code) {
    return NextResponse.json({ error: 'Password and verification code are required' }, { status: 400 })
  }

  const validPassword = await bcrypt.compare(body.password, user.passwordHash)
  if (!validPassword) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  const plain = decryptTotpSecret(user.totpSecret)
  if (!plain || !verifyTotpCode(plain, body.code)) {
    return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 })
  }

  await prisma.adminUser.update({
    where: { id: session.id },
    data: { mfaEnabled: false, totpSecret: null },
  })

  return NextResponse.json({ ok: true, mfaEnabled: false })
}
