import { describe, it, expect } from 'vitest'
import { isValidTransition } from '../transitions'

describe('isValidTransition', () => {
  it('allows PENDING_PAYMENT → ACTIVE', () => {
    expect(isValidTransition('PENDING_PAYMENT', 'ACTIVE')).toBe(true)
  })

  it('allows ACTIVE → SUSPENDED', () => {
    expect(isValidTransition('ACTIVE', 'SUSPENDED')).toBe(true)
  })

  it('allows SUSPENDED → ACTIVE', () => {
    expect(isValidTransition('SUSPENDED', 'ACTIVE')).toBe(true)
  })

  it('allows any valid status → CANCELLED', () => {
    expect(isValidTransition('TRIAL', 'CANCELLED')).toBe(true)
    expect(isValidTransition('ACTIVE', 'CANCELLED')).toBe(true)
    expect(isValidTransition('SUSPENDED', 'CANCELLED')).toBe(true)
  })

  it('allows CANCELLED → PENDING_PAYMENT (reactivation)', () => {
    expect(isValidTransition('CANCELLED', 'PENDING_PAYMENT')).toBe(true)
  })

  it('blocks ACTIVE → TRIAL', () => {
    expect(isValidTransition('ACTIVE', 'TRIAL')).toBe(false)
  })

  it('blocks CANCELLED → ACTIVE (must go through PENDING_PAYMENT)', () => {
    expect(isValidTransition('CANCELLED', 'ACTIVE')).toBe(false)
  })

  it('blocks same-state transition', () => {
    expect(isValidTransition('ACTIVE', 'ACTIVE')).toBe(false)
  })

  it('blocks unknown status values', () => {
    expect(isValidTransition('ACTIVE', 'INVALID')).toBe(false)
    expect(isValidTransition('UNKNOWN', 'ACTIVE')).toBe(false)
  })
})
