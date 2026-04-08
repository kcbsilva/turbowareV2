import { SubscriptionStatus } from '@prisma/client'

export const ALLOWED_TRANSITIONS: Record<SubscriptionStatus, SubscriptionStatus[]> = {
  TRIAL:           ['PENDING_PAYMENT', 'CANCELLED'],
  PENDING_PAYMENT: ['ACTIVE', 'SUSPENDED', 'CANCELLED'],
  ACTIVE:          ['SUSPENDED', 'CANCELLED'],
  SUSPENDED:       ['ACTIVE', 'PENDING_PAYMENT', 'CANCELLED'],
  CANCELLED:       ['PENDING_PAYMENT'],
}

export function isValidTransition(from: string, to: string): boolean {
  const allowed = ALLOWED_TRANSITIONS[from as SubscriptionStatus]
  if (!allowed) return false
  return allowed.includes(to as SubscriptionStatus)
}
