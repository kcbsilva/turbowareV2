import { describe, expect, it } from 'vitest'
import { isValidSignupSlug, normalizeSignupSlug, parseSignupSlug } from '../signup-slug'

describe('normalizeSignupSlug', () => {
  it('strips punctuation, collapses hyphens, and trims edges', () => {
    expect(normalizeSignupSlug('  Acme ISP!! ')).toBe('acme-isp')
    expect(normalizeSignupSlug('-acme-')).toBe('acme')
    expect(normalizeSignupSlug('acme.turboisp.app')).toBe('acmeturboispapp')
  })
})

describe('parseSignupSlug', () => {
  it('allows an empty optional subdomain', () => {
    expect(parseSignupSlug('')).toEqual({ slug: null })
    expect(parseSignupSlug('   ')).toEqual({ slug: null })
  })

  it('accepts a normal company slug', () => {
    expect(parseSignupSlug('NorthNet')).toEqual({ slug: 'northnet' })
  })

  it('rejects reserved names with a specific error', () => {
    const parsed = parseSignupSlug('admin')
    expect(parsed).toEqual(expect.objectContaining({
      error: expect.stringMatching(/reserved/i),
    }))
  })

  it('rejects slugs shorter than 3 characters', () => {
    const parsed = parseSignupSlug('ab')
    expect(parsed).toEqual(expect.objectContaining({
      error: expect.stringMatching(/at least 3/i),
    }))
  })

  it('rejects input that strips to nothing', () => {
    const parsed = parseSignupSlug('@@@')
    expect(parsed).toEqual(expect.objectContaining({
      error: expect.stringMatching(/letters or numbers/i),
    }))
  })
})

describe('isValidSignupSlug', () => {
  it('requires 3–63 DNS-safe characters', () => {
    expect(isValidSignupSlug('ab')).toBe(false)
    expect(isValidSignupSlug('acme')).toBe(true)
  })
})
