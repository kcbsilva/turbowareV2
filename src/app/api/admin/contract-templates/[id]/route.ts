import { NextRequest, NextResponse } from 'next/server'
import { parseBody, badRequest } from '@/lib/api'
import { deleteContractTemplate, updateContractTemplate } from '@/lib/contract-templates'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params
  const { body, error } = await parseBody<{
    name?: string
    title?: string
    notes?: string | null
    body?: string | null
  }>(req)
  if (error) return badRequest()

  const result = await updateContractTemplate(id, body)
  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: result.status })
  }
  return NextResponse.json(result.template)
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const result = await deleteContractTemplate(id)
  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: result.status })
  }
  return NextResponse.json({ ok: true })
}
