import { describe, expect, it } from 'vitest'
import { isLikelyEmail, normalizePortalEmail } from '../portal-email'

describe('normalizePortalEmail', () => {
  it('trims and lowercases', () => {
    expect(normalizePortalEmail('  Ops@Example.COM ')).toBe('ops@example.com')
  })
})

describe('isLikelyEmail', () => {
  it('accepts a normal address', () => {
    expect(isLikelyEmail('ops@example.com')).toBe(true)
  })

  it('rejects empty and CNPJ-shaped values', () => {
    expect(isLikelyEmail('')).toBe(false)
    expect(isLikelyEmail('12345678000199')).toBe(false)
  })
})
