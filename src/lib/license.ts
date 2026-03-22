import { randomBytes } from 'crypto'
import { LicenseStatus } from '@prisma/client'

/**
 * Generate a license key in the format: TW-XXXXXX-XXXXXX-XXXXXX-XXXXXX
 * Uses cryptographically secure random bytes, uppercase alphanumeric.
 */
export function generateLicenseKey(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const segment = (len: number) => {
    const bytes = randomBytes(len)
    return Array.from(bytes)
      .map((b) => chars[b % chars.length])
      .join('')
  }
  return `TW-${segment(6)}-${segment(6)}-${segment(6)}-${segment(6)}`
}

/**
 * Resolve the effective status of a license, accounting for expiry.
 */
export function resolveStatus(
  status: LicenseStatus,
  expiresAt: Date | null
): LicenseStatus {
  if (status === LicenseStatus.ACTIVE && expiresAt && expiresAt < new Date()) {
    return LicenseStatus.EXPIRED
  }
  return status
}

/**
 * Check if a license is usable (active + not expired + has available seats).
 */
export function isLicenseUsable(
  status: LicenseStatus,
  expiresAt: Date | null,
  activationCount: number,
  maxSeats: number
): { ok: boolean; reason?: string } {
  const effective = resolveStatus(status, expiresAt)

  if (effective === LicenseStatus.REVOKED) {
    return { ok: false, reason: 'License has been revoked.' }
  }
  if (effective === LicenseStatus.SUSPENDED) {
    return { ok: false, reason: 'License is suspended.' }
  }
  if (effective === LicenseStatus.EXPIRED) {
    return { ok: false, reason: 'License has expired.' }
  }
  if (activationCount >= maxSeats) {
    return { ok: false, reason: `Seat limit reached (${maxSeats}/${maxSeats}).` }
  }

  return { ok: true }
}
