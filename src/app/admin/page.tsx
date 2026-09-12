import { prisma } from '@/lib/prisma'
import { AdminDashboard, type DashboardData } from '@/components/admin/AdminDashboard'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Admin',
}

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

async function getDashboard(): Promise<DashboardData> {
  const [clients, openTickets, pendingInvoices, activeLicenses] = await Promise.all([
    prisma.client.findMany({
      select: {
        id: true,
        name: true,
        company: true,
        email: true,
        createdAt: true,
        _count: { select: { licenses: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.supportTicket.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
    prisma.invoice.count({ where: { status: 'PENDING' } }),
    prisma.license.count({ where: { status: 'ACTIVE' } }),
  ])

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const total = clients.length
  const withLicense = clients.filter((c) => c._count.licenses > 0).length
  const newThisMonth = clients.filter((c) => new Date(c.createdAt) >= startOfMonth).length
  const coverage = total === 0 ? 0 : Math.round((withLicense / total) * 100)

  const signups: { label: string; value: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = monthKey(d)
    const value = clients.filter((c) => monthKey(new Date(c.createdAt)) === key).length
    signups.push({
      label: d.toLocaleString('en', { month: 'short' }),
      value,
    })
  }

  return {
    total,
    withLicense,
    newThisMonth,
    openTickets,
    pendingInvoices,
    activeLicenses,
    coverage,
    signups,
    recent: clients.slice(0, 8).map((c) => ({
      id: c.id,
      name: c.name,
      subtitle: c.company || c.email || '—',
      licenses: c._count.licenses,
      createdAt: c.createdAt.toISOString(),
    })),
  }
}

export default async function DashboardPage() {
  const data = await getDashboard()
  return <AdminDashboard data={data} />
}
