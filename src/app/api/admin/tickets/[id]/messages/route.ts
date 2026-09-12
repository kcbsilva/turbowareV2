import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseBody, badRequest } from '@/lib/api'
import { getAdminSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

type Params = { params: Promise<{ id: string }> }

// POST /api/admin/tickets/[id]/messages — reply as ADMIN
export async function POST(req: NextRequest, { params }: Params) {
  const session = await getAdminSession(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { body, error } = await parseBody<{ body?: string }>(req)
  if (error) return badRequest()

  const text = body.body?.trim() ?? ''
  if (!text) return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 })

  const ticket = await prisma.supportTicket.findUnique({ where: { id } })
  if (!ticket) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (ticket.status === 'CLOSED') {
    return NextResponse.json({ error: 'Ticket is closed' }, { status: 400 })
  }

  const authorName = session.name || session.email || 'Support'

  const [message] = await prisma.$transaction([
    prisma.ticketMessage.create({
      data: {
        ticketId: id,
        body: text,
        authorType: 'ADMIN',
        authorName,
      },
    }),
    prisma.supportTicket.update({
      where: { id },
      data: {
        status: ticket.status === 'OPEN' ? 'IN_PROGRESS' : ticket.status,
        updatedAt: new Date(),
      },
    }),
  ])

  return NextResponse.json(message, { status: 201 })
}
