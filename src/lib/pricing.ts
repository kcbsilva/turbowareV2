// ── Brazil pricing table ─────────────────────────────────────────────────────

export const INSTALLATION_FEE = 500
export const GRACE_FEE = 5
export const TRIAL_DAYS = 7
export const BILLING_DATE_LOCK_MONTHS = 3

export const BRAZIL_TIERS: { maxSeats: number; monthly: number }[] = [
  { maxSeats: 150,   monthly: 120  },
  { maxSeats: 200,   monthly: 160  },
  { maxSeats: 400,   monthly: 320  },
  { maxSeats: 500,   monthly: 400  },
  { maxSeats: 1000,  monthly: 600  },
  { maxSeats: 2000,  monthly: 800  },
  { maxSeats: 4000,  monthly: 1200 },
  { maxSeats: 6000,  monthly: 1500 },
  { maxSeats: 8000,  monthly: 1800 },
  { maxSeats: 10000, monthly: 2200 },
  { maxSeats: 12000, monthly: 2600 },
]

/** Returns monthly price in BRL, or null if seats > 12000 (Inquire). */
export function getMonthlyPrice(seats: number): number | null {
  const tier = BRAZIL_TIERS.find((t) => seats <= t.maxSeats)
  return tier ? tier.monthly : null
}

/**
 * Returns the prorated amount from today through the next occurrence of billingDay.
 * e.g. today = 5th, billingDay = 20 → 15 days of (monthly / daysInMonth)
 */
export function getProratedAmount(monthlyPrice: number, billingDay: number): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const year  = today.getFullYear()
  const month = today.getMonth()

  let billingDate = new Date(year, month, billingDay)
  if (billingDate <= today) {
    billingDate = new Date(year, month + 1, billingDay)
  }

  const daysUntil   = Math.ceil((billingDate.getTime() - today.getTime()) / 86_400_000)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daily       = monthlyPrice / daysInMonth

  return Math.round(daily * daysUntil * 100) / 100
}

/** Next billing date object given billingDay. */
export function nextBillingDate(billingDay: number): Date {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  let d = new Date(today.getFullYear(), today.getMonth(), billingDay)
  if (d <= today) d = new Date(today.getFullYear(), today.getMonth() + 1, billingDay)
  return d
}

/** Format a number as Brazilian Real. */
export function formatBRL(amount: number): string {
  return `R$\u00A0${amount.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

/** Check if billing date can be changed (every 3 months). */
export function canChangeBillingDate(billingDateChangedAt: Date | null): {
  allowed: boolean
  availableOn?: Date
} {
  if (!billingDateChangedAt) return { allowed: true }
  const available = new Date(billingDateChangedAt)
  available.setMonth(available.getMonth() + BILLING_DATE_LOCK_MONTHS)
  if (available <= new Date()) return { allowed: true }
  return { allowed: false, availableOn: available }
}

/** Check if grace period can be activated (once per calendar month). */
export function canActivateGrace(gracePeriodUsedAt: Date | null): boolean {
  if (!gracePeriodUsedAt) return true
  const now = new Date()
  return (
    gracePeriodUsedAt.getFullYear() < now.getFullYear() ||
    gracePeriodUsedAt.getMonth() < now.getMonth()
  )
}
