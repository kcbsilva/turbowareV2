import { NextResponse } from 'next/server'
import { clearAdminAuthCookie } from '@/lib/auth'

export async function POST() {
  const res = NextResponse.json({ ok: true })
  clearAdminAuthCookie(res)
  return res
}
