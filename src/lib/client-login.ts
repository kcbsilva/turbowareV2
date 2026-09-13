import type { Prisma } from '@prisma/client'

export function loginIdentifierFromBody(body: {
  identifier?: string
  email?: string
  cnpj?: string
}): string {
  return (body.identifier ?? body.email ?? body.cnpj ?? '').trim()
}

export function looksLikeEmail(raw: string): boolean {
  const value = raw.trim()
  return value.includes('@') && !value.includes(' ')
}

/** CNPJ mask while typing digits; emails and lettered business numbers stay as typed. */
export function formatLoginIdentifierInput(value: string): string {
  if (looksLikeEmail(value) || /[a-zA-Z]/.test(value)) return value
  const digits = value.replace(/\D/g, '').slice(0, 14)
  return digits
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
}

export function clientLoginWhere(identifier: string): Prisma.ClientWhereInput | null {
  const raw = identifier.trim()
  if (!raw) return null

  if (looksLikeEmail(raw)) {
    return { email: { equals: raw, mode: 'insensitive' } }
  }

  const digits = raw.replace(/\D/g, '')
  const or: Prisma.ClientWhereInput[] = [{ cnpj: raw }]
  if (digits) or.push({ cnpj: digits })
  return { OR: or }
}
