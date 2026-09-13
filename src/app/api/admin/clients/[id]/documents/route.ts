import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/auth'
import {
  DOCUMENT_LIST_SELECT,
  MAX_DOCUMENT_BYTES,
  isAllowedDocumentMime,
  isDocumentKind,
} from '@/lib/client-documents'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const client = await prisma.client.findUnique({ where: { id }, select: { id: true } })
  if (!client) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const documents = await prisma.clientDocument.findMany({
    where: { clientId: id },
    select: DOCUMENT_LIST_SELECT,
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(documents)
}

export async function POST(req: NextRequest, { params }: Params) {
  const { session, error } = await requireAdminSession(req)
  if (error) return error

  const { id } = await params
  const client = await prisma.client.findUnique({ where: { id }, select: { id: true } })
  if (!client) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const form = await req.formData()
  const file = form.get('file')
  const kindRaw = String(form.get('kind') ?? '')
  const titleRaw = String(form.get('title') ?? '').trim()
  const notesRaw = String(form.get('notes') ?? '').trim()

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: 'A file is required' }, { status: 400 })
  }
  if (!isDocumentKind(kindRaw)) {
    return NextResponse.json({ error: 'Invalid document type' }, { status: 400 })
  }
  if (file.size > MAX_DOCUMENT_BYTES) {
    return NextResponse.json({ error: 'File is larger than 10 MB' }, { status: 400 })
  }
  const mimeType = file.type || 'application/octet-stream'
  if (!isAllowedDocumentMime(mimeType)) {
    return NextResponse.json({ error: 'Only PDF and image files are allowed' }, { status: 400 })
  }

  const created = await prisma.clientDocument.create({
    data: {
      clientId: id,
      kind: kindRaw,
      title: titleRaw || file.name,
      fileName: file.name.slice(0, 180) || 'document',
      mimeType,
      sizeBytes: file.size,
      data: Buffer.from(await file.arrayBuffer()),
      notes: notesRaw || null,
      uploadedBy: session.name || session.email || 'Admin',
    },
    select: DOCUMENT_LIST_SELECT,
  })

  return NextResponse.json(created, { status: 201 })
}
