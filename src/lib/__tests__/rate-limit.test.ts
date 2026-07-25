import { describe, it, expect, beforeEach, vi } from 'vitest'

const { queryRaw } = vi.hoisted(() => ({
  queryRaw: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: { $queryRaw: queryRaw },
}))

import { RateLimiter } from '../rate-limit'

describe('RateLimiter', () => {
  beforeEach(() => {
    queryRaw.mockReset()
  })

  it('allows requests below limit', async () => {
    queryRaw.mockResolvedValue([{ allowed: true }])
    const limiter = new RateLimiter({ namespace: 'login', max: 5, windowMs: 15 * 60 * 1000 })

    await expect(limiter.check('1.2.3.4')).resolves.toBe(true)
    expect(queryRaw).toHaveBeenCalledOnce()
  })

  it('blocks requests over limit', async () => {
    queryRaw.mockResolvedValue([{ allowed: false }])
    const limiter = new RateLimiter({ namespace: 'login', max: 5, windowMs: 15 * 60 * 1000 })

    await expect(limiter.check('1.2.3.4')).resolves.toBe(false)
  })

  it('fails closed if the database returns no decision', async () => {
    queryRaw.mockResolvedValue([])
    const limiter = new RateLimiter({ namespace: 'login', max: 5, windowMs: 15 * 60 * 1000 })

    await expect(limiter.check('1.2.3.4')).resolves.toBe(false)
  })

  it('namespaces and bounds the persisted subject key', async () => {
    queryRaw.mockResolvedValue([{ allowed: true }])
    const limiter = new RateLimiter({ namespace: 'password-reset', max: 3, windowMs: 900_000 })

    await limiter.check('x'.repeat(600))
    const taggedTemplateArgs = queryRaw.mock.calls[0]
    expect(taggedTemplateArgs[1]).toMatch(/^password-reset:/)
    expect(taggedTemplateArgs[1]).toHaveLength(500)
  })
})
