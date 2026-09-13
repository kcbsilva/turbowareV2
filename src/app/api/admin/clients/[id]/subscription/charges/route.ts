import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseBody, badRequest } from '@/lib/api'
import { CHARGE_TYPES, createAdHocCharge, type ChargeType } from '@/lib/charges'

type Params = { params: Promise<{ id: string }> }

// POST /api/admin/clients/[id]/subscription/charges — one-off invoice or payment plan
export async function POST(req: NextRequest, { params }: Params) {
  const { id: clientId } = await params
  const { body, error } = await parseBody<{
    type?: ChargeType
    amount?: number
    dueDate?: string
    notes?: string
    installments?: number
    intervalDays?: number
  }>(req)
  if (error) return badRequest()

  if (!body.type || !CHARGE_TYPES.includes(body.type) || body.amount == null || !body.dueDate) {
    return NextResponse.json(
      { error: 'type, amount, and dueDate are required' },
      { status: 400 },
    )
  }

  const client = await prisma.client.findUnique({ where: { id: clientId }, select: { id: true } })
  if (!client) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const result = await createAdHocCharge({
    clientId,
    type: body.type,
    amount: body.amount,
    dueDate: body.dueDate,
    notes: body.notes,
    installments: body.installments,
    intervalDays: body.intervalDays,
  })

  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: result.status })
  }

  return NextResponse.json({ invoices: result.invoices }, { status: 201 })
}
