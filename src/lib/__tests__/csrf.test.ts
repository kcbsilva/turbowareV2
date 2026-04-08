import { describe, it, expect } from 'vitest'
import { isSameSiteRequest } from '../csrf'
import { NextRequest } from 'next/server'

function makeReq(overrides: { origin?: string; referer?: string } = {}) {
  const headers: Record<string, string> = { host: 'app.turboware.com' }
  if (overrides.origin)  headers['origin']  = overrides.origin
  if (overrides.referer) headers['referer'] = overrides.referer
  return new NextRequest('https://app.turboware.com/api/admin/test', {
    method: 'POST',
    headers,
  })
}

describe('isSameSiteRequest', () => {
  it('allows request with matching Origin', () => {
    const req = makeReq({ origin: 'https://app.turboware.com' })
    expect(isSameSiteRequest(req)).toBe(true)
  })

  it('allows request with matching Referer', () => {
    const req = makeReq({ referer: 'https://app.turboware.com/admin/clients' })
    expect(isSameSiteRequest(req)).toBe(true)
  })

  it('blocks cross-origin Origin', () => {
    const req = makeReq({ origin: 'https://evil.com' })
    expect(isSameSiteRequest(req)).toBe(false)
  })

  it('blocks cross-origin Referer', () => {
    const req = makeReq({ referer: 'https://evil.com/attack' })
    expect(isSameSiteRequest(req)).toBe(false)
  })

  it('allows no Origin or Referer (direct API call)', () => {
    const req = makeReq()
    expect(isSameSiteRequest(req)).toBe(true)
  })

  it('blocks malformed Origin header', () => {
    const req = makeReq({ origin: 'not-a-url' })
    expect(isSameSiteRequest(req)).toBe(false)
  })
})
