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
