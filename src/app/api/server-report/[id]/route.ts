import { createHash, timingSafeEqual } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseServerSnapshot, SERVERS } from '@/lib/server-snapshots'

const tokenNames = {
  turbovpn: 'SERVER_REPORT_TURBOVPN_TOKEN',
  'turboisp-api': 'SERVER_REPORT_TURBOISP_API_TOKEN',
} as const

function hash(value: string) {
  return createHash('sha256').update(value).digest()
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const server = SERVERS.find((entry) => entry.id === id)
  const token = server && process.env[tokenNames[server.id]]
  if (!server || !token || !timingSafeEqual(hash(req.headers.get('authorization') ?? ''), hash(`Bearer ${token}`))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.text()
  if (body.length > 8192) return NextResponse.json({ error: 'Report too large' }, { status: 413 })

  let input: unknown
  try {
    input = JSON.parse(body)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const payload = parseServerSnapshot(input, server.repositories)
  if (!payload) return NextResponse.json({ error: 'Invalid server report' }, { status: 400 })

  const receivedAt = new Date()
  await prisma.serverSnapshot.upsert({
    where: { id },
    create: { id, payload, receivedAt },
    update: { payload, receivedAt },
  })
  return new NextResponse(null, { status: 204 })
}
