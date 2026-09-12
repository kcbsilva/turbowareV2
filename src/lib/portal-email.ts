export function normalizePortalEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function isLikelyEmail(email: string): boolean {
  const v = normalizePortalEmail(email)
  return v.includes('@') && v.includes('.') && !v.includes(' ')
}
