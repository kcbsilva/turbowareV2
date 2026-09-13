import { prisma } from '@/lib/prisma'

export async function listContractTemplates() {
  return prisma.contractTemplate.findMany({
    orderBy: { name: 'asc' },
  })
}

export async function createContractTemplate(opts: {
  name: string
  title: string
  notes?: string
}) {
  const name = opts.name.trim()
  const title = opts.title.trim()
  if (!name || !title) return { error: 'Name and contract title are required', status: 400 as const }

  const template = await prisma.contractTemplate.create({
    data: {
      name,
      title,
      notes: opts.notes?.trim() || null,
    },
  })
  return { template }
}

export async function updateContractTemplate(
  id: string,
  opts: { name?: string; title?: string; notes?: string | null },
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
