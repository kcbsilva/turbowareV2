import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseBody, badRequest } from '@/lib/api'
import { getAdminSession } from '@/lib/auth'
import { TicketPriority, TicketStatus } from '@prisma/client'

export const dynamic = 'force-dynamic'

// GET /api/admin/tickets — operator inbox (optional ?clientId=)
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const status = searchParams.get('status')
  const priority = searchParams.get('priority')
  const clientId = searchParams.get('clientId')?.trim() || undefined
  const search = searchParams.get('search')?.trim() ?? ''

  const validStatus = Object.values(TicketStatus).includes(status as TicketStatus)
    ? (status as TicketStatus)
    : undefined
  const validPriority = Object.values(TicketPriority).includes(priority as TicketPriority)
    ? (priority as TicketPriority)
    : undefined

  const where = {
    ...(clientId ? { clientId } : {}),
    ...(validStatus ? { status: validStatus } : {}),
    ...(validPriority ? { priority: validPriority } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' as const } },
            { category: { contains: search, mode: 'insensitive' as const } },
            { client: { name: { contains: search, mode: 'insensitive' as const } } },
            { client: { company: { contains: search, mode: 'insensitive' as const } } },
          ],
        }
      : {}),
  }

  const countWhere = clientId ? { clientId } : {}

  const [tickets, openCount, inProgressCount] = await Promise.all([
    prisma.supportTicket.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        client: { select: { id: true, name: true, company: true, email: true } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
        _count: { select: { messages: true } },
      },
    }),
    prisma.supportTicket.count({ where: { status: 'OPEN', ...countWhere } }),
    prisma.supportTicket.count({ where: { status: 'IN_PROGRESS', ...countWhere } }),
  ])

  return NextResponse.json(
    { tickets, openCount, inProgressCount },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}

// POST /api/admin/tickets — open a ticket for a client
export async function POST(req: NextRequest) {
  const session = await getAdminSession(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { body, error } = await parseBody<{
    clientId?: string
    title?: string
    body?: string
    category?: string
    priority?: string
  }>(req)
  if (error) return badRequest()

  const clientId = body.clientId?.trim() ?? ''
  const title = body.title?.trim() ?? ''
  const text = body.body?.trim() ?? ''
  if (!clientId || !title || !text) {
    return NextResponse.json({ error: 'clientId, title, and message are required' }, { status: 400 })
  }

  if (body.priority && !Object.values(TicketPriority).includes(body.priority as TicketPriority)) {
    return NextResponse.json({ error: 'Invalid priority' }, { status: 400 })
  }

  const client = await prisma.client.findUnique({ where: { id: clientId }, select: { id: true } })
  if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 })

  const authorName = session.name || session.email || 'Support'

  const ticket = await prisma.supportTicket.create({
    data: {
      clientId,
      title,
      category: body.category?.trim() || null,
      priority: (body.priority as TicketPriority) || 'MEDIUM',
      messages: {
        create: { body: text, authorType: 'ADMIN', authorName },
      },
    },
    include: {
      client: { select: { id: true, name: true, company: true, email: true } },
      messages: { orderBy: { createdAt: 'asc' } },
    },
  })

  return NextResponse.json(ticket, { status: 201 })
}
