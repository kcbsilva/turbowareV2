const SLUG_RE = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/

export function normalizeSignupSlug(raw: string): string {
  const s = raw.trim().toLowerCase().replace(/\s+/g, '-')
  let out = ''
  for (const ch of s) {
    if (/[a-z0-9-]/.test(ch)) out += ch
  }
  return out
}

export function isValidSignupSlug(slug: string): boolean {
  return slug.length >= 3 && slug.length <= 63 && SLUG_RE.test(slug)
}

export function staffLoginUrl(slug: string): string {
  const base = (process.env.TURBOISP_APP_URL || 'https://turboisp.app').replace(/\/$/, '')
  return `${base}/${slug}/login`
}
