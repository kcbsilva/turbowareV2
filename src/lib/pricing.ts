// ── Multi-region pricing ──────────────────────────────────────────────────────

export type Region = 'BR' | 'CA' | 'US' | 'GB'

export const INSTALLATION_FEES: Record<Region, number> = {
  BR: 500,
  CA: 500,
  US: 600,
  GB: 750,
}

export const CURRENCY_SYMBOL: Record<Region, string> = {
  BR: 'R$',
  CA: 'CA$',
  US: '$',
  GB: '£',
}

export const REGION_LABELS: Record<Region, string> = {
  BR: 'Brazil',
  CA: 'Canada',
  US: 'United States',
  GB: 'England',
}

export const TIER_LABELS = [
  '150',
  '200',
  '400',
  '500',
  '1000',
  '2000',
  '4000',
  '6000',
  '8000',
  '10000',
  '12000',
  '12k+',
] as const

export type TierLabel = (typeof TIER_LABELS)[number]

export interface PricingTier {
  label: TierLabel
  maxSeats: number | null // null = Inquire
  prices: Record<Region, number | 'inquire'>
}

export const PRICING_TIERS: PricingTier[] = [
  { label: '150',   maxSeats: 150,   prices: { BR: 120,       CA: 300,       US: 375,       GB: 450       } },
  { label: '200',   maxSeats: 200,   prices: { BR: 160,       CA: 320,       US: 400,       GB: 480       } },
  { label: '400',   maxSeats: 400,   prices: { BR: 320,       CA: 640,       US: 800,       GB: 960       } },
  { label: '500',   maxSeats: 500,   prices: { BR: 400,       CA: 800,       US: 1000,      GB: 1200      } },
  { label: '1000',  maxSeats: 1000,  prices: { BR: 600,       CA: 1200,      US: 1500,      GB: 1800      } },
  { label: '2000',  maxSeats: 2000,  prices: { BR: 800,       CA: 1600,      US: 2000,      GB: 2400      } },
  { label: '4000',  maxSeats: 4000,  prices: { BR: 1200,      CA: 2400,      US: 3000,      GB: 3600      } },
  { label: '6000',  maxSeats: 6000,  prices: { BR: 1500,      CA: 3000,      US: 3750,      GB: 4500      } },
  { label: '8000',  maxSeats: 8000,  prices: { BR: 1800,      CA: 3600,      US: 4500,      GB: 5400      } },
  { label: '10000', maxSeats: 10000, prices: { BR: 2200,      CA: 4400,      US: 5500,      GB: 6600      } },
  { label: '12000', maxSeats: 12000, prices: { BR: 2600,      CA: 5200,      US: 6500,      GB: 7800      } },
  { label: '12k+',  maxSeats: null,  prices: { BR: 'inquire', CA: 'inquire', US: 'inquire', GB: 'inquire' } },
]

/** Get monthly price for a given subscriber count and region. Returns 'inquire' if > 12000. */
export function getPriceForTier(subscriberCount: number, region: Region): number | 'inquire' {
  const tier = PRICING_TIERS.find((t) => t.maxSeats !== null && subscriberCount <= t.maxSeats)
  if (!tier) return 'inquire'
  return tier.prices[region]
}

/** Get monthly price by exact tier label and region. */
export function getPriceByLabel(tierLabel: string, region: Region): number | 'inquire' {
  const tier = PRICING_TIERS.find((t) => t.label === tierLabel)
  if (!tier) return 'inquire'
  return tier.prices[region]
}

/** Get installation fee for a region. */
export function getInstallationFee(region: Region): number {
  return INSTALLATION_FEES[region]
}

/** Format a price with the appropriate currency symbol. */
export function formatPrice(amount: number | 'inquire', region: Region): string {
  if (amount === 'inquire') return 'Inquire'
  const symbol = CURRENCY_SYMBOL[region]
  return `${symbol}\u00A0${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

// ── Brazil pricing table (kept for backwards compatibility) ───────────────────

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
