import { NextRequest, NextResponse } from 'next/server'
import { requestVisitorIP } from '@/lib/rate-limit'

export async function GET(req: NextRequest) {
  return NextResponse.json({ ip: requestVisitorIP(req.headers) })
}
