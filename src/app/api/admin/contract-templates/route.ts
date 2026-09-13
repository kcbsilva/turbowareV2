import { NextRequest, NextResponse } from 'next/server'
import { parseBody, badRequest } from '@/lib/api'
import { createContractTemplate, listContractTemplates } from '@/lib/contract-templates'

export const dynamic = 'force-dynamic'

export async function GET() {
  const templates = await listContractTemplates()
  return NextResponse.json({ templates })
}

export async function POST(req: NextRequest) {
  const { body, error } = await parseBody<{
    name?: string
    title?: string
    notes?: string
    body?: string
  }>(req)
  if (error) return badRequest()

  const result = await createContractTemplate({
    name: body.name ?? '',
    title: body.title ?? '',
    notes: body.notes,
    body: body.body,
  })
  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: result.status })
  }
  return NextResponse.json(result.template, { status: 201 })
}
