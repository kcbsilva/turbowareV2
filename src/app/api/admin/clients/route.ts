import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/clients — list all clients with license count
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const search = searchParams.get('search') || ''

  const clients = await prisma.client.findMany({
    where: search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { company: { contains: search, mode: 'insensitive' } },
          ],
        }
      : undefined,
    include: { _count: { select: { licenses: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(clients)
}

// POST /api/admin/clients — create a client
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, email, phone, company, internalNotes } = body

  if (!name?.trim()) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 })
  }

  const client = await prisma.client.create({
    data: {
      name: name.trim(),
      email: email?.trim() || null,
      phone: phone?.trim() || null,
      company: company?.trim() || null,
      internalNotes: internalNotes?.trim() || null,
    },
  })

  return NextResponse.json(client, { status: 201 })
}
