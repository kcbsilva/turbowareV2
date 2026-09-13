import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { safeDownloadName } from '@/lib/client-documents'

type Params = { params: Promise<{ id: string; docId: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { id, docId } = await params
  const doc = await prisma.clientDocument.findFirst({
    where: { id: docId, clientId: id },
    select: { data: true, mimeType: true, fileName: true },
  })
  if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const filename = safeDownloadName(doc.fileName)
  return new NextResponse(new Uint8Array(doc.data), {
    headers: {
      'Content-Type': doc.mimeType,
      'Content-Disposition': `inline; filename="${filename}"`,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
