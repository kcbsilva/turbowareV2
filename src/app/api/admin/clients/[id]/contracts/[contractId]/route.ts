import { ContractStatus } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseBody, badRequest } from '@/lib/api'

type Params = { params: Promise<{ id: string; contractId: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id: clientId, contractId } = await params
  const { body, error } = await parseBody<{
    title?: string
    notes?: string | null
    status?: string
  }>(req)
  if (error) return badRequest()

  const existing = await prisma.contract.findFirst({
    where: { id: contractId, clientId },
    select: { id: true },
  })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const data: { title?: string; notes?: string | null; status?: ContractStatus } = {}
  if (body.title !== undefined) {
    const title = body.title.trim()
    if (!title) return NextResponse.json({ error: 'Title cannot be empty' }, { status: 400 })
    data.title = title
  }
  if (body.notes !== undefined) data.notes = body.notes?.trim() || null
  if (body.status !== undefined) {
    if (!Object.values(ContractStatus).includes(body.status as ContractStatus)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }
    data.status = body.status as ContractStatus
  }
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'No updates provided' }, { status: 400 })
  }

  const updated = await prisma.contract.update({
    where: { id: contractId },
    data,
  })
  return NextResponse.json(updated)
}
