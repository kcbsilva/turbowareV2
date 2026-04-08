import { describe, it, expect, afterEach, vi } from 'vitest'

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
