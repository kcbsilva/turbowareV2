import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseServerSnapshot, SERVERS, type ServerReading } from '@/lib/server-snapshots'

export const dynamic = 'force-dynamic'

export async function GET() {
  const rows = await prisma.serverSnapshot.findMany()
  const staleBefore = Date.now() - 15 * 60 * 1000
  const readings: ServerReading[] = []

  for (const server of SERVERS) {
    const row = rows.find((entry) => entry.id === server.id)
    if (!row) continue
    const snapshot = parseServerSnapshot(row.payload, server.repositories)
    if (!snapshot) continue
    readings.push({
      id: row.id,
      receivedAt: row.receivedAt.toISOString(),
      stale: row.receivedAt.getTime() < staleBefore,
      snapshot,
    })
  }

  return NextResponse.json(readings, { headers: { 'Cache-Control': 'private, no-store' } })
}
