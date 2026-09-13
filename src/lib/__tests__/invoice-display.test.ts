import { describe, expect, it } from 'vitest'
import { formatInvoiceNumber, resolveInvoiceDisplayStatus } from '../invoice-display'

describe('formatInvoiceNumber', () => {
  it('builds INV-YYYYMM-suffix from id and created date', () => {
    expect(formatInvoiceNumber('clxyz0123456789abcdef', '2026-09-12T15:00:00Z')).toBe('INV-202609-ABCDEF')
  })

  it('falls back to INV-suffix when createdAt is missing', () => {
    expect(formatInvoiceNumber('clxyz0123456789abcdef')).toBe('INV-ABCDEF')
  })
})

describe('resolveInvoiceDisplayStatus', () => {
  const now = new Date('2026-09-12T15:00:00Z')

  it('keeps paid and waived as-is', () => {
    expect(resolveInvoiceDisplayStatus({ status: 'PAID', dueDate: '2026-09-01T00:00:00Z' }, now)).toBe('PAID')
    expect(resolveInvoiceDisplayStatus({ status: 'WAIVED' }, now)).toBe('WAIVED')
  })

  it('treats unpaid invoices past due as overdue', () => {
    expect(resolveInvoiceDisplayStatus({ status: 'OVERDUE', dueDate: '2026-09-01T00:00:00Z' }, now)).toBe('OVERDUE')
    expect(resolveInvoiceDisplayStatus({ status: 'PENDING', dueDate: '2026-09-10T00:00:00Z' }, now)).toBe('OVERDUE')
  })

  it('treats closed unpaid invoices that are not past due as pending', () => {
    expect(resolveInvoiceDisplayStatus({ status: 'PENDING', dueDate: '2026-09-20T00:00:00Z' }, now)).toBe('PENDING')
  })
})
