import { describe, expect, it } from 'vitest'
import { formatFileSize, isAllowedDocumentMime, isDocumentKind } from '../client-documents'

describe('client documents', () => {
  it('accepts known kinds and image/pdf mime types', () => {
    expect(isDocumentKind('ID_FRONT')).toBe(true)
    expect(isDocumentKind('id_front')).toBe(false)
    expect(isAllowedDocumentMime('application/pdf')).toBe(true)
    expect(isAllowedDocumentMime('image/jpeg')).toBe(true)
    expect(isAllowedDocumentMime('application/zip')).toBe(false)
  })

  it('formats byte sizes', () => {
    expect(formatFileSize(512)).toBe('512 B')
    expect(formatFileSize(2048)).toBe('2.0 KB')
  })
})
