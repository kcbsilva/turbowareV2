import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type Params = { params: { id: string } }

// GET /api/admin/clients/[id]/notes
export async function GET(_req: NextRequest, { params }: Params) {
  const notes = await prisma.clientNote.findMany({
    where: { clientId: params.id },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(notes)
}

// POST /api/admin/clients/[id]/notes
export async function POST(req: NextRequest, { params }: Params) {
  const { body, author } = await req.json()
  if (!body?.trim()) {
    return NextResponse.json({ error: 'Note body is required' }, { status: 400 })
  }
  const note = await prisma.clientNote.create({
    data: {
      clientId: params.id,
      body: body.trim(),
      author: author?.trim() || 'Admin',
    },
  })
  return NextResponse.json(note, { status: 201 })
}

// DELETE /api/admin/clients/[id]/notes  — deletes a specific note by noteId query param
export async function DELETE(req: NextRequest, { params: _params }: Params) {
  const noteId = req.nextUrl.searchParams.get('noteId')
  if (!noteId) return NextResponse.json({ error: 'noteId required' }, { status: 400 })
  await prisma.clientNote.delete({ where: { id: noteId } })
  return NextResponse.json({ ok: true })
}
