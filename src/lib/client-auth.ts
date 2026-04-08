import { NextRequest } from 'next/server'

// Prisma CUIDs: start with 'c', exactly 25 lowercase alphanumeric chars
const CUID_RE = /^c[a-z0-9]{24}$/

/**
 * Reads x-client-id from headers (set by middleware after JWT verification).
 * Returns the value if it matches Prisma's CUID format, otherwise null.
 */
export function getClientId(req: NextRequest): string | null {
  const value = req.headers.get('x-client-id')
  if (!value || !CUID_RE.test(value)) return null
  return value
}
