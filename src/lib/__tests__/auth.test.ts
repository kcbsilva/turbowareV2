import { describe, it, expect, afterEach, vi } from 'vitest'
import {
  canDeleteClients,
  canDeleteLicenses,
  canManageTeam,
  canRevokeLicenses,
  isAdminPortalRole,
  isOwnerRole,
  isSupportRole,
  normalizeAdminRole,
} from '../auth'

describe('admin roles', () => {
  it('treats admin and owner as full-access operators', () => {
    expect(isOwnerRole('admin')).toBe(true)
    expect(isOwnerRole('owner')).toBe(true)
    expect(isOwnerRole('support')).toBe(false)
    expect(canManageTeam('admin')).toBe(true)
    expect(canDeleteClients('owner')).toBe(true)
    expect(canDeleteLicenses('admin')).toBe(true)
    expect(canRevokeLicenses('owner')).toBe(true)
  })

  it('treats support and helper as portal roles without destructive power', () => {
    expect(isSupportRole('support')).toBe(true)
    expect(isSupportRole('helper')).toBe(true)
    expect(isAdminPortalRole('helper')).toBe(true)
    expect(isAdminPortalRole('support')).toBe(true)
    expect(canManageTeam('support')).toBe(false)
    expect(canDeleteClients('helper')).toBe(false)
    expect(canRevokeLicenses('support')).toBe(false)
  })

  it('rejects unknown or client roles', () => {
    expect(isAdminPortalRole('client')).toBe(false)
    expect(isAdminPortalRole('')).toBe(false)
    expect(isAdminPortalRole(undefined)).toBe(false)
    expect(normalizeAdminRole('staff')).toBeNull()
  })

  it('normalizes role aliases', () => {
    expect(normalizeAdminRole('Admin')).toBe('admin')
    expect(normalizeAdminRole('OWNER')).toBe('owner')
    expect(normalizeAdminRole(' Helper ')).toBe('helper')
    expect(normalizeAdminRole('support')).toBe('support')
  })
})

describe('getJwtSecret', () => {
  const original = process.env.JWT_SECRET

  afterEach(() => {
    if (original === undefined) delete process.env.JWT_SECRET
    else process.env.JWT_SECRET = original
  })

  it('returns encoded secret when JWT_SECRET is set', async () => {
    process.env.JWT_SECRET = 'test-secret-value'
    const { getJwtSecret } = await import('../auth')
    const result = getJwtSecret()
    expect(result).toBeInstanceOf(Uint8Array)
  })

  it('throws when JWT_SECRET is not set', async () => {
    delete process.env.JWT_SECRET
    vi.resetModules()
    const { getJwtSecret } = await import('../auth')
    expect(() => getJwtSecret()).toThrow('JWT_SECRET environment variable is not set')
  })
})
