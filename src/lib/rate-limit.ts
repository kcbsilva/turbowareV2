interface RateLimiterOptions {
  max: number       // max requests per window
  windowMs: number  // window size in ms
}

interface Entry {
  count: number
  resetAt: number
}

export class RateLimiter {
  private store = new Map<string, Entry>()
  private max: number
  private windowMs: number

  constructor({ max, windowMs }: RateLimiterOptions) {
    this.max = max
    this.windowMs = windowMs
  }

  /** Returns true if the request is allowed, false if rate-limited. */
  check(ip: string): boolean {
    const now = Date.now()
    const entry = this.store.get(ip)

    if (!entry || now >= entry.resetAt) {
      this.store.set(ip, { count: 1, resetAt: now + this.windowMs })
      return true
    }

    if (entry.count >= this.max) return false

    entry.count++
    return true
  }
}

/** Shared instance for login endpoints: 5 attempts per 15 minutes per IP. */
export const loginRateLimiter = new RateLimiter({ max: 5, windowMs: 15 * 60 * 1000 })
