import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseBody, badRequest } from '@/lib/api'
import { TicketPriority, TicketStatus } from '@prisma/client'

export const dynamic = 'force-dynamic'

type Params = { params: Promise<{ id: string }> }

// GET /api/admin/tickets/[id]
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const ticket = await prisma.supportTicket.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, name: true, company: true, email: true } },
      messages: { orderBy: { createdAt: 'asc' } },
    },
  })
  if (!ticket) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(ticket)
}

// PATCH /api/admin/tickets/[id] — status / priority
export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params
  const { body, error } = await parseBody<{ status?: string; priority?: string }>(req)
  if (error) return badRequest()

  const existing = await prisma.supportTicket.findUnique({ where: { id }, select: { id: true } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (body.status && !Object.values(TicketStatus).includes(body.status as TicketStatus)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }
  if (body.priority && !Object.values(TicketPriority).includes(body.priority as TicketPriority)) {
    return NextResponse.json({ error: 'Invalid priority' }, { status: 400 })
  }

  const ticket = await prisma.supportTicket.update({
    where: { id },
    data: {
      ...(body.status ? { status: body.status as TicketStatus } : {}),
      ...(body.priority ? { priority: body.priority as TicketPriority } : {}),
    },
    include: {
      client: { select: { id: true, name: true, company: true, email: true } },
      messages: { orderBy: { createdAt: 'asc' } },
    },
  })

  return NextResponse.json(ticket)
}
