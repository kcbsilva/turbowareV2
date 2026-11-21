import { NextRequest, NextResponse } from 'next/server'
import { requireOwnerSession } from '@/lib/auth'
import { parseBody } from '@/lib/api'
import { queueServerSync, syncConfigured } from '@/lib/server-sync'
import { SERVERS } from '@/lib/server-snapshots'

export async function POST(req: NextRequest) {
  const { error: authError } = await requireOwnerSession(req)
  if (authError) return authError

  const { body, error } = await parseBody<{ serverId?: string; repository?: string }>(req)
  const server = SERVERS.find((entry) => entry.id === body?.serverId)
  const repository = server?.repositories.find((name) => name === body?.repository)
  if (error || !server || !repository) return NextResponse.json({ error: 'Invalid repository' }, { status: 400 })
  if (!syncConfigured(server)) return NextResponse.json({ error: 'Sync unavailable' }, { status: 503 })

  const queued = await queueServerSync(server, repository)
  return NextResponse.json({ status: queued ? 'queued' : 'pending' }, { status: 202 })
}
