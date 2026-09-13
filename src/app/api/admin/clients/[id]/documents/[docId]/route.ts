import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type Params = { params: Promise<{ id: string; docId: string }> }

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id, docId } = await params
  const existing = await prisma.clientDocument.findFirst({
    where: { id: docId, clientId: id },
    select: { id: true },
  })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.clientDocument.delete({ where: { id: docId } })
  return NextResponse.json({ ok: true })
}
