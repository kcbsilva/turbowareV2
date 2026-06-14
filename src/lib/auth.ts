import { NextRequest, NextResponse } from 'next/server'
import { SignJWT, jwtVerify } from 'jose'

// ── Shared secret ────────────────────────────────────────────────────────────
export function getJwtSecret(): Uint8Array {
  const s = process.env.JWT_SECRET
  if (!s) throw new Error('JWT_SECRET environment variable is not set')
  return new TextEncoder().encode(s)
}

// ── Admin auth ────────────────────────────────────────────────────────────────
export const COOKIE_NAME = 'tw_admin_token'

export interface AdminTokenPayload {
  id?: string
  name?: string
  email?: string
  role: string
}

export async function signAdminToken(user?: { id: string; name: string; email: string; role: string }): Promise<string> {
  const jwtPayload = user
    ? { role: user.role, id: user.id, name: user.name, email: user.email }
    : { role: 'admin' }

  return new SignJWT(jwtPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('12h')
    .sign(getJwtSecret())
}

export async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret())
    return payload.role === 'admin'
  } catch {
    return false
  }
}

// ── Client portal auth ────────────────────────────────────────────────────────
export const CLIENT_COOKIE_NAME = 'tw_client_token'

export async function signClientToken(clientId: string): Promise<string> {
  return new SignJWT({ role: 'client', clientId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('12h')
    .sign(getJwtSecret())
}

export async function verifyClientToken(token: string): Promise<{ valid: boolean; clientId?: string }> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret())
    if (payload.role !== 'client') return { valid: false }
    return { valid: true, clientId: payload.clientId as string }
  } catch {
    return { valid: false }
  }
}

/** Read verified admin session from the admin JWT cookie (for /api/auth/* handlers). */
export async function getAdminSession(req: NextRequest): Promise<AdminTokenPayload | null> {
  const token = req.cookies.get(COOKIE_NAME)?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, getJwtSecret())
    if (payload.role !== 'admin') return null
    return {
      id: payload.id as string | undefined,
      name: payload.name as string | undefined,
      email: payload.email as string | undefined,
      role: payload.role as string,
    }
  } catch {
    return null
  }
}

export function setAdminAuthCookie(res: NextResponse, token: string): void {
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 12,
  })
}

