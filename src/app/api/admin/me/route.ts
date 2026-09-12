import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession, isOwnerRole } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const session = await getAdminSession(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const openTickets = await prisma.supportTicket.count({
    where: { status: { in: ['OPEN', 'IN_PROGRESS'] } },
  })

  return NextResponse.json({
    id: session.id ?? null,
    name: session.name ?? null,
    email: session.email ?? null,
    role: session.role,
    canManage: isOwnerRole(session.role),
    openTickets,
  })
}
