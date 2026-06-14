import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { turboISPQuery } from '@/lib/turboisp-db'
import { isValidSignupSlug, normalizeSignupSlug } from '@/lib/signup-slug'
import { RESERVED_SLUGS } from '@/lib/slug'
import { signupCorsPreflight, withSignupCors } from '@/lib/signup-cors'

const REASON_INVALID = 'invalid slug'
const REASON_TAKEN = 'slug already in use'

function signupEnabled(): boolean {
  const v = (process.env.PUBLIC_SIGNUP_ENABLED ?? '').trim().toLowerCase()
  return v === '' || v === '1' || v === 'true' || v === 'yes'
}

/** GET /api/signup/check-slug?slug= — React signup compatibility */
export async function OPTIONS(req: NextRequest) {
  return signupCorsPreflight(req) ?? new NextResponse(null, { status: 204 })
}

export async function GET(req: NextRequest) {
  const preflight = signupCorsPreflight(req)
  if (preflight) return preflight

  if (!signupEnabled()) {
    return withSignupCors(req, NextResponse.json({ error: 'public signup is disabled' }, { status: 403 }))
  }

  const slug = normalizeSignupSlug(req.nextUrl.searchParams.get('slug') || '')

  if (!isValidSignupSlug(slug)) {
    return withSignupCors(
      req,
      NextResponse.json({
        slug,
        available: false,
        reason: REASON_INVALID,
      }),
    )
  }

  if (RESERVED_SLUGS.has(slug)) {
    return withSignupCors(
      req,
      NextResponse.json({
        slug,
        available: false,
        reason: REASON_TAKEN,
      }),
    )
  }

  const existingClient = await prisma.client.findFirst({
    where: { subdomain: slug },
    select: { id: true },
  })
  if (existingClient) {
    return withSignupCors(
      req,
      NextResponse.json({
        slug,
        available: false,
        reason: REASON_TAKEN,
      }),
    )
  }

  try {
    const tenant = await turboISPQuery<{ id: string }>(
      `SELECT id FROM tenants WHERE slug = $1 LIMIT 1`,
      [slug],
    )
    if (tenant.rows.length > 0) {
      return withSignupCors(
        req,
        NextResponse.json({
          slug,
          available: false,
          reason: REASON_TAKEN,
        }),
      )
    }
  } catch (err) {
    console.error('[signup/check-slug] TurboISP lookup failed:', err)
    return withSignupCors(
      req,
      NextResponse.json({ error: 'Could not check availability' }, { status: 503 }),
    )
  }

  return withSignupCors(req, NextResponse.json({ slug, available: true, reason: '' }))
}
