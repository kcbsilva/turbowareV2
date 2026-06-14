import { NextRequest, NextResponse } from 'next/server'

function allowedOrigins(): string[] {
  const raw =
    process.env.SIGNUP_CORS_ORIGINS ||
    process.env.NEXT_PUBLIC_TURBOISP_APP_URL ||
    process.env.TURBOISP_APP_URL ||
    ''
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

function pickOrigin(req: NextRequest): string | null {
  const origin = req.headers.get('origin')
  if (!origin) return null
  const allowed = allowedOrigins()
  if (allowed.length === 0) return origin
  return allowed.includes(origin) ? origin : null
}

export function signupCorsPreflight(req: NextRequest): NextResponse | null {
  if (req.method !== 'OPTIONS') return null
  const origin = pickOrigin(req)
  const res = new NextResponse(null, { status: 204 })
  if (origin) {
    res.headers.set('Access-Control-Allow-Origin', origin)
    res.headers.set('Access-Control-Allow-Credentials', 'true')
  }
  res.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type')
  res.headers.set('Access-Control-Max-Age', '86400')
  return res
}

export function withSignupCors(req: NextRequest, res: NextResponse): NextResponse {
  const origin = pickOrigin(req)
  if (origin) {
    res.headers.set('Access-Control-Allow-Origin', origin)
    res.headers.set('Access-Control-Allow-Credentials', 'true')
    res.headers.set('Vary', 'Origin')
  }
  return res
}
