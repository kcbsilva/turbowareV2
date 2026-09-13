import { describe, expect, it } from 'vitest'
import { formatContractNumber } from '../contracts'

describe('formatContractNumber', () => {
  it('builds CTR-YYYYMM-suffix from id and date', () => {
    expect(formatContractNumber('cmqyxqpiq0001srql8qqs9woz', '2026-09-13T12:00:00.000Z')).toBe('CTR-202609-QS9WOZ')
  })
})
