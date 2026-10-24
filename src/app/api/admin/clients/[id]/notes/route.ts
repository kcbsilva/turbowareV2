import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseBody, badRequest } from '@/lib/api'

type Params = { params: Promise<{ id: string }> }

type NoteInput = {
  body?: string
  author?: string
}

// GET /api/admin/clients/[id]/notes
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const notes = await prisma.clientNote.findMany({
    where: { clientId: id },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(notes)
}

// POST /api/admin/clients/[id]/notes
export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params
  const { body: parsed, error } = await parseBody<NoteInput>(req)
  if (error) return badRequest()

  const { body, author } = parsed
  if (!body?.trim()) {
    return NextResponse.json({ error: 'Note body is required' }, { status: 400 })
  }
  const note = await prisma.clientNote.create({
    data: {
      clientId: id,
      body: body.trim(),
      author: author?.trim() || 'Admin',
    },
  })
  return NextResponse.json(note, { status: 201 })
}

// DELETE /api/admin/clients/[id]/notes  — deletes a specific note by noteId query param
export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = await params
  const noteId = req.nextUrl.searchParams.get('noteId')
  if (!noteId) return NextResponse.json({ error: 'noteId required' }, { status: 400 })

  const deleted = await prisma.clientNote.deleteMany({
    where: { id: noteId, clientId: id },
  })
  if (deleted.count === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json({ ok: true })
}
