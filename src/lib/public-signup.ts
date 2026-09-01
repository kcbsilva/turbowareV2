/**
 * Public self-serve TurboISP tenant creation from the marketing site.
 * Flip to true (and set PUBLIC_SIGNUP_ENABLED=true if you use the env gate) to restore.
 */
export const PUBLIC_TENANT_SIGNUP_ENABLED = false

export const TURBOISP_SALES_EMAIL = 'sales@turboisp.com'
export const TURBOISP_SALES_MAILTO = `mailto:${TURBOISP_SALES_EMAIL}`

export function isPublicSignupEnabled(): boolean {
  if (!PUBLIC_TENANT_SIGNUP_ENABLED) return false
  const v = (process.env.PUBLIC_SIGNUP_ENABLED ?? '').trim().toLowerCase()
  return v === '' || v === '1' || v === 'true' || v === 'yes'
}
