import { prisma } from '@/lib/prisma'
import { LicenseStatus } from '@prisma/client'
import Link from 'next/link'
import { resolveStatus } from '@/lib/license'

export const dynamic = 'force-dynamic'

const statusStyles: Record<LicenseStatus, string> = {
  ACTIVE: 'text-emerald-400 border-emerald-800 bg-emerald-950/40',
  SUSPENDED: 'text-yellow-400 border-yellow-800 bg-yellow-950/40',
  REVOKED: 'text-red-400 border-red-900 bg-red-950/40',
  EXPIRED: 'text-muted-foreground border-border bg-muted/50',
}

export default async function LicensesPage({
  searchParams,
}: {
  searchParams: { status?: string; search?: string }
}) {
  const { status, search } = searchParams
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
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold text-foreground">Licenses</h1>
          <p className="text-muted-foreground text-xs mt-0.5">{licenses.length} keys total</p>
        </div>
        <Link
          href="/admin/licenses/new"
          className="px-3 py-1.5 text-xs font-semibold rounded-md transition"
          style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}
        >
          + Generate Key
        </Link>
      </div>

      {/* Filters */}
      <form method="GET" className="flex gap-2 mb-4">
        <input
          name="search"
          defaultValue={search}
          placeholder="Search by key or product…"
          className="flex-1 px-3 py-1.5 bg-muted border border-border rounded-md text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <select
          name="status"
          defaultValue={status || ''}
          className="px-3 py-1.5 bg-muted border border-border rounded-md text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All statuses</option>
          {Object.values(LicenseStatus).map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button
          type="submit"
          className="px-3 py-1.5 bg-muted hover:bg-secondary border border-border text-foreground text-xs font-medium rounded-md transition"
        >
          Filter
        </button>
        {(search || status) && (
          <Link
            href="/admin/licenses"
            className="px-3 py-1.5 text-muted-foreground hover:text-foreground text-xs font-medium rounded-md transition"
          >
            Clear
          </Link>
        )}
      </form>

      {/* Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {licenses.length === 0 ? (
          <div className="px-6 py-12 text-center text-muted-foreground text-xs">
            No licenses found.
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-left text-[10px] text-muted-foreground uppercase tracking-wider">
                <th className="px-4 py-2.5 font-medium">License Key</th>
                <th className="px-4 py-2.5 font-medium">Product</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium">Seats</th>
                <th className="px-4 py-2.5 font-medium">Expires</th>
                <th className="px-4 py-2.5 font-medium">Created</th>
                <th className="px-4 py-2.5 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {licenses.map((l) => {
                const effective = resolveStatus(l.status, l.expiresAt)
                return (
                  <tr key={l.id} className="hover:bg-muted/40 transition">
                    <td className="px-4 py-3 font-mono text-foreground">{l.key}</td>
                    <td className="px-4 py-3 text-foreground">{l.product}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full border text-[10px] font-medium ${statusStyles[effective]}`}>
                        {effective}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {l._count.activations}/{l.maxSeats}
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {l.expiresAt
                        ? new Date(l.expiresAt).toLocaleDateString()
                        : <span className="text-muted-foreground">Never</span>}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(l.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/licenses/${l.id}`}
                        className="text-primary hover:opacity-80 font-medium"
                      >
                        Manage →
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
