import { describe, expect, it } from 'vitest'
import { daysPastDue, OVERDUE_GRACE_DAYS, resolveAccessGate } from '../access-gate'

const due = (iso: string) => new Date(iso)

describe('daysPastDue', () => {
  it('is 0 on the due day', () => {
    expect(daysPastDue(due('2026-09-09T12:00:00Z'), due('2026-09-09T23:00:00Z'))).toBe(0)
  })

  it('counts whole UTC days after due', () => {
    expect(daysPastDue(due('2026-09-09T00:00:00Z'), due('2026-09-12T08:00:00Z'))).toBe(3)
  })
})

describe('resolveAccessGate', () => {
  const now = due('2026-09-12T15:00:00Z')

  it('is ok when invoices are not yet due', () => {
    const gate = resolveAccessGate({
      subscriptionStatus: 'ACTIVE',
      invoices: [{ status: 'PENDING', type: 'MONTHLY', dueDate: due('2026-09-20T00:00:00Z') }],
      now,
    })
    expect(gate.mode).toBe('ok')
  })

  it('warns for the 3 days after overdue', () => {
    const gate = resolveAccessGate({
      subscriptionStatus: 'ACTIVE',
      invoices: [{ status: 'OVERDUE', type: 'MONTHLY', dueDate: due('2026-09-10T00:00:00Z') }],
      now,
    })
    expect(gate.mode).toBe('grace')
    expect(gate.daysRemaining).toBe(1)
    expect(gate.reason).toBe('overdue_grace')
  })

  it(`blocks at ${OVERDUE_GRACE_DAYS} days past due`, () => {
    const gate = resolveAccessGate({
      subscriptionStatus: 'ACTIVE',
      invoices: [{ status: 'OVERDUE', type: 'MONTHLY', dueDate: due('2026-09-09T00:00:00Z') }],
      now,
    })
    expect(gate.mode).toBe('blocked')
    expect(gate.reason).toBe('overdue')
  })

  it('blocks a suspended subscription', () => {
    expect(
      resolveAccessGate({ subscriptionStatus: 'SUSPENDED', now }).mode,
    ).toBe('blocked')
  })

  it('keeps continue access while a paid extra grace period is live', () => {
    const gate = resolveAccessGate({
      subscriptionStatus: 'SUSPENDED',
      gracePeriodEndsAt: due('2026-09-14T15:00:00Z'),
      now,
    })
    expect(gate.mode).toBe('grace')
    expect(gate.reason).toBe('paid_grace')
  })

  it('always blocks a revoked license', () => {
    expect(
      resolveAccessGate({
        subscriptionStatus: 'ACTIVE',
        licenseStatus: 'REVOKED',
        gracePeriodEndsAt: due('2026-09-14T15:00:00Z'),
        now,
      }).mode,
    ).toBe('blocked')
  })

  it('blocks cancelled accounts', () => {
    expect(resolveAccessGate({ subscriptionStatus: 'CANCELLED', now }).reason).toBe('cancelled')
  })

  it('ignores unpaid grace-fee lines', () => {
    const gate = resolveAccessGate({
      subscriptionStatus: 'ACTIVE',
      invoices: [{ status: 'PENDING', type: 'GRACE_FEE', dueDate: due('2026-09-01T00:00:00Z') }],
      now,
    })
    expect(gate.mode).toBe('ok')
  })
})
