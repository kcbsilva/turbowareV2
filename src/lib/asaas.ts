/**
 * Asaas payment gateway client.
 * Supports Pix, Boleto, and credit card via Asaas hosted payment page.
 * https://docs.asaas.com
 */
import axios from 'axios'
import { prisma } from '@/lib/prisma'

// ── Config ────────────────────────────────────────────────────────────────────

function asaasBaseUrl(): string {
  const sandbox = process.env.ASAAS_SANDBOX !== 'false'
  return sandbox
    ? 'https://sandbox.asaas.com/api/v3'
    : 'https://api.asaas.com/v3'
}

function asaasClient() {
  const apiKey = process.env.ASAAS_API_KEY
  if (!apiKey) throw new Error('ASAAS_API_KEY is not set')

  return axios.create({
    baseURL: asaasBaseUrl(),
    headers: {
      'access_token': apiKey,
      'Content-Type': 'application/json',
    },
    timeout: 15_000,
  })
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AsaasCharge {
  id:           string
  status:       string      // PENDING, RECEIVED, CONFIRMED, OVERDUE, etc.
  invoiceUrl:   string      // Asaas-hosted payment page (Pix / Boleto / CC)
  bankSlipUrl:  string | null
  dueDate:      string      // YYYY-MM-DD
  value:        number
  billingType:  string
  pixQrCode?:   string      // base64 QR code image (only for PIX billingType)
  pixKey?:      string      // Pix copia-e-cola key
}

interface AsaasCustomer {
  id:   string
  name: string
}

// ── Customer ──────────────────────────────────────────────────────────────────

/**
 * Creates or retrieves the Asaas customer for a Client.
 * Caches the Asaas customer ID on the Client record to avoid duplicates.
 */
export async function createAsaasCustomer(client: {
  id:    string
  name:  string
  cnpj:  string | null
  email: string | null
  phone: string | null
  asaasCustomerId: string | null
}): Promise<string> {
  // Already synced — return cached ID
  if (client.asaasCustomerId) return client.asaasCustomerId

  const http = asaasClient()

  // If we have a CNPJ, check if a customer already exists in Asaas
  if (client.cnpj) {
    try {
      const search = await http.get<{ data: AsaasCustomer[] }>('/customers', {
        params: { cpfCnpj: client.cnpj.replace(/\D/g, '') },
      })
      const existing = search.data.data?.[0]
      if (existing) {
        await prisma.client.update({
          where: { id: client.id },
          data:  { asaasCustomerId: existing.id },
        })
        return existing.id
      }
    } catch {
      // If the lookup fails, fall through and create a new customer
    }
  }

  // Create new customer
  const res = await http.post<AsaasCustomer>('/customers', {
    name:     client.name,
    cpfCnpj:  client.cnpj ? client.cnpj.replace(/\D/g, '') : undefined,
    email:    client.email   || undefined,
    phone:    client.phone   || undefined,
    groupName: 'TurboISP',
  })

  const customerId = res.data.id

  await prisma.client.update({
    where: { id: client.id },
    data:  { asaasCustomerId: customerId },
  })

  return customerId
}

// ── Charge ────────────────────────────────────────────────────────────────────

/**
 * Creates an Asaas charge for an invoice.
 * Uses billingType UNDEFINED so the customer can choose Pix, Boleto, or CC
 * on the Asaas-hosted payment page.
 *
 * @returns charge details including the payment URL
 */
export async function createAsaasCharge(
  invoice: {
    id:      string
    amount:  number
    dueDate: Date
    type:    string
    notes:   string | null
  },
  client: {
    id:    string
    name:  string
    cnpj:  string | null
    email: string | null
    phone: string | null
    asaasCustomerId: string | null
  },
): Promise<AsaasCharge> {
  const customerId = await createAsaasCustomer(client)
  const http       = asaasClient()

  // Format due date as YYYY-MM-DD (Brazil time)
  const due = invoice.dueDate
  const dueStr = `${due.getFullYear()}-${String(due.getMonth() + 1).padStart(2, '0')}-${String(due.getDate()).padStart(2, '0')}`

  const description = invoice.notes
    ? `TurboISP — ${invoice.notes}`
    : `TurboISP — ${invoice.type}`

  const res = await http.post<AsaasCharge>('/payments', {
    customer:          customerId,
    billingType:       'UNDEFINED', // lets client choose Pix / Boleto / CC
    value:             invoice.amount,
    dueDate:           dueStr,
    description,
    externalReference: invoice.id,  // our invoice ID for reconciliation
    postalService:     false,
  })

  return res.data
}

// ── Status ────────────────────────────────────────────────────────────────────

/**
 * Fetches the current status of an Asaas payment by its ID.
 */
export async function getAsaasPaymentStatus(paymentId: string): Promise<AsaasCharge> {
  const res = await asaasClient().get<AsaasCharge>(`/payments/${paymentId}`)
  return res.data
}
