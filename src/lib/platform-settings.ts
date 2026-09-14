import { prisma } from '@/lib/prisma'
import { sanitizeProviderContractTerms } from '@/lib/contract-variables'

const DEFAULT_ID = 'default'

export async function getProviderTerms(): Promise<Record<string, string>> {
  const row = await prisma.platformSettings.findUnique({
    where: { id: DEFAULT_ID },
    select: { providerTerms: true },
  })
  return sanitizeProviderContractTerms(row?.providerTerms)
}

export async function saveProviderTerms(raw: unknown): Promise<Record<string, string>> {
  const providerTerms = sanitizeProviderContractTerms(raw)
  await prisma.platformSettings.upsert({
    where: { id: DEFAULT_ID },
    create: { id: DEFAULT_ID, providerTerms },
    update: { providerTerms },
  })
  return providerTerms
}
