import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Users, KeyRound, UserCheck, UserX, TrendingUp } from 'lucide-react'

export const dynamic = 'force-dynamic'

async function getStats() {
  const clients = await prisma.client.findMany({
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
  })

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const total       = clients.length
  const withLicense = clients.filter((c) => c._count.licenses > 0).length
  const noLicense   = total - withLicense
  const newThisMonth = clients.filter((c) => new Date(c.createdAt) >= startOfMonth).length
  const recent       = clients.slice(0, 8)

  return { total, withLicense, noLicense, newThisMonth, recent }
}

export default async function DashboardPage() {
  const { total, withLicense, noLicense, newThisMonth, recent } = await getStats()

  const cards = [
    { label: 'Total Clients',    value: total,        icon: Users,     color: 'text-primary' },
    { label: 'With Licenses',    value: withLicense,  icon: UserCheck, color: 'text-emerald-400' },
    { label: 'No Licenses',      value: noLicense,    icon: UserX,     color: 'text-muted-foreground' },
    { label: 'New This Month',   value: newThisMonth, icon: TrendingUp,color: 'text-[#fca311]' },
  ]

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold text-foreground">Clients</h1>
          <p className="text-muted-foreground text-xs mt-0.5">Overview of your client base</p>
        </div>
        <Link
          href="/admin/clients"
          className="px-3 py-1.5 text-xs font-semibold rounded-md transition"
          style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}
        >
          View all clients →
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider">{label}</p>
              <Icon className={`w-3.5 h-3.5 ${color} opacity-60`} />
            </div>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Recent clients */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h2 className="text-xs font-semibold text-foreground uppercase tracking-wide">Recent Clients</h2>
          <Link href="/admin/clients" className="text-[10px] text-primary hover:opacity-80">
            View all →
          </Link>
        </div>
        <div className="divide-y divide-border">
          {recent.length === 0 ? (
            <div className="px-4 py-8 text-center text-muted-foreground text-xs">
              No clients yet. They&apos;ll appear here once they register.
            </div>
          ) : (
            recent.map((c) => (
              <Link
                key={c.id}
                href={`/admin/clients/${c.id}`}
                className="flex items-center gap-4 px-4 py-3 hover:bg-muted/50 transition"
              >
                {/* Avatar */}
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold"
                  style={{ backgroundColor: 'hsl(var(--accent)/0.15)', color: 'hsl(var(--accent))' }}
                >
                  {c.name.charAt(0).toUpperCase()}
                </div>

                {/* Name + company */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{c.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{c.company || c.email || '—'}</p>
                </div>

                {/* CNPJ */}
                {c.cnpj && (
                  <p className="text-[10px] text-muted-foreground font-mono hidden md:block">
                    {c.cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')}
                  </p>
                )}

                {/* License count */}
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <KeyRound className="w-3 h-3" />
                  <span>{c._count.licenses} {c._count.licenses === 1 ? 'license' : 'licenses'}</span>
                </div>

                {/* Date */}
                <p className="text-[10px] text-muted-foreground/50 hidden lg:block">
                  {new Date(c.createdAt).toLocaleDateString()}
                </p>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
