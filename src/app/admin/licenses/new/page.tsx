import { prisma } from '@/lib/prisma'
import { NewLicenseForm } from './NewLicenseForm'

export const dynamic = 'force-dynamic'

export default async function NewLicensePage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string }>
}) {
  const { clientId } = await searchParams
  const clients = await prisma.client.findMany({
    select: { id: true, name: true, company: true },
    orderBy: { name: 'asc' },
  })

  return <NewLicenseForm clients={clients} defaultClientId={clientId || ''} />
}
