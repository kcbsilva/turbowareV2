import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { COOKIE_NAME, CLIENT_COOKIE_NAME, getJwtSecret } from '@/lib/auth'
import { isSameSiteRequest } from '@/lib/csrf'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // ── Admin routes ────────────────────────────────────────────────────────────
  const isAdminPage = pathname.startsWith('/admin') && pathname !== '/admin/login'
  const isAdminApi  = pathname.startsWith('/api/admin')

  if (isAdminPage || isAdminApi) {
    const token = req.cookies.get(COOKIE_NAME)?.value
    if (!token) {
      if (isAdminApi) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
    try {
      const { payload } = await jwtVerify(token, getJwtSecret())
      if (payload.role !== 'admin') throw new Error()

      // Block cross-origin mutations on admin API
      if (isAdminApi && ['POST', 'PATCH', 'PUT', 'DELETE'].includes(req.method)) {
        if (!isSameSiteRequest(req)) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }
      }

      return NextResponse.next()
    } catch {
      if (isAdminApi) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      const res = NextResponse.redirect(new URL('/admin/login', req.url))
      res.cookies.delete(COOKIE_NAME)
      return res
    }
  }

  // ── Client portal routes ────────────────────────────────────────────────────
  const isClientDashboard = pathname.startsWith('/client/') && pathname !== '/client/login'
  // Public client API routes — no JWT required.
  // Add new public endpoints here; everything else under /api/client/ is protected.
  const PUBLIC_CLIENT_PATHS = [
    '/api/client/auth',
    '/api/client/validate',
    '/api/client/activate',
    '/api/client/status',
  ]

  const isClientApi = pathname.startsWith('/api/client/') &&
    !PUBLIC_CLIENT_PATHS.some((p) => pathname.startsWith(p))

  if (isClientDashboard || isClientApi) {
    const token = req.cookies.get(CLIENT_COOKIE_NAME)?.value
    if (!token) {
      if (isClientApi) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      return NextResponse.redirect(new URL('/client/login', req.url))
    }
    try {
      const { payload } = await jwtVerify(token, getJwtSecret())
      if (payload.role !== 'client') throw new Error()

      // Forward clientId to API handlers via header
      const reqHeaders = new Headers(req.headers)
      reqHeaders.set('x-client-id', payload.clientId as string)
      return NextResponse.next({ request: { headers: reqHeaders } })
    } catch {
      if (isClientApi) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      const res = NextResponse.redirect(new URL('/client/login', req.url))
      res.cookies.delete(CLIENT_COOKIE_NAME)
      return res
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/client/dashboard/:path*',
    '/api/client/:path*',
  ],
}
