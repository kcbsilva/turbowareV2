import { ContractStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { contractVariableValues, interpolateContractText, sanitizeContractHtml } from '@/lib/contract-variables'

export function formatContractNumber(id: string, createdAt?: string | Date | null): string {
  const suffix = id.replace(/[^a-zA-Z0-9]/g, '').slice(-6).toUpperCase() || 'XXXXXX'
  if (!createdAt) return `CTR-${suffix}`
  const d = new Date(createdAt)
  if (Number.isNaN(d.getTime())) return `CTR-${suffix}`
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  return `CTR-${y}${m}-${suffix}`
}

const LICENSE_INCLUDE = {
  product: { select: { id: true, name: true, slug: true, logoEmoji: true } },
  tier: { select: { id: true, name: true } },
} as const

export async function listClientContracts(clientId: string) {
  const [client, contracts] = await Promise.all([
    prisma.client.findUnique({
      where: { id: clientId },
      select: { subdomain: true },
    }),
    prisma.contract.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
      include: {
        licenses: {
          orderBy: { createdAt: 'desc' },
          include: LICENSE_INCLUDE,
        },
      },
    }),
  ])

  return {
    defaultSlug: client?.subdomain ?? null,
    contracts: contracts.map((c) => ({
      id: c.id,
      number: c.number,
      title: c.title,
      status: c.status,
      startsAt: c.startsAt,
      endsAt: c.endsAt,
      notes: c.notes,
      body: c.body,
      createdAt: c.createdAt,
      licenses: c.licenses.map((row) => ({
        id: row.id,
        productId: row.productId,
        status: row.status,
        tierId: row.tierId,
        tenantSlug: row.tenantSlug,
        expiresAt: row.expiresAt,
        activatedAt: row.activatedAt,
        product: row.product,
        tier: row.tier,
      })),
    })),
  }
}

export async function createContract(opts: {
  clientId: string
  title?: string
  startsAt?: string
  notes?: string
  body?: string
  templateId?: string
}) {
  let title = opts.title?.trim() ?? ''
  let notes = opts.notes?.trim() || undefined
  let body = opts.body

  const client = await prisma.client.findUnique({
    where: { id: opts.clientId },
    select: {
      id: true,
      name: true,
      company: true,
      email: true,
      phone: true,
      cnpj: true,
      subdomain: true,
    },
  })
  if (!client) return { error: 'Not found', status: 404 as const }

  if (opts.templateId?.trim()) {
    const template = await prisma.contractTemplate.findUnique({
      where: { id: opts.templateId.trim() },
    })
    if (!template) return { error: 'Template not found', status: 400 as const }
    if (!title) title = template.title
    if (notes === undefined && template.notes) notes = template.notes
    if ((body === undefined || !body.trim()) && template.body) body = template.body
  }

  if (!title) return { error: 'Title is required', status: 400 as const }

  let startsAt = new Date()
  if (opts.startsAt?.trim()) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(opts.startsAt.trim())) {
      return { error: 'Start date must be YYYY-MM-DD', status: 400 as const }
    }
    startsAt = new Date(`${opts.startsAt.trim()}T12:00:00.000Z`)
    if (Number.isNaN(startsAt.getTime())) return { error: 'Invalid start date', status: 400 as const }
  }

  const created = await prisma.contract.create({
    data: {
      clientId: opts.clientId,
      title,
      startsAt,
      notes: notes || null,
      body: null,
      number: 'PENDING',
      status: ContractStatus.ACTIVE,
    },
  })

  const number = formatContractNumber(created.id, created.createdAt)
  const values = contractVariableValues({
    client,
    contract: { title, number, startsAt },
  })
  const filledTitle = interpolateContractText(title, values)
  const filledNotes = notes ? interpolateContractText(notes, values) : null
  const filledBodyRaw = body
    ? interpolateContractText(sanitizeContractHtml(body), values)
    : null
  const filledBody = filledBodyRaw && filledBodyRaw.replace(/<p><\/p>/gi, '').replace(/\s/g, '')
    ? filledBodyRaw
    : null

  const contract = await prisma.contract.update({
    where: { id: created.id },
    data: {
      number,
      title: filledTitle,
      notes: filledNotes,
      body: filledBody,
    },
    include: { licenses: { include: LICENSE_INCLUDE } },
  })

  return { contract }
}
