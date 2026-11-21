import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession, isOwnerRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { syncConfigured } from '@/lib/server-sync'
import { parseServerSnapshot, SERVERS, SYNC_STATES, type ServerSettingsData } from '@/lib/server-snapshots'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const session = await getAdminSession(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const includeSync = req.nextUrl.searchParams.get('sync') === '1'
  const syncEnabled = includeSync && isOwnerRole(session.role)
    ? SERVERS.filter(syncConfigured).map((server) => server.id)
    : []
  const [rows, requests] = await Promise.all([
    prisma.serverSnapshot.findMany(),
    syncEnabled.length > 0
      ? prisma.serverSyncRequest.findMany({ where: { serverId: { in: syncEnabled } } })
      : [],
  ])
  const staleBefore = Date.now() - 15 * 60 * 1000
  const result: ServerSettingsData = { readings: [], syncEnabled, syncRequests: {} }

  for (const server of SERVERS) {
    const row = rows.find((entry) => entry.id === server.id)
    if (!row) continue
    const snapshot = parseServerSnapshot(row.payload, server.repositories)
    if (!snapshot) continue
    result.readings.push({
      id: row.id,
      receivedAt: row.receivedAt.toISOString(),
      stale: row.receivedAt.getTime() < staleBefore,
      snapshot,
    })
  }

  for (const request of requests) {
    const status = SYNC_STATES.find((state) => state === request.status)
    if (!status) continue
    const pending = status === 'queued' || status === 'running'
    result.syncRequests[request.repository] = pending && request.expiresAt.getTime() <= Date.now()
      ? 'expired'
      : status
  }
  return NextResponse.json(includeSync ? result : result.readings, {
    headers: { 'Cache-Control': 'private, no-store' },
  })
}
