import { NextRequest, NextResponse } from 'next/server'
import { parseBody, badRequest } from '@/lib/api'
import { syncTurboISPTenantsToClients } from '@/lib/sync-turboware-client-from-tenant'

/** POST /api/admin/clients/sync-tenants — backfill Turboware clients from TurboISP tenants */
export async function POST(req: NextRequest) {
  const { body, error } = await parseBody<{ slug?: string }>(req)
  if (error) return badRequest()

  try {
    const result = await syncTurboISPTenantsToClients({ slug: body.slug })
    return NextResponse.json(result)
  } catch (err) {
    console.error('[admin/clients/sync-tenants] Failed:', err)
    const message = err instanceof Error ? err.message : 'sync failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
