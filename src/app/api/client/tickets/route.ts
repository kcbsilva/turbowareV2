import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const clientId = req.headers.get('x-client-id')
  if (!clientId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const tickets = await prisma.supportTicket.findMany({
    where: { clientId },
    orderBy: { updatedAt: 'desc' },
    include: {
      messages: { orderBy: { createdAt: 'asc' }, take: 1 },
      _count: { select: { messages: true } },
    },
  })

  return NextResponse.json(tickets)
}

export async function POST(req: NextRequest) {
  const clientId = req.headers.get('x-client-id')
  if (!clientId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { title, body, category, priority } = await req.json().catch(() => ({}))
  if (!title?.trim() || !body?.trim()) {
    return NextResponse.json({ error: 'Title and message are required' }, { status: 400 })
  }

  const client = await prisma.client.findUnique({ where: { id: clientId }, select: { name: true } })

  const ticket = await prisma.supportTicket.create({
    data: {
      clientId,
      title: title.trim(),
      category: category?.trim() || null,
      priority: priority || 'MEDIUM',
      messages: {
        create: { body: body.trim(), authorType: 'CLIENT', authorName: client?.name ?? 'Client' },
      },
    },
    include: { messages: true },
  })

  return NextResponse.json(ticket, { status: 201 })
}
