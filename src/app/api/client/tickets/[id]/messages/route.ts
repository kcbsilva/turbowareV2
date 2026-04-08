import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const clientId = req.headers.get('x-client-id')
  if (!clientId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const ticket = await prisma.supportTicket.findFirst({ where: { id: params.id, clientId } })
  if (!ticket) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (ticket.status === 'CLOSED') {
    return NextResponse.json({ error: 'Ticket is closed' }, { status: 400 })
  }

  const { body } = await req.json().catch(() => ({}))
  if (!body?.trim()) return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 })

  const client = await prisma.client.findUnique({ where: { id: clientId }, select: { name: true } })

  const [message] = await prisma.$transaction([
    prisma.ticketMessage.create({
      data: { ticketId: params.id, body: body.trim(), authorType: 'CLIENT', authorName: client?.name ?? 'Client' },
    }),
    prisma.supportTicket.update({
      where: { id: params.id },
      data: { status: ticket.status === 'RESOLVED' ? 'OPEN' : undefined, updatedAt: new Date() },
    }),
  ])

  return NextResponse.json(message, { status: 201 })
}
