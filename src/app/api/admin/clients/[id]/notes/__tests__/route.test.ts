import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  deleteMany: vi.fn(),
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    clientNote: {
      create: mocks.create,
      deleteMany: mocks.deleteMany,
    },
  },
}))

import { DELETE, POST } from '../route'

const clientId = 'client-1'
const params = { params: Promise.resolve({ id: clientId }) }

function postRequest(body: string) {
  return new NextRequest(`http://localhost/api/admin/clients/${clientId}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  })
}

function deleteRequest(noteId?: string) {
  const url = new URL(`http://localhost/api/admin/clients/${clientId}/notes`)
  if (noteId !== undefined) url.searchParams.set('noteId', noteId)
  return new NextRequest(url, { method: 'DELETE' })
}

beforeEach(() => {
  vi.resetAllMocks()
})

describe('POST /api/admin/clients/[id]/notes', () => {
  it('returns 400 for malformed JSON instead of throwing', async () => {
    const res = await POST(postRequest('{ invalid json }'), params)

    expect(res.status).toBe(400)
    await expect(res.json()).resolves.toEqual({ error: 'Invalid or missing request body' })
    expect(mocks.create).not.toHaveBeenCalled()
  })

  it('returns 400 for an empty body', async () => {
    const res = await POST(postRequest(''), params)

    expect(res.status).toBe(400)
    expect(mocks.create).not.toHaveBeenCalled()
  })

  it('returns 400 when the note body is missing', async () => {
    const res = await POST(postRequest(JSON.stringify({ author: 'Sam' })), params)

    expect(res.status).toBe(400)
    await expect(res.json()).resolves.toEqual({ error: 'Note body is required' })
    expect(mocks.create).not.toHaveBeenCalled()
  })

  it('creates a trimmed note and defaults a blank author', async () => {
    const created = { id: 'note-1', clientId, body: 'Called the site', author: 'Admin' }
    mocks.create.mockResolvedValue(created)

    const res = await POST(postRequest(JSON.stringify({ body: '  Called the site  ', author: '   ' })), params)

    expect(res.status).toBe(201)
    expect(mocks.create).toHaveBeenCalledWith({
      data: { clientId, body: 'Called the site', author: 'Admin' },
    })
    await expect(res.json()).resolves.toEqual(created)
  })
})

describe('DELETE /api/admin/clients/[id]/notes', () => {
  it('returns 400 when noteId is missing', async () => {
    const res = await DELETE(deleteRequest(), params)

    expect(res.status).toBe(400)
    await expect(res.json()).resolves.toEqual({ error: 'noteId required' })
    expect(mocks.deleteMany).not.toHaveBeenCalled()
  })

  it('deletes only a note that belongs to the client in the path', async () => {
    mocks.deleteMany.mockResolvedValue({ count: 1 })

    const res = await DELETE(deleteRequest('note-1'), params)

    expect(res.status).toBe(200)
    expect(mocks.deleteMany).toHaveBeenCalledWith({
      where: { id: 'note-1', clientId },
    })
    await expect(res.json()).resolves.toEqual({ ok: true })
  })

  it('returns 404 when the note does not belong to that client', async () => {
    mocks.deleteMany.mockResolvedValue({ count: 0 })

    const res = await DELETE(deleteRequest('note-other-client'), params)

    expect(res.status).toBe(404)
    expect(mocks.deleteMany).toHaveBeenCalledWith({
      where: { id: 'note-other-client', clientId },
    })
    await expect(res.json()).resolves.toEqual({ error: 'Not found' })
  })
})
