import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createClientLicense } from '@/lib/client-products'

const db = vi.hoisted(() => ({
  contract: { findFirst: vi.fn() },
  product: { findUnique: vi.fn() },
  client: { findFirst: vi.fn() },
  clientProduct: {
    findUnique: vi.fn(),
    update: vi.fn(),
    create: vi.fn(),
    findUniqueOrThrow: vi.fn(),
  },
}))

vi.mock('@/lib/prisma', () => ({ prisma: db }))
vi.mock('@/lib/billing', () => ({ reconcileSubscriptionLicenseSync: vi.fn() }))
vi.mock('@/lib/product-catalog', () => ({ ensureDefaultCatalog: vi.fn() }))
vi.mock('@/lib/turboisp-bootstrap', () => ({ createTurboISPTenant: vi.fn() }))
vi.mock('@/lib/turboisp-tenant-slug-check', () => ({ isTurboISPTenantSlugTaken: vi.fn() }))

const request = {
  clientId: 'client',
  contractId: 'contract',
  productId: 'product',
  tierId: 'tier',
  dueDate: '2027-01-01',
  tenantSlug: 'example-isp',
}

describe('createClientLicense', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    db.contract.findFirst.mockResolvedValue({ id: 'contract', status: 'ACTIVE' })
    db.product.findUnique.mockResolvedValue({ slug: 'other-product', tiers: [{ id: 'tier' }] })
    db.client.findFirst.mockResolvedValue(null)
    db.clientProduct.update.mockResolvedValue({ id: 'existing' })
    db.clientProduct.findUniqueOrThrow.mockResolvedValue({ id: 'existing' })
  })

  it('attaches an unassigned license without changing its suspension or activation history', async () => {
    db.clientProduct.findUnique.mockResolvedValue({
      id: 'existing', contractId: null, status: 'SUSPENDED', tenantSlug: 'example-isp',
    })

    await expect(createClientLicense(request)).resolves.toMatchObject({ activation: { id: 'existing' } })
    expect(db.clientProduct.update).toHaveBeenCalledWith({
      where: { id: 'existing', contractId: null, status: 'SUSPENDED' },
      data: {
        contractId: 'contract',
        tierId: 'tier',
        tenantSlug: 'example-isp',
        expiresAt: new Date('2027-01-01T12:00:00Z'),
      },
      select: { id: true },
    })
    expect(db.clientProduct.create).not.toHaveBeenCalled()
  })

  it('rejects a license already attached to a contract', async () => {
    db.clientProduct.findUnique.mockResolvedValue({
      id: 'existing', contractId: 'other-contract', status: 'ACTIVE', tenantSlug: 'example-isp',
    })

    await expect(createClientLicense(request)).resolves.toMatchObject({ status: 409 })
    expect(db.clientProduct.update).not.toHaveBeenCalled()
    expect(db.clientProduct.create).not.toHaveBeenCalled()
  })
})
