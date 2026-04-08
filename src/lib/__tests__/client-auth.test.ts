import { describe, it, expect } from 'vitest'
import { getClientId } from '../client-auth'
import { NextRequest } from 'next/server'

function makeReq(clientId?: string) {
  const headers: Record<string, string> = {}
  if (clientId !== undefined) headers['x-client-id'] = clientId
  return new NextRequest('http://localhost/api/client/subscription', { headers })
}

describe('getClientId', () => {
  it('returns a valid CUID from the header', () => {
    const id  = 'clh1234567890abcdefghijkl'
    const req = makeReq(id)
    expect(getClientId(req)).toBe(id)
  })

  it('returns null when header is missing', () => {
    expect(getClientId(makeReq())).toBeNull()
  })

  it('returns null for empty string', () => {
    expect(getClientId(makeReq(''))).toBeNull()
  })

  it('returns null for SQL-like injection attempt', () => {
    expect(getClientId(makeReq("' OR 1=1 --"))).toBeNull()
  })

  it('returns null for UUID format (wrong format)', () => {
    expect(getClientId(makeReq('550e8400-e29b-41d4-a716-446655440000'))).toBeNull()
  })

  it('returns null for short strings', () => {
    expect(getClientId(makeReq('abc123'))).toBeNull()
  })
})
