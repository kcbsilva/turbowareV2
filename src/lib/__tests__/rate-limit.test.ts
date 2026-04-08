import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// Mock Date to control time
describe('RateLimiter', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('allows requests below limit', async () => {
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))
    const { RateLimiter } = await import('../rate-limit')
    const limiter = new RateLimiter({ max: 5, windowMs: 15 * 60 * 1000 })

    for (let i = 0; i < 5; i++) {
      expect(limiter.check('1.2.3.4')).toBe(true)
    }
  })

  it('blocks requests over limit', async () => {
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))
    vi.resetModules()
    const { RateLimiter } = await import('../rate-limit')
    const limiter = new RateLimiter({ max: 5, windowMs: 15 * 60 * 1000 })

    for (let i = 0; i < 5; i++) limiter.check('1.2.3.4')
    expect(limiter.check('1.2.3.4')).toBe(false)
  })

  it('resets after window expires', async () => {
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))
    vi.resetModules()
    const { RateLimiter } = await import('../rate-limit')
    const limiter = new RateLimiter({ max: 5, windowMs: 15 * 60 * 1000 })

    for (let i = 0; i < 5; i++) limiter.check('1.2.3.4')

    // Advance 16 minutes
    vi.advanceTimersByTime(16 * 60 * 1000)
    expect(limiter.check('1.2.3.4')).toBe(true)
  })

  it('does not affect other IPs', async () => {
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))
    vi.resetModules()
    const { RateLimiter } = await import('../rate-limit')
    const limiter = new RateLimiter({ max: 5, windowMs: 15 * 60 * 1000 })

    for (let i = 0; i < 6; i++) limiter.check('1.2.3.4')
    expect(limiter.check('9.9.9.9')).toBe(true)
  })
})
