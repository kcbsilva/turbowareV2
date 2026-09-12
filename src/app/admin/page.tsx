import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import {
  Activity,
  KeyRound,
  Ticket,
  TrendingUp,
  UserPlus,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Admin',
}

async function getStats() {
  const [clients, openTickets, pendingInvoices, activeLicenses] = await Promise.all([
    prisma.client.findMany({
      select: {
        id: true,
        name: true,
        company: true,
        email: true,
        cnpj: true,
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
  const recent = clients.slice(0, 8)
  const coverage = total === 0 ? 0 : Math.round((withLicense / total) * 100)

  return {
    total,
    withLicense,
    newThisMonth,
    recent,
    openTickets,
    pendingInvoices,
    activeLicenses,
    coverage,
  }
}

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone,
}: {
  label: string
  value: number
  hint: string
  icon: LucideIcon
  tone: 'blue' | 'green' | 'orange' | 'purple'
}) {
  const tones = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    green: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
    orange: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-4 flex items-center justify-between">
        <div className={`rounded-lg p-2 ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <TrendingUp className="h-4 w-4 text-emerald-500" />
      </div>
      <h3 className="mb-1 font-medium text-gray-600 dark:text-gray-400">{label}</h3>
      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{hint}</p>
    </div>
  )
}

export default async function DashboardPage() {
  const {
    total,
    withLicense,
    newThisMonth,
    recent,
    openTickets,
    pendingInvoices,
    activeLicenses,
    coverage,
  } = await getStats()

  return (
    <div className="p-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">Tenants, licenses, and support at a glance</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/tickets"
            className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            Tickets{openTickets > 0 ? ` (${openTickets})` : ''}
          </Link>
          <Link
            href="/admin/clients/new"
            className="rounded-md px-3 py-1.5 text-xs font-semibold"
            style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}
          >
            Set up tenant
          </Link>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Clients"
          value={total}
          hint={`${newThisMonth} new this month`}
          icon={Users}
          tone="blue"
        />
        <StatCard
          label="With Licenses"
          value={withLicense}
          hint={`${activeLicenses} active licenses`}
          icon={KeyRound}
          tone="green"
        />
        <StatCard
          label="Open Tickets"
          value={openTickets}
          hint="Open and in progress"
          icon={Ticket}
          tone="orange"
        />
        <StatCard
          label="Pending Invoices"
          value={pendingInvoices}
          hint="Awaiting payment"
          icon={Activity}
          tone="purple"
        />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent clients</h3>
              <Link
                href="/admin/clients"
                className="text-sm font-medium text-[#c47a00] hover:opacity-80 dark:text-[#fca311]"
              >
                View all
              </Link>
            </div>
            {recent.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                No clients yet. They&apos;ll appear here once they register.
              </div>
            ) : (
              <div className="space-y-1">
                {recent.map((c) => (
                  <Link
                    key={c.id}
                    href={`/admin/clients/${c.id}`}
                    className="flex items-center gap-4 rounded-lg p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <div className="grid size-9 shrink-0 place-content-center rounded-full bg-[#fca311]/15 text-xs font-bold text-[#c47a00] dark:text-[#fca311]">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">{c.name}</p>
                      <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                        {c.company || c.email || '—'}
                      </p>
                    </div>
                    <div className="hidden items-center gap-1.5 text-xs text-gray-500 md:flex dark:text-gray-400">
                      <KeyRound className="h-3 w-3" />
                      <span>
                        {c._count.licenses} {c._count.licenses === 1 ? 'license' : 'licenses'}
                      </span>
                    </div>
                    <p className="hidden text-xs text-gray-400 lg:block dark:text-gray-500">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">Coverage</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Licensed clients</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{coverage}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                <div className="h-2 rounded-full bg-[#fca311]" style={{ width: `${coverage}%` }} />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Open tickets</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{openTickets}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className="h-2 rounded-full bg-orange-500"
                  style={{ width: `${Math.min(100, openTickets * 10)}%` }}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">New this month</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{newThisMonth}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className="h-2 rounded-full bg-emerald-500"
                  style={{ width: `${total === 0 ? 0 : Math.min(100, Math.round((newThisMonth / total) * 100))}%` }}
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">Quick actions</h3>
            <div className="space-y-2">
              <Link
                href="/admin/clients/new"
                className="flex items-center gap-3 rounded-lg p-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                <UserPlus className="h-4 w-4 text-[#fca311]" />
                Set up tenant
              </Link>
              <Link
                href="/admin/licenses/new"
                className="flex items-center gap-3 rounded-lg p-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                <KeyRound className="h-4 w-4 text-[#fca311]" />
                New license
              </Link>
              <Link
                href="/admin/invoices"
                className="flex items-center gap-3 rounded-lg p-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                <Activity className="h-4 w-4 text-[#fca311]" />
                Review invoices
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
