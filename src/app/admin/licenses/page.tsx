import { prisma } from '@/lib/prisma'
import { LicenseStatus } from '@prisma/client'
import { resolveStatus } from '@/lib/license'
import { LicensesScreen } from './LicensesScreen'

export const dynamic = 'force-dynamic'

export default async function LicensesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string }>
}) {
  const { status, search } = await searchParams
  const validStatus = Object.values(LicenseStatus).includes(status as LicenseStatus)
    ? (status as LicenseStatus)
    : undefined

  const licenses = await prisma.license.findMany({
    where: {
      ...(validStatus ? { status: validStatus } : {}),
      ...(search
        ? {
            OR: [
              { key: { contains: search, mode: 'insensitive' } },
              { product: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    include: { _count: { select: { activations: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <LicensesScreen
      search={search}
      status={status}
      licenses={licenses.map((license) => ({
        id: license.id,
        key: license.key,
        product: license.product,
        status: resolveStatus(license.status, license.expiresAt),
        activations: license._count.activations,
        maxSeats: license.maxSeats,
        expiresAt: license.expiresAt ? license.expiresAt.toISOString() : null,
        createdAt: license.createdAt.toISOString(),
      }))}
    />
  )
}
