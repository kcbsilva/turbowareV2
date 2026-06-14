export function normalizeSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .replace(/^-+|-+$/g, '')
    .slice(0, 63)
}

export const RESERVED_SLUGS = new Set([
  'www', 'api', 'admin', 'mail', 'smtp', 'ftp',
  'app', 'dev', 'staging', 'beta', 'portal',
  'turboisp', 'turboware', 'support', 'billing',
])

export function slugFqdn(slug: string): string {
  const domain = process.env.TURBOISP_DOMAIN || 'turboisp.app'
  return `${slug}.${domain}`
}
