import { turboISPQuery } from '@/lib/turboisp-db'

type SlugLookupResult =
  | { taken: boolean; source: 'db' | 'api' }
  | { error: string }

function turboISPApiOrigin(): string | null {
  const raw =
    process.env.TURBOISP_API_URL?.trim() ||
    process.env.API_PROXY_TARGET?.trim()
  if (!raw) return null
  return raw.replace(/\/$/, '')
}

async function lookupViaApi(slug: string): Promise<SlugLookupResult | null> {
  const origin = turboISPApiOrigin()
  if (!origin) return null

  try {
    const res = await fetch(
      `${origin}/api/v1/public/signup/check-slug?slug=${encodeURIComponent(slug)}`,
      { signal: AbortSignal.timeout(8000) },
    )
    if (!res.ok) return { error: 'Could not check availability' }
    const data = (await res.json()) as { available?: boolean }
    return { taken: data.available === false, source: 'api' }
  } catch (err) {
    console.error('[turboisp-tenant-slug] API fallback failed:', err)
    return null
  }
}

/** Returns whether slug exists in TurboISP tenants (API first when configured, else DB). */
export async function isTurboISPTenantSlugTaken(slug: string): Promise<SlugLookupResult> {
  const viaApi = await lookupViaApi(slug)
  if (viaApi && !('error' in viaApi)) {
    return viaApi
  }

  if (process.env.TURBOISP_DATABASE_URL?.trim()) {
    try {
      const tenant = await turboISPQuery<{ id: string }>(
        `SELECT id FROM tenants WHERE slug = $1 LIMIT 1`,
        [slug],
      )
      return { taken: tenant.rows.length > 0, source: 'db' }
    } catch (err) {
      console.error('[turboisp-tenant-slug] DB lookup failed:', err)
    }
  }

  if (viaApi) return viaApi

  return { error: 'Could not check availability' }
}
