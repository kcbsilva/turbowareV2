import { describe, expect, it } from 'vitest'
import { addIntervalDays, splitInstallments } from '../charges'

describe('splitInstallments', () => {
  it('keeps a single charge whole', () => {
    expect(splitInstallments(500, 1)).toEqual([500])
  })

  it('splits evenly when cents divide cleanly', () => {
    expect(splitInstallments(900, 3)).toEqual([300, 300, 300])
  })

  it('puts leftover cents on the last installment', () => {
    expect(splitInstallments(100, 3)).toEqual([33.33, 33.33, 33.34])
  })
})

describe('addIntervalDays', () => {
  it('advances from noon UTC without shifting the calendar day', () => {
    const start = new Date('2026-09-13T12:00:00.000Z')
    expect(addIntervalDays(start, 30).toISOString()).toBe('2026-10-13T12:00:00.000Z')
  })
})
