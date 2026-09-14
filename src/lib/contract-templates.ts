import { prisma } from '@/lib/prisma'
import {
  TURBOISP_MSA_BODY,
  TURBOISP_MSA_NOTES,
  TURBOISP_MSA_TEMPLATE_NAME,
  TURBOISP_MSA_TITLE,
} from '@/lib/turboisp-msa-template'

export async function ensureDefaultContractTemplates() {
  const existing = await prisma.contractTemplate.findFirst({
    where: { name: TURBOISP_MSA_TEMPLATE_NAME },
    select: { id: true },
  })
  if (existing) return
  await prisma.contractTemplate.create({
    data: {
      name: TURBOISP_MSA_TEMPLATE_NAME,
      title: TURBOISP_MSA_TITLE,
      notes: TURBOISP_MSA_NOTES,
      body: TURBOISP_MSA_BODY,
    },
  })
}

function emptyToNull(html?: string | null) {
  if (!html) return null
  const compact = html.replace(/<p><\/p>/gi, '').replace(/<br\s*\/?>/gi, '').replace(/\s/g, '')
  return compact ? html : null
}

export async function listContractTemplates() {
  await ensureDefaultContractTemplates()
  return prisma.contractTemplate.findMany({
    orderBy: { name: 'asc' },
  })
}

export async function createContractTemplate(opts: {
  name: string
  title: string
  notes?: string
  body?: string
}) {
  const name = opts.name.trim()
  const title = opts.title.trim()
  if (!name || !title) return { error: 'Name and contract title are required', status: 400 as const }

  const template = await prisma.contractTemplate.create({
    data: {
      name,
      title,
      notes: opts.notes?.trim() || null,
      body: emptyToNull(opts.body),
    },
  })
  return { template }
}

export async function updateContractTemplate(
  id: string,
  opts: { name?: string; title?: string; notes?: string | null; body?: string | null },
) {
  const existing = await prisma.contractTemplate.findUnique({ where: { id } })
  if (!existing) return { error: 'Not found', status: 404 as const }

  const name = opts.name !== undefined ? opts.name.trim() : existing.name
  const title = opts.title !== undefined ? opts.title.trim() : existing.title
  if (!name || !title) return { error: 'Name and contract title are required', status: 400 as const }

  const template = await prisma.contractTemplate.update({
    where: { id },
    data: {
      name,
      title,
      notes: opts.notes === undefined ? existing.notes : opts.notes?.trim() || null,
      body: opts.body === undefined ? existing.body : emptyToNull(opts.body ?? ''),
    },
  })
  return { template }
}

export async function deleteContractTemplate(id: string) {
  const existing = await prisma.contractTemplate.findUnique({ where: { id } })
  if (!existing) return { error: 'Not found', status: 404 as const }
  await prisma.contractTemplate.delete({ where: { id } })
  return { ok: true as const }
}
