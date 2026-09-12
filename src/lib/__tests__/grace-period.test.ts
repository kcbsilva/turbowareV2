import { describe, expect, it } from 'vitest'
import {
  DEFAULT_GRACE_DAYS,
  parseGraceUntilDate,
  resolveGracePeriodEnd,
} from '../grace-period'

const now = new Date('2026-09-12T15:00:00.000Z')

describe('parseGraceUntilDate', () => {
  it('uses the end of that UTC day', () => {
    const d = parseGraceUntilDate('2026-09-20')
    expect(d?.toISOString()).toBe('2026-09-20T23:59:59.999Z')
  })

  it('rejects impossible dates', () => {
    expect(parseGraceUntilDate('2026-02-31')).toBeNull()
  })
})

describe('resolveGracePeriodEnd', () => {
  it('defaults to 3 extra days from now', () => {
    const got = resolveGracePeriodEnd({ input: {}, now, maxDays: 14 })
    expect(got.ok).toBe(true)
    if (!got.ok) return
    expect(got.days).toBe(DEFAULT_GRACE_DAYS)
    expect(got.endsAt.toISOString()).toBe('2026-09-15T15:00:00.000Z')
  })

  it('adds extra days on top of a live grace end', () => {
    const current = new Date('2026-09-14T15:00:00.000Z')
    const got = resolveGracePeriodEnd({
      input: { days: 2 },
      now,
      currentEndsAt: current,
      maxDays: 90,
    })
    expect(got.ok).toBe(true)
    if (!got.ok) return
    expect(got.endsAt.toISOString()).toBe('2026-09-16T15:00:00.000Z')
  })

  it('sets an absolute calendar date', () => {
    const got = resolveGracePeriodEnd({
      input: { until: '2026-09-18' },
      now,
      maxDays: 14,
    })
    expect(got.ok).toBe(true)
    if (!got.ok) return
    expect(got.endsAt.toISOString()).toBe('2026-09-18T23:59:59.999Z')
  })

  it('rejects a past calendar date', () => {
    const got = resolveGracePeriodEnd({
      input: { until: '2026-09-10' },
      now,
      maxDays: 14,
    })
    expect(got.ok).toBe(false)
  })

  it('rejects more days than the cap', () => {
    const got = resolveGracePeriodEnd({
      input: { days: 20 },
      now,
      maxDays: 14,
    })
    expect(got.ok).toBe(false)
  })
})
