export function turbowarePortalLoginUrl(requestOrigin: string): string {
  const base = (
    process.env.TURBOWARE_APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    requestOrigin
  ).replace(/\/$/, '')
  return `${base}/client/login`
}
