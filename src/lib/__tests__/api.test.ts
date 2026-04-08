import { describe, it, expect } from 'vitest'
import { parseBody } from '../api'
import { NextRequest } from 'next/server'

function makeRequest(body: string, contentType = 'application/json') {
  return new NextRequest('http://localhost/api/test', {
    method: 'POST',
    headers: { 'Content-Type': contentType },
    body,
  })
}

describe('parseBody', () => {
  it('returns parsed body for valid JSON', async () => {
    const req = makeRequest(JSON.stringify({ key: 'abc', seats: 5 }))
    const { body, error } = await parseBody(req)
    expect(error).toBeNull()
    expect(body).toEqual({ key: 'abc', seats: 5 })
  })

  it('returns error for malformed JSON', async () => {
    const req = makeRequest('{ invalid json }')
    const { body, error } = await parseBody(req)
    expect(body).toBeNull()
    expect(error).toBeInstanceOf(Error)
  })

  it('returns error for empty body', async () => {
    const req = makeRequest('')
    const { body, error } = await parseBody(req)
    expect(body).toBeNull()
    expect(error).toBeInstanceOf(Error)
  })
})
