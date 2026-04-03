import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/client/me
 * Returns the authenticated client's profile (name, CNPJ).
 * Used by the portal UI to display credentials in the activation wizard.
 *
 * Protected by middleware — x-client-id header is injected automatically.
 */
export async function GET(req: NextRequest) {
  const clientId = req.headers.get('x-client-id')
  if (!clientId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { id: true, name: true, cnpj: true, email: true },
  })

  if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 })

  return NextResponse.json(client)
}
