export const CLIENT_CONTRACT_FIELDS = [
  { key: 'customer_legal_name', labelKey: 'vars.customer_legal_name', group: 'party' },
  { key: 'customer_address', labelKey: 'vars.customer_address', group: 'party', multiline: true },
  { key: 'billing_model', labelKey: 'vars.billing_model', group: 'fees' },
  { key: 'currency', labelKey: 'vars.currency', group: 'fees' },
  { key: 'payment_terms_days', labelKey: 'vars.payment_terms_days', group: 'fees' },
  { key: 'fee_increase_cap', labelKey: 'vars.fee_increase_cap', group: 'fees' },
  { key: 'fee_increase_index', labelKey: 'vars.fee_increase_index', group: 'fees' },
  { key: 'sla_uptime_percent', labelKey: 'vars.sla_uptime_percent', group: 'sla' },
  { key: 'sla_credit_cap_percent', labelKey: 'vars.sla_credit_cap_percent', group: 'sla' },
  { key: 'liability_cap_months', labelKey: 'vars.liability_cap_months', group: 'sla' },
  { key: 'governing_law_jurisdiction', labelKey: 'vars.governing_law_jurisdiction', group: 'law' },
  { key: 'dispute_jurisdiction', labelKey: 'vars.dispute_jurisdiction', group: 'law' },
  { key: 'arbitral_institution', labelKey: 'vars.arbitral_institution', group: 'law' },
  { key: 'arbitration_seat', labelKey: 'vars.arbitration_seat', group: 'law' },
  { key: 'signing_place', labelKey: 'vars.signing_place', group: 'law' },
] as const

export const PROVIDER_CONTRACT_FIELDS = [
  { key: 'provider_legal_name', labelKey: 'vars.provider_legal_name' },
  { key: 'provider_jurisdiction', labelKey: 'vars.provider_jurisdiction' },
  { key: 'provider_address', labelKey: 'vars.provider_address', multiline: true },
] as const

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
  { key: 'effective_date', labelKey: 'vars.effective_date' },
  { key: 'today', labelKey: 'vars.today' },
  ...PROVIDER_CONTRACT_FIELDS,
  ...CLIENT_CONTRACT_FIELDS,
  { key: 'signing_place_date', labelKey: 'vars.signing_place_date' },
] as const

export type ContractVariableKey = (typeof CONTRACT_VARIABLES)[number]['key']

export function tokenFor(key: string) {
  return key.includes('.') ? `{{${key}}}` : `{${key}}`
}

export function parseTerms(value: unknown): Record<string, string> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const out: Record<string, string> = {}
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    if (typeof raw === 'string') out[key] = raw
  }
  return out
}

const CLIENT_TERM_KEYS = new Set<string>(CLIENT_CONTRACT_FIELDS.map((field) => field.key))
const PROVIDER_TERM_KEYS = new Set<string>(PROVIDER_CONTRACT_FIELDS.map((field) => field.key))

function pickTerms(raw: unknown, allowed: Set<string>): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [key, value] of Object.entries(parseTerms(raw))) {
    if (!allowed.has(key)) continue
    out[key] = value.slice(0, 4000)
  }
  return out
}

export function sanitizeClientContractTerms(raw: unknown): Record<string, string> {
  return pickTerms(raw, CLIENT_TERM_KEYS)
}

export function sanitizeProviderContractTerms(raw: unknown): Record<string, string> {
  return pickTerms(raw, PROVIDER_TERM_KEYS)
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function interpolateContractText(text: string, values: Record<string, string>): string {
  return text.replace(/\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}|\{([a-zA-Z0-9_]+)\}/g, (match, dotted?: string, snake?: string) => {
    const key = dotted || snake
    if (!key || !Object.prototype.hasOwnProperty.call(values, key)) return match
    const value = values[key]?.trim()
    return value ? escapeHtml(value) : match
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
    contractTerms?: unknown
  }
  providerTerms?: unknown
  contract: {
    title?: string | null
    number?: string | null
    startsAt?: string | Date | null
  }
  today?: Date
}): Record<string, string> {
  const today = opts.today ?? new Date()
  const day = formatDay(today)
  const startsAt = formatDay(opts.contract.startsAt) || day
  const clientTerms = parseTerms(opts.client.contractTerms)
  const providerTerms = parseTerms(opts.providerTerms)
  const legalName = clientTerms.customer_legal_name?.trim()
    || opts.client.company?.trim()
    || opts.client.name?.trim()
    || ''
  const signingPlace = clientTerms.signing_place?.trim() || ''

  return {
    'client.name': opts.client.name ?? '',
    'client.company': opts.client.company ?? '',
    'client.email': opts.client.email ?? '',
    'client.phone': opts.client.phone ?? '',
    'client.cnpj': opts.client.cnpj ?? '',
    'client.subdomain': opts.client.subdomain ?? '',
    'contract.title': opts.contract.title ?? '',
    'contract.number': opts.contract.number ?? '',
    'contract.startsAt': startsAt,
    effective_date: startsAt,
    today: day,
    provider_legal_name: providerTerms.provider_legal_name ?? '',
    provider_jurisdiction: providerTerms.provider_jurisdiction ?? '',
    provider_address: providerTerms.provider_address ?? '',
    customer_legal_name: legalName,
    customer_address: clientTerms.customer_address ?? '',
    billing_model: clientTerms.billing_model ?? '',
    currency: clientTerms.currency ?? '',
    payment_terms_days: clientTerms.payment_terms_days ?? '',
    fee_increase_cap: clientTerms.fee_increase_cap ?? '',
    fee_increase_index: clientTerms.fee_increase_index ?? '',
    sla_uptime_percent: clientTerms.sla_uptime_percent ?? '',
    sla_credit_cap_percent: clientTerms.sla_credit_cap_percent ?? '',
    liability_cap_months: clientTerms.liability_cap_months ?? '',
    governing_law_jurisdiction: clientTerms.governing_law_jurisdiction ?? '',
    dispute_jurisdiction: clientTerms.dispute_jurisdiction ?? '',
    arbitral_institution: clientTerms.arbitral_institution ?? '',
    arbitration_seat: clientTerms.arbitration_seat ?? '',
    signing_place: signingPlace,
    signing_place_date: signingPlace ? `${signingPlace}, ${day}` : day,
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
