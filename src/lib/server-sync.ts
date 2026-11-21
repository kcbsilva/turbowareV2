import { createHash, randomUUID, timingSafeEqual } from 'node:crypto'
import { prisma } from '@/lib/prisma'
import { SERVERS } from '@/lib/server-snapshots'

type Server = (typeof SERVERS)[number]
const tokenNames = {
  turbovpn: 'SERVER_SYNC_TURBOVPN_TOKEN',
  'turboisp-api': 'SERVER_SYNC_TURBOISP_API_TOKEN',
} as const

export function syncConfigured(server: Server) {
  return Boolean(process.env[tokenNames[server.id]])
}

export function authenticateSyncAgent(id: string, authorization: string | null) {
  const server = SERVERS.find((entry) => entry.id === id)
  const token = server && process.env[tokenNames[server.id]]
  if (!token || !authorization) return null
  const hash = (value: string) => createHash('sha256').update(value).digest()
  return timingSafeEqual(hash(authorization), hash(`Bearer ${token}`)) ? server : null
}

export async function queueServerSync(server: Server, repository: string) {
  const now = new Date()
  const expiresAt = new Date(now.getTime() + 20 * 60_000)
  const requestId = randomUUID()
  const inserted = await prisma.$executeRaw`
    INSERT INTO "turboware"."server_sync_requests"
      ("repository", "serverId", "requestId", "status", "requestedAt", "expiresAt")
    VALUES (${repository}, ${server.id}, ${requestId}, 'queued', ${now}, ${expiresAt})
    ON CONFLICT ("repository") DO UPDATE
      SET "requestId" = EXCLUDED."requestId", "status" = EXCLUDED."status",
          "requestedAt" = EXCLUDED."requestedAt", "expiresAt" = EXCLUDED."expiresAt"
      WHERE "server_sync_requests"."status" IN ('succeeded', 'failed')
         OR "server_sync_requests"."expiresAt" <= EXCLUDED."requestedAt"
  `
  return inserted === 1
}

export async function claimServerSync(server: Server) {
  const now = new Date()
  const candidate = await prisma.serverSyncRequest.findFirst({
    where: { serverId: server.id, status: 'queued', expiresAt: { gt: now } },
    orderBy: { requestedAt: 'asc' },
    select: { requestId: true, repository: true },
  })
  if (!candidate) return null

  const claimed = await prisma.serverSyncRequest.updateMany({
    where: { requestId: candidate.requestId, status: 'queued', expiresAt: { gt: now } },
    data: { status: 'running', expiresAt: new Date(now.getTime() + 20 * 60_000) },
  })
  return claimed.count === 1 ? candidate : null
}
