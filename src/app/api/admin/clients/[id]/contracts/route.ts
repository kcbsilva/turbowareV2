import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseBody, badRequest } from '@/lib/api'
import { createContract, listClientContracts } from '@/lib/contracts'
import { reconcileSubscriptionLicenseSync } from '@/lib/billing'
import { ensureDefaultCatalog } from '@/lib/product-catalog'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params
  const client = await prisma.client.findUnique({ where: { id }, select: { id: true } })
  if (!client) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  await ensureDefaultCatalog()
  try {
    await reconcileSubscriptionLicenseSync(id)
  } catch (err) {
    console.error('[contracts] reconcile failed:', err)
  }
  const payload = await listClientContracts(id)
  return NextResponse.json(payload)
}

export async function POST(req: NextRequest, { params }: Params) {
  const { id: clientId } = await params
  const { body, error } = await parseBody<{
    title?: string
    startsAt?: string
    notes?: string
    templateId?: string
    body?: string
  }>(req)
  if (error) return badRequest()

  const result = await createContract({
    clientId,
    title: body.title,
    startsAt: body.startsAt,
    notes: body.notes,
    templateId: body.templateId,
    body: body.body,
  })
  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: result.status })
  }
  return NextResponse.json(result.contract, { status: 201 })
}
