/** Verify reCAPTCHA v3 token when RECAPTCHA_SECRET_KEY is configured. */
export async function verifyRecaptcha(token: string | undefined, action = 'register_submit'): Promise<boolean> {
  const secret = process.env.RECAPTCHA_SECRET_KEY
  if (!secret) return true

  if (!token?.trim()) return false

  try {
    const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token }),
    })
    const data = await res.json() as {
      success?: boolean
      score?: number
      action?: string
    }
    if (!data.success) return false
    if (data.action && data.action !== action) return false
    return (data.score ?? 1) >= 0.5
  } catch (err) {
    console.error('[recaptcha] verification failed:', err)
    return false
  }
}
