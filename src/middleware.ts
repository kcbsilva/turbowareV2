import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { COOKIE_NAME, CLIENT_COOKIE_NAME, getJwtSecret } from '@/lib/auth'

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
      return NextResponse.next()
    } catch {
      if (isAdminApi) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      const res = NextResponse.redirect(new URL('/admin/login', req.url))
      res.cookies.delete(COOKIE_NAME)
      return res
    }
  }

  // ── Client portal routes ────────────────────────────────────────────────────
  const isClientDashboard = pathname.startsWith('/client/dashboard')
  const isClientApi       = pathname.startsWith('/api/client/') &&
                            !pathname.startsWith('/api/client/auth') &&
                            !pathname.startsWith('/api/client/validate') &&
                            !pathname.startsWith('/api/client/activate') &&
                            !pathname.startsWith('/api/client/status')

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
