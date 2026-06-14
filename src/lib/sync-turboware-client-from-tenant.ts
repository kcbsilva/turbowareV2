import { prisma } from '@/lib/prisma'
import { turboISPQuery } from '@/lib/turboisp-db'
import { regionForCountry } from '@/lib/signup-countries'

type TenantRow = {
  id: string
  slug: string
  name: string
  admin_email: string | null
  admin_username: string | null
  admin_password_hash: string | null
  country_code: string | null
  currency: string | null
}

async function fetchTenantRows(slug?: string): Promise<TenantRow[]> {
  const { rows } = await turboISPQuery<TenantRow>(
    `SELECT t.id::text, t.slug, t.name,
      su.email AS admin_email,
      su.username AS admin_username,
      su.password AS admin_password_hash,
      COALESCE(ts.value->>'defaultCountryCode', 'US') AS country_code,
      COALESCE(ts.value->>'defaultCurrency', 'USD') AS currency
    FROM tenants t
    LEFT JOIN LATERAL (
      SELECT email, username, password FROM system_users
      WHERE tenant_id = t.id AND COALESCE(is_archived, false) = false
      ORDER BY created_at ASC LIMIT 1
    ) su ON true
    LEFT JOIN tenant_settings ts ON ts.tenant_id = t.id AND ts.setting_key = 'global_settings'
    WHERE ($1::text IS NULL OR t.slug = $1)
    ORDER BY t.created_at DESC`,
    [slug ?? null],
  )
  return rows
}

export async function syncTurboISPTenantsToClients(opts?: { slug?: string }) {
  const rows = await fetchTenantRows(opts?.slug?.trim() || undefined)
  const synced: string[] = []
  const skipped: string[] = []
  const errors: { slug: string; error: string }[] = []

  for (const row of rows) {
    const existing = await prisma.client.findFirst({
      where: { subdomain: row.slug },
      select: { id: true },
    })
    if (existing) {
      skipped.push(row.slug)
      continue
    }

    const email = row.admin_email?.trim().toLowerCase() ?? ''
    if (!email) {
      errors.push({ slug: row.slug, error: 'tenant has no admin email' })
      continue
    }

    const emailTaken = await prisma.client.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
      select: { id: true, subdomain: true },
    })
    if (emailTaken) {
      errors.push({
        slug: row.slug,
        error: `admin email already used by client ${emailTaken.subdomain ?? emailTaken.id}`,
      })
      continue
    }

    try {
      const region = regionForCountry(row.country_code ?? 'US')
      const client = await prisma.client.create({
        data: {
          name: `${row.name} Admin`,
          email,
          company: row.name,
          password: row.admin_password_hash,
          subdomain: row.slug,
          emailVerified: true,
          internalNotes: [
            `TurboISP tenant: ${row.id}`,
            `Admin username: ${row.admin_username ?? ''}`,
            `Country: ${row.country_code ?? 'US'}`,
            `Currency: ${row.currency ?? 'USD'}`,
            `Synced from TurboISP on ${new Date().toISOString()}`,
          ].join('\n'),
        },
      })

      await prisma.subscription.create({
        data: {
          clientId: client.id,
          product: 'TurboISP',
          seats: 0,
          status: 'TRIAL',
          billingDate: 1,
          trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          region,
        },
      })

      synced.push(row.slug)
    } catch (err) {
      errors.push({
        slug: row.slug,
        error: err instanceof Error ? err.message : 'sync failed',
      })
    }
  }

  return { synced, skipped, errors, scanned: rows.length }
}
