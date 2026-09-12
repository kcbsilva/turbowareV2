import { describe, it, expect } from 'vitest'
import {
  allOtherInvoicesSettled,
  isInvoiceSettled,
  isInvoiceUnpaid,
  licenseStatusForSubscription,
  shouldActivateOnPayment,
} from '../billing'

describe('invoice settlement', () => {
  it('treats paid, waived, and grace-fee lines as settled', () => {
    expect(isInvoiceSettled({ id: '1', status: 'PAID', type: 'MONTHLY' })).toBe(true)
    expect(isInvoiceSettled({ id: '2', status: 'WAIVED', type: 'MONTHLY' })).toBe(true)
    expect(isInvoiceSettled({ id: '3', status: 'PENDING', type: 'GRACE_FEE' })).toBe(true)
    expect(isInvoiceSettled({ id: '4', status: 'PENDING', type: 'MONTHLY' })).toBe(false)
    expect(isInvoiceSettled({ id: '5', status: 'OVERDUE', type: 'MONTHLY' })).toBe(false)
  })

  it('treats pending and overdue as unpaid', () => {
    expect(isInvoiceUnpaid({ id: '1', status: 'PENDING', type: 'MONTHLY' })).toBe(true)
    expect(isInvoiceUnpaid({ id: '2', status: 'OVERDUE', type: 'MONTHLY' })).toBe(true)
    expect(isInvoiceUnpaid({ id: '3', status: 'PAID', type: 'MONTHLY' })).toBe(false)
  })

  it('ignores the just-paid invoice when checking remaining balances', () => {
    const invoices = [
      { id: 'a', status: 'PENDING', type: 'MONTHLY' },
      { id: 'b', status: 'PAID', type: 'INSTALLATION' },
      { id: 'c', status: 'WAIVED', type: 'PRORATED' },
    ]
    expect(allOtherInvoicesSettled(invoices, 'a')).toBe(true)
    expect(allOtherInvoicesSettled(invoices, 'b')).toBe(false)
  })
})

describe('license release on payment', () => {
  it('releases a suspended or pending subscription once invoices settle', () => {
    expect(shouldActivateOnPayment('SUSPENDED')).toBe(true)
    expect(shouldActivateOnPayment('PENDING_PAYMENT')).toBe(true)
    expect(shouldActivateOnPayment('TRIAL')).toBe(true)
    expect(shouldActivateOnPayment('ACTIVE')).toBe(false)
    expect(shouldActivateOnPayment('CANCELLED')).toBe(false)
  })

  it('mirrors subscription status onto the license', () => {
    expect(licenseStatusForSubscription('ACTIVE')).toBe('ACTIVE')
    expect(licenseStatusForSubscription('TRIAL')).toBe('ACTIVE')
    expect(licenseStatusForSubscription('SUSPENDED')).toBe('SUSPENDED')
    expect(licenseStatusForSubscription('CANCELLED')).toBe('SUSPENDED')
    expect(licenseStatusForSubscription('PENDING_PAYMENT')).toBeNull()
  })
})
