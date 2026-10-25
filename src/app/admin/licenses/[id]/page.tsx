import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { resolveStatus } from '@/lib/license'
import { LicenseDetail } from './LicenseActions'

export const dynamic = 'force-dynamic'

export default async function LicenseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [license, clients] = await Promise.all([
    prisma.license.findUnique({
      where: { id },
      include: {
        activations: { orderBy: { activatedAt: 'desc' } },
        client: { select: { id: true, name: true } },
      },
    }),
    prisma.client.findMany({
      select: { id: true, name: true, company: true },
      orderBy: { name: 'asc' },
    }),
  ])

  if (!license) notFound()

  const effective = resolveStatus(license.status, license.expiresAt)

  return (
    <LicenseDetail
      effective={effective}
      clients={clients}
      license={{
        id: license.id,
        key: license.key,
        product: license.product,
        status: license.status,
        notes: license.notes,
        maxSeats: license.maxSeats,
        expiresAt: license.expiresAt ? license.expiresAt.toISOString() : null,
        createdAt: license.createdAt.toISOString(),
        clientId: license.clientId,
        client: license.client,
        activations: license.activations.map((activation) => ({
          id: activation.id,
          hardwareId: activation.hardwareId,
          label: activation.label,
          activatedAt: activation.activatedAt.toISOString(),
          lastSeenAt: activation.lastSeenAt.toISOString(),
        })),
      }}
    />
  )
}
