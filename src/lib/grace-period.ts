export const MIN_GRACE_DAYS = 1
export const MAX_CLIENT_GRACE_DAYS = 14
export const MAX_ADMIN_GRACE_DAYS = 90
export const DEFAULT_GRACE_DAYS = 3

const DAY_MS = 86_400_000

export type GracePeriodInput = {
  days?: unknown
  until?: unknown
}

function asPositiveInt(value: unknown): number | null {
  if (typeof value === 'number' && Number.isInteger(value)) return value
  if (typeof value === 'string' && /^\d+$/.test(value.trim())) return Number(value.trim())
  return null
}

/** End of the UTC calendar day for a YYYY-MM-DD value. */
export function parseGraceUntilDate(raw: unknown): Date | null {
  if (typeof raw !== 'string') return null
  const v = raw.trim()
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return null
  const [year, month, day] = v.split('-').map(Number)
  const ends = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999))
  if (
    ends.getUTCFullYear() !== year ||
    ends.getUTCMonth() !== month - 1 ||
    ends.getUTCDate() !== day
  ) {
    return null
  }
  return ends
}

function later(a: Date, b: Date | null | undefined): Date {
  if (!b) return a
  return b.getTime() > a.getTime() ? b : a
}

/**
 * Resolve a grace end timestamp from extra days (added on top of now or the
 * current live grace) or an absolute calendar date.
 */
export function resolveGracePeriodEnd(opts: {
  input: GracePeriodInput
  now?: Date
  currentEndsAt?: Date | null
  maxDays: number
  defaultDays?: number
}): { ok: true; endsAt: Date; days: number } | { ok: false; error: string } {
  const now = opts.now ?? new Date()
  const maxDays = opts.maxDays
  const untilRaw = opts.input.until
  const hasUntil = untilRaw !== undefined && untilRaw !== null && String(untilRaw).trim() !== ''

  if (hasUntil) {
    const endsAt = parseGraceUntilDate(untilRaw)
    if (!endsAt) return { ok: false, error: 'Pick a valid date on the calendar.' }
    if (endsAt.getTime() <= now.getTime()) {
      return { ok: false, error: 'The grace date must be in the future.' }
    }
    const spanDays = Math.ceil((endsAt.getTime() - now.getTime()) / DAY_MS)
    if (spanDays > maxDays) {
      return { ok: false, error: `Grace cannot extend more than ${maxDays} days.` }
    }
    return { ok: true, endsAt, days: spanDays }
  }

  const parsedDays = asPositiveInt(opts.input.days)
  const days =
    parsedDays === null && opts.input.days === undefined
      ? (opts.defaultDays ?? DEFAULT_GRACE_DAYS)
      : parsedDays
  if (days === null || days < MIN_GRACE_DAYS || days > maxDays) {
    return {
      ok: false,
      error: `Enter between ${MIN_GRACE_DAYS} and ${maxDays} extra days.`,
    }
  }

  const from = later(now, opts.currentEndsAt && opts.currentEndsAt.getTime() > now.getTime()
    ? opts.currentEndsAt
    : null)
  const endsAt = new Date(from.getTime() + days * DAY_MS)
  return { ok: true, endsAt, days }
}

export function toDateInputValue(d: Date): string {
  return d.toISOString().slice(0, 10)
}
