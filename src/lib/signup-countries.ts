export type SignupCountryCode = 'BR' | 'US' | 'CA'

export const SIGNUP_COUNTRIES: Array<{
  code: SignupCountryCode
  name: string
  currency: string
}> = [
  { code: 'BR', name: 'Brazil', currency: 'BRL' },
  { code: 'US', name: 'United States', currency: 'USD' },
  { code: 'CA', name: 'Canada', currency: 'CAD' },
]

export function defaultCurrencyForCountry(code: SignupCountryCode): string {
  return SIGNUP_COUNTRIES.find((c) => c.code === code)?.currency ?? 'USD'
}

export function regionForCountry(code: string): 'BR' | 'US' | 'CA' | 'GB' {
  if (code === 'BR') return 'BR'
  if (code === 'CA') return 'CA'
  if (code === 'GB') return 'GB'
  return 'US'
}
