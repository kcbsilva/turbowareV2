import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { TicketPriority, TicketStatus } from '@prisma/client'

export const dynamic = 'force-dynamic'

// GET /api/admin/tickets — operator inbox
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const status = searchParams.get('status')
  const priority = searchParams.get('priority')
  const search = searchParams.get('search')?.trim() ?? ''

  const validStatus = Object.values(TicketStatus).includes(status as TicketStatus)
    ? (status as TicketStatus)
    : undefined
  const validPriority = Object.values(TicketPriority).includes(priority as TicketPriority)
    ? (priority as TicketPriority)
    : undefined

  const where = {
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
    prisma.supportTicket.count({ where: { status: 'OPEN' } }),
    prisma.supportTicket.count({ where: { status: 'IN_PROGRESS' } }),
  ])

  return NextResponse.json(
    { tickets, openCount, inProgressCount },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
