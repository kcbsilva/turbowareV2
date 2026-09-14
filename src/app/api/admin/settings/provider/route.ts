import { NextRequest, NextResponse } from 'next/server'
import { badRequest, parseBody } from '@/lib/api'
import { getProviderTerms, saveProviderTerms } from '@/lib/platform-settings'

export const dynamic = 'force-dynamic'

export async function GET() {
  const providerTerms = await getProviderTerms()
  return NextResponse.json({ providerTerms })
}

export async function PATCH(req: NextRequest) {
  const { body, error } = await parseBody<{ providerTerms?: unknown }>(req)
  if (error) return badRequest()
  const providerTerms = await saveProviderTerms(body.providerTerms)
  return NextResponse.json({ providerTerms })
}
