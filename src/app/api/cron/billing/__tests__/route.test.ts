import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const mocks = vi.hoisted(() => ({
  findMany: vi.fn(),
  updateSubscription: vi.fn(),
  createInvoice: vi.fn(),
  transaction: vi.fn(),
  reconcile: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    subscription: { findMany: mocks.findMany, update: mocks.updateSubscription },
    invoice: { create: mocks.createInvoice },
    $transaction: mocks.transaction,
  },
}))

vi.mock('@/lib/billing', () => ({
  reconcileSubscriptionLicenseSync: mocks.reconcile,
}))

import { GET } from '../route'

const now = new Date('2026-09-13T12:00:00.000Z')

function subscription(overrides: Record<string, unknown> = {}) {
  return {
    id: 'subscription-demo',
    clientId: 'client-demo',
    licenseId: 'license-demo',
    status: 'ACTIVE',
    seats: 150,
    monthlyAmount: 99,
    billingDate: now.getDate(),
    subscriberTier: '150',
    pendingDowngradeTier: null,
    gracePeriodEndsAt: null,
    trialEndsAt: null,
    invoices: [],
    ...overrides,
  }
}

async function runCron() {
  const response = await GET(new NextRequest('https://turboware.example/api/cron/billing'))
  expect(response.status).toBe(200)
  return response.json()
}

beforeEach(() => {
  vi.resetAllMocks()
  vi.useFakeTimers()
  vi.setSystemTime(now)
  vi.stubEnv('CRON_SECRET', '')
  mocks.updateSubscription.mockResolvedValue({})
  mocks.createInvoice.mockResolvedValue({})
  mocks.transaction.mockResolvedValue([])
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllEnvs()
})

describe('billing cron reconciliation', () => {
  it.each(['ACTIVE', 'PENDING_PAYMENT'])(
    'does not bill a %s subscription suspended by reconciliation',
    async (status) => {
      const sub = subscription({ status })
      mocks.findMany.mockResolvedValue([sub])
      mocks.reconcile.mockResolvedValue({ ...sub, status: 'SUSPENDED' })

      const result = await runCron()

      expect(mocks.reconcile).toHaveBeenCalledWith(sub.clientId)
      expect(mocks.createInvoice).not.toHaveBeenCalled()
      expect(result).toMatchObject({ suspended: 1, invoicesCreated: 0, errors: [] })
    },
  )

  it('repairs existing suspended subscriptions without billing or counting a new suspension', async () => {
    const sub = subscription({ status: 'SUSPENDED' })
    mocks.findMany.mockResolvedValue([sub])
    mocks.reconcile.mockResolvedValue(sub)

    const result = await runCron()

    expect(mocks.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { status: { in: expect.arrayContaining(['SUSPENDED']) } },
    }))
    expect(mocks.reconcile).toHaveBeenCalledWith(sub.clientId)
    expect(mocks.createInvoice).not.toHaveBeenCalled()
    expect(result).toMatchObject({ suspended: 0, invoicesCreated: 0, errors: [] })
  })

  it('preserves reconciled paid grace despite an old overdue invoice', async () => {
    const sub = subscription({
      gracePeriodEndsAt: new Date('2026-09-16T12:00:00.000Z'),
      invoices: [{
        type: 'MONTHLY',
        status: 'OVERDUE',
        dueDate: new Date('2026-07-15T12:00:00.000Z'),
        createdAt: new Date('2026-07-01T12:00:00.000Z'),
      }],
    })
    mocks.findMany.mockResolvedValue([sub])
    mocks.reconcile.mockResolvedValue(sub)

    const result = await runCron()

    expect(mocks.updateSubscription).not.toHaveBeenCalled()
    expect(mocks.createInvoice).toHaveBeenCalledOnce()
    expect(result).toMatchObject({ suspended: 0, gracePeriodExpired: 0, invoicesCreated: 1, errors: [] })
  })

  it('uses refreshed invoices to avoid creating a duplicate monthly bill', async () => {
    const sub = subscription()
    mocks.findMany.mockResolvedValue([sub])
    mocks.reconcile.mockResolvedValue({
      ...sub,
      invoices: [{ type: 'MONTHLY', createdAt: now }],
    })

    const result = await runCron()

    expect(mocks.createInvoice).not.toHaveBeenCalled()
    expect(result).toMatchObject({ invoicesCreated: 0, errors: [] })
  })

  it('reconciles the pending license after an expired trial receives its first invoice', async () => {
    const sub = subscription({
      status: 'TRIAL',
      trialEndsAt: new Date('2026-09-12T12:00:00.000Z'),
    })
    mocks.findMany.mockResolvedValue([sub])
    mocks.reconcile.mockResolvedValue({ ...sub, status: 'PENDING_PAYMENT' })

    const result = await runCron()

    expect(mocks.transaction).toHaveBeenCalledOnce()
    expect(mocks.createInvoice).toHaveBeenCalledOnce()
    expect(mocks.reconcile).toHaveBeenCalledWith(sub.clientId)
    expect(mocks.reconcile.mock.invocationCallOrder[0]).toBeGreaterThan(
      mocks.transaction.mock.invocationCallOrder[0],
    )
    expect(result).toMatchObject({ trialExpired: 1, invoicesCreated: 1, errors: [] })
  })

  it('counts a trial suspended during reconciliation of an existing overdue invoice', async () => {
    const sub = subscription({
      status: 'TRIAL',
      trialEndsAt: new Date('2026-09-12T12:00:00.000Z'),
      invoices: [{ type: 'MONTHLY', status: 'OVERDUE' }],
    })
    mocks.findMany.mockResolvedValue([sub])
    mocks.reconcile.mockResolvedValue({ ...sub, status: 'SUSPENDED' })

    const result = await runCron()

    expect(mocks.createInvoice).not.toHaveBeenCalled()
    expect(result).toMatchObject({ trialExpired: 1, suspended: 1, invoicesCreated: 0, errors: [] })
  })
})
