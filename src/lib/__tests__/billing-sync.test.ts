import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ transaction: vi.fn() }))

vi.mock('@/lib/prisma', () => ({
  prisma: { $transaction: mocks.transaction },
}))

import { reconcileSubscriptionLicenseSync } from '../billing'

type StoredInvoice = {
  id: string
  subscriptionId: string
  status: string
  type: string
  dueDate: Date
  createdAt: Date
}

type StoredLicense = {
  id: string
  clientId: string
  key: string
  status: string
  maxSeats: number
}

type StoredProduct = {
  id: string
  clientId: string
  status: string
  product: { slug: string }
}

type StoredSubscription = {
  id: string
  clientId: string
  licenseId: string | null
  status: string
  gracePeriodEndsAt: Date | null
}

// A small stateful store makes the assertions observe the records and response
// after reconciliation, including whether update selectors protect other rows.
function makeStore(opts: {
  status?: string
  licenseStatus?: string
  productStatus?: string
  gracePeriodEndsAt?: Date
  invoices?: Partial<StoredInvoice>[]
  missing?: boolean
} = {}) {
  const subscription: StoredSubscription | null = opts.missing ? null : {
    id: 'demo-subscription',
    clientId: 'demo-client',
    licenseId: 'demo-license',
    status: opts.status ?? 'ACTIVE',
    gracePeriodEndsAt: opts.gracePeriodEndsAt ?? null,
  }
  const license: StoredLicense = {
    id: 'demo-license',
    clientId: 'demo-client',
    key: 'TW-DEMO',
    status: opts.licenseStatus ?? 'ACTIVE',
    maxSeats: 10,
  }
  const products: StoredProduct[] = [
    { id: 'isp', clientId: 'demo-client', status: opts.productStatus ?? 'ACTIVE', product: { slug: 'turboisp' } },
    { id: 'chat', clientId: 'demo-client', status: 'ACTIVE', product: { slug: 'turbochat' } },
    { id: 'other-client', clientId: 'other-client', status: 'ACTIVE', product: { slug: 'turboisp' } },
  ]
  const invoices: StoredInvoice[] = (opts.invoices ?? [{}]).map((invoice, i) => ({
    id: `invoice-${i}`,
    subscriptionId: 'demo-subscription',
    status: 'PENDING',
    type: 'MONTHLY',
    dueDate: new Date('2026-08-01T12:00:00.000Z'),
    createdAt: new Date('2026-07-15T12:00:00.000Z'),
    ...invoice,
  }))

  function snapshot() {
    return subscription ? structuredClone({ ...subscription, license, invoices }) : null
  }

  const tx = {
    $queryRaw: vi.fn(async () => subscription ? [{ id: subscription.id }] : []),
    subscription: {
      findUnique: vi.fn(async () => snapshot()),
      update: vi.fn(async ({ data }: { data: Partial<StoredSubscription> }) => {
        if (!subscription) throw new Error('Subscription does not exist')
        Object.assign(subscription, data)
        return snapshot()
      }),
    },
    license: {
      updateMany: vi.fn(async ({ where, data }: { where: Record<string, unknown>; data: Partial<StoredLicense> }) => {
        if (!matches(license, where)) return { count: 0 }
        Object.assign(license, data)
        return { count: 1 }
      }),
    },
    clientProduct: {
      updateMany: vi.fn(async ({ where, data }: { where: Record<string, unknown>; data: Partial<StoredProduct> }) => {
        const selected = products.filter((product) => matches(product, where))
        selected.forEach((product) => Object.assign(product, data))
        return { count: selected.length }
      }),
    },
    invoice: {
      updateMany: vi.fn(async ({ where, data }: { where: Record<string, unknown>; data: Partial<StoredInvoice> }) => {
        const selected = invoices.filter((invoice) => matches(invoice, where))
        selected.forEach((invoice) => Object.assign(invoice, data))
        return { count: selected.length }
      }),
    },
  }
  mocks.transaction.mockImplementation(async (run: (client: typeof tx) => unknown) => run(tx))
  return { subscription, license, products, invoices, tx }
}

function matches(row: object, where: Record<string, unknown>): boolean {
  return Object.entries(where).every(([field, expected]) => {
    if (field === 'AND') {
      const conditions = Array.isArray(expected) ? expected : [expected]
      return conditions.every((condition) => matches(row, condition as Record<string, unknown>))
    }
    if (field === 'OR') {
      return (expected as Record<string, unknown>[]).some((condition) => matches(row, condition))
    }
    const actual = (row as Record<string, unknown>)[field]
    if (expected === null || typeof expected !== 'object' || expected instanceof Date) {
      return actual === expected
    }
    const conditions = expected as Record<string, unknown>
    return Object.entries(conditions).every(([operator, value]) => {
      if (operator === 'not') return actual !== value
      if (operator === 'notIn') return !(value as unknown[]).includes(actual)
      if (operator === 'in') return (value as unknown[]).includes(actual)
      if (operator === 'lt') return (actual as Date) < (value as Date)
      if (operator === 'lte') return (actual as Date) <= (value as Date)
      if (operator === 'equals') return actual === value
      return actual !== null && typeof actual === 'object' && matches(actual, { [operator]: value })
    })
  })
}

