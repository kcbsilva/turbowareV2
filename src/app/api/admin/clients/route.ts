import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseBody, badRequest } from '@/lib/api'

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
    select: {
      id: true,
      name: true,
      company: true,
      email: true,
      phone: true,
      createdAt: true,
      _count: { select: { licenses: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(clients)
}

// POST /api/admin/clients — create a client
export async function POST(req: NextRequest) {
  const { body: parsed, error } = await parseBody<{ name?: string; email?: string; phone?: string; company?: string; internalNotes?: string }>(req)
  if (error) return badRequest()
  const { name, email, phone, company, internalNotes } = parsed

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
    select: { id: true },
  })

  return NextResponse.json(client, { status: 201 })
}
