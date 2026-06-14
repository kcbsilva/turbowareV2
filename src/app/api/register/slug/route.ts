import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { turboISPQuery } from '@/lib/turboisp-db'
import { normalizeSlug, RESERVED_SLUGS, slugFqdn } from '@/lib/slug'

/** GET /api/register/slug?name=xyz — check slug availability (Turboware + TurboISP) */
export async function GET(req: NextRequest) {
  const name = normalizeSlug(req.nextUrl.searchParams.get('name') || '')

  if (!name || name.length < 3) {
    return NextResponse.json(
      { available: false, error: 'Nome deve ter pelo menos 3 caracteres.' },
      { status: 400 },
    )
  }

  if (RESERVED_SLUGS.has(name)) {
    return NextResponse.json({
      available: false,
      error: 'Este subdomínio é reservado.',
    })
  }

  const existing = await prisma.client.findFirst({
    where: { subdomain: name },
    select: { id: true },
  })
  if (existing) {
    return NextResponse.json({
      available: false,
      error: 'Este subdomínio já está em uso.',
    })
  }

  try {
    const tenant = await turboISPQuery<{ id: string }>(
      `SELECT id FROM tenants WHERE slug = $1 LIMIT 1`,
      [name],
    )
    if (tenant.rows.length > 0) {
      return NextResponse.json({
        available: false,
        error: 'Este subdomínio já está em uso no TurboISP.',
      })
    }
  } catch (err) {
    console.error('[register/slug] TurboISP lookup failed:', err)
    return NextResponse.json(
      { available: false, error: 'Não foi possível verificar disponibilidade. Tente novamente.' },
      { status: 503 },
    )
  }

  const fqdn = slugFqdn(name)
  return NextResponse.json({
    available: true,
    subdomain: name,
    fqdn,
    message: `${fqdn} está disponível.`,
  })
}
