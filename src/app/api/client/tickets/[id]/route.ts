import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getClientId } from '@/lib/client-auth'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const clientId = getClientId(req)
  if (!clientId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const ticket = await prisma.supportTicket.findFirst({
    where: { id: params.id, clientId },
    include: { messages: { orderBy: { createdAt: 'asc' } } },
  })

  if (!ticket) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(ticket)
}
