import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest) {
  const clientId = req.headers.get('x-client-id')
  if (!clientId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 })

  const { name, email, phone, company } = body as Record<string, string>

  if (name !== undefined && typeof name === 'string' && !name.trim()) {
    return NextResponse.json({ error: 'Name cannot be empty' }, { status: 400 })
  }

  const updated = await prisma.client.update({
    where: { id: clientId },
    data: {
      ...(name    !== undefined ? { name:    name.trim()    } : {}),
      ...(email   !== undefined ? { email:   email.trim()   } : {}),
      ...(phone   !== undefined ? { phone:   phone.trim()   } : {}),
      ...(company !== undefined ? { company: company.trim() } : {}),
    },
    select: { id: true, name: true, email: true, phone: true, company: true, cnpj: true },
  })

  return NextResponse.json(updated)
}
