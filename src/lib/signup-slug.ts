import { PUBLIC_TENANT_SIGNUP_ENABLED, TURBOISP_SALES_MAILTO } from '@/lib/public-signup'
import { RESERVED_SLUGS } from '@/lib/slug'

const SLUG_RE = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/

export function normalizeSignupSlug(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 63)
}

export function isValidSignupSlug(slug: string): boolean {
  return slug.length >= 3 && slug.length <= 63 && SLUG_RE.test(slug)
}

/** Parse a tenant subdomain. Empty input yields `{ slug: null }` (optional). */
export function parseSignupSlug(raw: string | null | undefined): { slug: string | null } | { error: string } {
  const trimmed = raw?.trim() ?? ''
  if (!trimmed) return { slug: null }

  const slug = normalizeSignupSlug(trimmed)
  if (!slug) {
    return { error: 'Subdomain must use letters or numbers (a–z, 0–9)' }
  }
  if (RESERVED_SLUGS.has(slug)) {
    return { error: `"${slug}" is reserved. Try a company name like acme or northnet.` }
  }
  if (slug.length < 3) {
    return { error: 'Subdomain must be at least 3 characters' }
  }
  if (!isValidSignupSlug(slug)) {
    return { error: 'Use lowercase letters, numbers, and hyphens; it cannot start or end with a hyphen' }
  }
  return { slug }
}

export function turboispAppBase(): string {
  return (
    process.env.NEXT_PUBLIC_TURBOISP_APP_URL ||
    process.env.TURBOISP_APP_URL ||
    'https://turboisp.app'
  ).replace(/\/$/, '')
}

/** TurboISP React app public signup, or sales mailto while self-serve is paused. */
export function turboispSignupUrl(): string {
  if (!PUBLIC_TENANT_SIGNUP_ENABLED) return TURBOISP_SALES_MAILTO
  return `${turboispAppBase()}/signup`
}

export function staffLoginUrl(slug: string): string {
  return `${turboispAppBase()}/${slug}/login`
}
