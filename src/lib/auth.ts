import { NextRequest, NextResponse } from 'next/server'
import { SignJWT, jwtVerify } from 'jose'

// ── Shared secret ────────────────────────────────────────────────────────────
export function getJwtSecret(): Uint8Array {
  const s = process.env.JWT_SECRET
  if (!s) throw new Error('JWT_SECRET environment variable is not set')
  return new TextEncoder().encode(s)
}

// ── Admin roles ──────────────────────────────────────────────────────────────
/** Full-access operators (Kevin + delegated owners). Default role remains "admin". */
export const OWNER_ROLES = ['admin', 'owner'] as const
/** Day-to-day helpers: tickets, onboarding, billing ops — not destructive admin. */
export const SUPPORT_ROLES = ['support', 'helper'] as const
/** Any role allowed into the admin portal JWT + middleware. */
export const ADMIN_PORTAL_ROLES = [...OWNER_ROLES, ...SUPPORT_ROLES] as const

export type OwnerRole = (typeof OWNER_ROLES)[number]
export type SupportRole = (typeof SUPPORT_ROLES)[number]
export type AdminPortalRole = (typeof ADMIN_PORTAL_ROLES)[number]

export function isAdminPortalRole(role: unknown): role is AdminPortalRole {
  return typeof role === 'string' && (ADMIN_PORTAL_ROLES as readonly string[]).includes(role)
}

export function isOwnerRole(role: unknown): role is OwnerRole {
  return typeof role === 'string' && (OWNER_ROLES as readonly string[]).includes(role)
}

export function isSupportRole(role: unknown): role is SupportRole {
  return typeof role === 'string' && (SUPPORT_ROLES as readonly string[]).includes(role)
}

export function normalizeAdminRole(role: unknown): AdminPortalRole | null {
  if (typeof role !== 'string') return null
  const value = role.trim().toLowerCase()
  if (value === 'owner') return 'owner'
  if (value === 'admin') return 'admin'
  if (value === 'helper') return 'helper'
  if (value === 'support') return 'support'
  return null
}

export function canManageTeam(role: unknown): boolean {
  return isOwnerRole(role)
}

export function canDeleteClients(role: unknown): boolean {
  return isOwnerRole(role)
}

export function canDeleteLicenses(role: unknown): boolean {
  return isOwnerRole(role)
}

export function canRevokeLicenses(role: unknown): boolean {
  return isOwnerRole(role)
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
    return isAdminPortalRole(payload.role)
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
    if (!isAdminPortalRole(payload.role)) return null
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

export function clearAdminAuthCookie(res: NextResponse): void {
  res.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
}

export function forbidden(message = 'Forbidden'): NextResponse {
  return NextResponse.json({ error: message }, { status: 403 })
}

export async function requireAdminSession(
  req: NextRequest,
): Promise<{ session: AdminTokenPayload; error: null } | { session: null; error: NextResponse }> {
  const session = await getAdminSession(req)
  if (!session) {
    return { session: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  return { session, error: null }
}

export async function requireOwnerSession(
  req: NextRequest,
): Promise<{ session: AdminTokenPayload; error: null } | { session: null; error: NextResponse }> {
  const result = await requireAdminSession(req)
  if (result.error) return result
  if (!isOwnerRole(result.session.role)) {
    return { session: null, error: forbidden('Owner or admin role required') }
  }
  return result
}

