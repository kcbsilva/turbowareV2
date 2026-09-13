export const CONTRACT_VARIABLES = [
  { key: 'client.name', labelKey: 'vars.client.name' },
  { key: 'client.company', labelKey: 'vars.client.company' },
  { key: 'client.email', labelKey: 'vars.client.email' },
  { key: 'client.phone', labelKey: 'vars.client.phone' },
  { key: 'client.cnpj', labelKey: 'vars.client.cnpj' },
  { key: 'client.subdomain', labelKey: 'vars.client.subdomain' },
  { key: 'contract.title', labelKey: 'vars.contract.title' },
  { key: 'contract.number', labelKey: 'vars.contract.number' },
  { key: 'contract.startsAt', labelKey: 'vars.contract.startsAt' },
  { key: 'today', labelKey: 'vars.today' },
] as const

export type ContractVariableKey = (typeof CONTRACT_VARIABLES)[number]['key']

export function tokenFor(key: string) {
  return `{{${key}}}`
}

export function interpolateContractText(text: string, values: Record<string, string>): string {
  return text.replace(/\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g, (match, key: string) => {
    if (!Object.prototype.hasOwnProperty.call(values, key)) return match
    const value = values[key]?.trim()
    return value ? value : '—'
  })
}

export function contractVariableValues(opts: {
  client: {
    name?: string | null
    company?: string | null
    email?: string | null
    phone?: string | null
    cnpj?: string | null
    subdomain?: string | null
  }
  contract: {
    title?: string | null
    number?: string | null
    startsAt?: string | Date | null
  }
  today?: Date
}): Record<string, string> {
  const today = opts.today ?? new Date()
  return {
    'client.name': opts.client.name ?? '',
    'client.company': opts.client.company ?? '',
    'client.email': opts.client.email ?? '',
    'client.phone': opts.client.phone ?? '',
    'client.cnpj': opts.client.cnpj ?? '',
    'client.subdomain': opts.client.subdomain ?? '',
    'contract.title': opts.contract.title ?? '',
    'contract.number': opts.contract.number ?? '',
    'contract.startsAt': formatDay(opts.contract.startsAt),
    today: formatDay(today),
  }
}

function formatDay(value?: string | Date | null): string {
  if (!value) return ''
  const d = typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T12:00:00.000Z`)
    : new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}

export function sanitizeContractHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/<object[\s\S]*?<\/object>/gi, '')
    .replace(/\son\w+="[^"]*"/gi, '')
    .replace(/\son\w+='[^']*'/gi, '')
}

