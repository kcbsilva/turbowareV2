import { NextRequest } from 'next/server'

/**
 * Returns true if the request originates from the same host.
 * Checks Origin first, falls back to Referer.
 * Requests with neither header are allowed (curl, Postman, server-to-server).
 */
export function isSameSiteRequest(req: NextRequest): boolean {
  const host    = req.headers.get('host')
  const origin  = req.headers.get('origin')
  const referer = req.headers.get('referer')

  if (!host) return false

  if (origin) {
    try {
      return new URL(origin).host === host
    } catch {
      return false
    }
  }

  if (referer) {
    try {
      return new URL(referer).host === host
    } catch {
      return false
    }
  }

  return true
}
