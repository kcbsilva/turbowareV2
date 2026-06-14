import { SignJWT, jwtVerify } from 'jose'
import { getJwtSecret } from '@/lib/auth'

export const MFA_PENDING_COOKIE = 'tw_mfa_pending'

export async function signMfaPendingToken(userId: string): Promise<string> {
  return new SignJWT({ purpose: 'mfa_pending', userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('5m')
    .sign(getJwtSecret())
}

export async function verifyMfaPendingToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret())
    if (payload.purpose !== 'mfa_pending') return null
    const userId = payload.userId
    return typeof userId === 'string' ? userId : null
  } catch {
    return null
  }
}