describe('subscription and license reconciliation', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-09-13T15:00:00.000Z'))
    mocks.transaction.mockReset()
  })

  afterEach(() => vi.useRealTimers())

  it('suspends the overdue demo subscription and both license records in the same read', async () => {
    const store = makeStore({ gracePeriodEndsAt: new Date('2026-08-10T23:59:59.999Z') })

    const result = await reconcileSubscriptionLicenseSync('demo-client')

    expect(store.subscription?.status).toBe('SUSPENDED')
    expect(store.subscription?.gracePeriodEndsAt).toBeNull()
    expect(store.license.status).toBe('SUSPENDED')
    expect(store.products[0].status).toBe('SUSPENDED')
    expect(store.invoices[0].status).toBe('OVERDUE')
    expect(result?.status).toBe('SUSPENDED')
    expect(result?.license?.status).toBe('SUSPENDED')
    expect(result?.invoices[0].status).toBe('OVERDUE')
    expect(store.products.slice(1).map((product) => product.status)).toEqual(['ACTIVE', 'ACTIVE'])
  })

  it('repairs an active product row when billing is already suspended', async () => {
    const store = makeStore({ status: 'SUSPENDED', licenseStatus: 'SUSPENDED' })

    const result = await reconcileSubscriptionLicenseSync('demo-client')

    expect(result?.status).toBe('SUSPENDED')
    expect(store.products[0].status).toBe('SUSPENDED')
    expect(store.license.status).toBe('SUSPENDED')
  })

  it('honors a future paid grace period despite an old unpaid invoice', async () => {
    const graceEnd = new Date('2026-09-18T23:59:59.999Z')
    const store = makeStore({ gracePeriodEndsAt: graceEnd })

    const result = await reconcileSubscriptionLicenseSync('demo-client')

    expect(result?.status).toBe('ACTIVE')
    expect(store.subscription?.gracePeriodEndsAt).toEqual(graceEnd)
    expect(store.license.status).toBe('ACTIVE')
    expect(store.products[0].status).toBe('ACTIVE')
  })

  it('does not suspend access solely for an unpaid grace fee', async () => {
    const store = makeStore({ invoices: [{ type: 'GRACE_FEE' }] })

    const result = await reconcileSubscriptionLicenseSync('demo-client')

    expect(result?.status).toBe('ACTIVE')
    expect(store.license.status).toBe('ACTIVE')
    expect(store.products[0].status).toBe('ACTIVE')
  })

  it('uses the third UTC calendar day as the suspension boundary', async () => {
    const store = makeStore({ invoices: [{ dueDate: new Date('2026-09-10T23:59:59.999Z') }] })
    vi.setSystemTime(new Date('2026-09-12T23:59:59.999Z'))

    expect((await reconcileSubscriptionLicenseSync('demo-client'))?.status).toBe('ACTIVE')
    expect(store.products[0].status).toBe('ACTIVE')

    vi.setSystemTime(new Date('2026-09-13T00:00:00.000Z'))

    expect((await reconcileSubscriptionLicenseSync('demo-client'))?.status).toBe('SUSPENDED')
    expect(store.products[0].status).toBe('SUSPENDED')
    expect(store.license.status).toBe('SUSPENDED')
  })

  it('returns null without mutating records if there is no subscription', async () => {
    const store = makeStore({ missing: true })

    expect(await reconcileSubscriptionLicenseSync('missing-client')).toBeNull()

    expect(store.tx.subscription.update).not.toHaveBeenCalled()
    expect(store.tx.license.updateMany).not.toHaveBeenCalled()
    expect(store.tx.clientProduct.updateMany).not.toHaveBeenCalled()
    expect(store.tx.invoice.updateMany).not.toHaveBeenCalled()
  })

  it.each(['REVOKED', 'EXPIRED'])('preserves a %s linked license while repairing a stale product', async (licenseStatus) => {
    const store = makeStore({ status: 'SUSPENDED', licenseStatus })

    const result = await reconcileSubscriptionLicenseSync('demo-client')

    expect(store.license.status).toBe(licenseStatus)
    expect(result?.license?.status).toBe(licenseStatus)
    expect(store.products[0].status).toBe('SUSPENDED')
  })
})
