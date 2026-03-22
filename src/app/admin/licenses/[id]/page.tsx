import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { LicenseStatus } from '@prisma/client'
import { resolveStatus } from '@/lib/license'
import Link from 'next/link'
import { LicenseActions } from './LicenseActions'

export const dynamic = 'force-dynamic'

const statusStyles: Record<LicenseStatus, string> = {
  ACTIVE: 'text-emerald-400 border-emerald-800 bg-emerald-950/40',
  SUSPENDED: 'text-yellow-400 border-yellow-800 bg-yellow-950/40',
  REVOKED: 'text-red-400 border-red-900 bg-red-950/40',
  EXPIRED: 'text-muted-foreground border-border bg-muted/50',
}

export default async function LicenseDetailPage({ params }: { params: { id: string } }) {
  const [license, clients] = await Promise.all([
    prisma.license.findUnique({
      where: { id: params.id },
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
    <div className="max-w-xl">
      <div className="mb-6">
        <Link href="/admin/licenses" className="text-xs text-muted-foreground hover:text-foreground mb-2 inline-block">
          ← Back to licenses
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-base font-bold text-foreground font-mono">{license.key}</h1>
            <p className="text-muted-foreground text-xs mt-0.5">{license.product}</p>
          </div>
          <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-semibold ${statusStyles[effective]}`}>
            {effective}
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="bg-card border border-border rounded-lg mb-4">
        <div className="px-4 py-2.5 border-b border-border">
          <h2 className="text-[10px] font-semibold text-foreground uppercase tracking-wider">License Details</h2>
        </div>
        <dl className="px-4 py-3 grid grid-cols-2 gap-3">
          <div>
            <dt className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Product</dt>
            <dd className="text-xs text-foreground">{license.product}</dd>
          </div>
          <div>
            <dt className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Status</dt>
            <dd className="text-xs text-foreground">{license.status}</dd>
          </div>
          <div>
            <dt className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Seats</dt>
            <dd className="text-xs text-foreground">{license.activations.length} / {license.maxSeats} used</dd>
          </div>
          <div>
            <dt className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Expires</dt>
            <dd className="text-xs text-foreground">
              {license.expiresAt ? new Date(license.expiresAt).toLocaleDateString() : 'Never'}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Client</dt>
            <dd className="text-xs text-foreground">
              {license.client
                ? <Link href={`/admin/clients/${license.client.id}`} className="text-primary hover:underline">{license.client.name}</Link>
                : <span className="text-muted-foreground/50">Unassigned</span>}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Created</dt>
            <dd className="text-xs text-foreground">{new Date(license.createdAt).toLocaleString()}</dd>
          </div>
          {license.notes && (
            <div className="col-span-2">
              <dt className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Notes</dt>
              <dd className="text-xs text-foreground">{license.notes}</dd>
            </div>
          )}
        </dl>
      </div>

      {/* Actions (client assign + status) */}
      <LicenseActions license={license} effectiveStatus={effective} clients={clients} />

      {/* Activations */}
      <div className="bg-card border border-border rounded-lg mt-4">
        <div className="px-4 py-2.5 border-b border-border">
          <h2 className="text-[10px] font-semibold text-foreground uppercase tracking-wider">
            Activations ({license.activations.length})
          </h2>
        </div>
        {license.activations.length === 0 ? (
          <div className="px-4 py-6 text-center text-muted-foreground text-xs">No activations yet.</div>
        ) : (
          <div className="divide-y divide-border">
            {license.activations.map((a) => (
              <div key={a.id} className="px-4 py-3 flex items-start justify-between">
                <div>
                  <p className="font-mono text-[10px] text-foreground">{a.hardwareId}</p>
                  {a.label && <p className="text-[10px] text-muted-foreground mt-0.5">{a.label}</p>}
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground">Activated {new Date(a.activatedAt).toLocaleDateString()}</p>
                  <p className="text-[10px] text-muted-foreground/60">Last seen {new Date(a.lastSeenAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
