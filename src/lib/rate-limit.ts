import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

interface RateLimiterOptions {
  namespace?: string
  max: number
  windowMs: number
}

export class RateLimiter {
  private namespace: string
  private max: number
  private windowMs: number

  constructor({ namespace, max, windowMs }: RateLimiterOptions) {
    this.namespace = namespace ?? 'default'
    this.max = max
    this.windowMs = windowMs
  }

  /** Atomic, shared rate limit backed by PostgreSQL for serverless/multi-instance deployments. */
  async check(subject: string): Promise<boolean> {
    const key = `${this.namespace}:${subject}`.slice(0, 500)
    const rows = await prisma.$queryRaw<Array<{ allowed: boolean }>>`
      WITH cleanup AS (
        DELETE FROM "turboware"."rate_limit_buckets"
        WHERE "reset_at" < NOW() - INTERVAL '1 day'
      ),
      updated AS (
        INSERT INTO "turboware"."rate_limit_buckets" ("key", "count", "reset_at")
        VALUES (${key}, 1, NOW() + (${this.windowMs} * INTERVAL '1 millisecond'))
        ON CONFLICT ("key") DO UPDATE SET
          "count" = CASE
            WHEN "turboware"."rate_limit_buckets"."reset_at" <= NOW() THEN 1
            ELSE "turboware"."rate_limit_buckets"."count" + 1
          END,
          "reset_at" = CASE
            WHEN "turboware"."rate_limit_buckets"."reset_at" <= NOW()
              THEN NOW() + (${this.windowMs} * INTERVAL '1 millisecond')
            ELSE "turboware"."rate_limit_buckets"."reset_at"
          END
        RETURNING "count"
      )
      SELECT ("count" <= ${this.max}) AS "allowed" FROM updated
    `
    return rows[0]?.allowed === true
  }
}

export function clientIP(req: Pick<NextRequest, 'headers'>): string {
  const trustProxy = process.env.VERCEL === '1' || process.env.TRUST_PROXY === 'true'
  if (trustProxy) {
    const forwarded =
      req.headers.get('x-vercel-forwarded-for') ??
      req.headers.get('x-forwarded-for')
    const first = forwarded?.split(',')[0]?.trim()
    if (first) return first

    return req.headers.get('x-real-ip')?.trim() || 'unknown'
  }

  return 'unknown'
}

/** Shared across admin/client login and MFA: 5 attempts per 15 minutes per IP. */
export const loginRateLimiter = new RateLimiter({
  namespace: 'login',
  max: 5,
  windowMs: 15 * 60 * 1000,
})

/** Password recovery: 3 requests per 15 minutes per subject. */
export const forgotPasswordRateLimiter = new RateLimiter({
  namespace: 'password-reset',
  max: 3,
  windowMs: 15 * 60 * 1000,
})
