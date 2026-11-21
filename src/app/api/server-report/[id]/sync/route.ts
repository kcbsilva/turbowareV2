import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateSyncAgent, claimServerSync } from '@/lib/server-sync'
import { parseBody } from '@/lib/api'

type Context = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Context) {
  const { id } = await params
  const server = authenticateSyncAgent(id, req.headers.get('authorization'))
  if (!server) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const job = await claimServerSync(server)
  return job ? NextResponse.json(job) : new NextResponse(null, { status: 204 })
}

export async function PATCH(req: NextRequest, { params }: Context) {
  const { id } = await params
  const server = authenticateSyncAgent(id, req.headers.get('authorization'))
  if (!server) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { body, error } = await parseBody<{ requestId?: string; succeeded?: boolean }>(req)
  if (error || typeof body?.requestId !== 'string' || body.requestId.length !== 36 ||
      typeof body.succeeded !== 'boolean') {
    return NextResponse.json({ error: 'Invalid result' }, { status: 400 })
  }

  await prisma.serverSyncRequest.updateMany({
    where: { serverId: server.id, requestId: body.requestId, status: 'running' },
    data: { status: body.succeeded ? 'succeeded' : 'failed' },
  })
  return new NextResponse(null, { status: 204 })
}
