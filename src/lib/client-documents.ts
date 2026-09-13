import type { MsgKey } from '@/lib/admin-i18n'

export const DOCUMENT_KINDS = [
  'ID_FRONT',
  'ID_BACK',
  'PASSPORT',
  'SELFIE',
  'PROOF_OF_ADDRESS',
  'COMPANY',
  'CONTRACT',
  'OTHER',
] as const

export type DocumentKind = (typeof DOCUMENT_KINDS)[number]

export const DOCUMENT_KIND_KEY = {
  ID_FRONT: 'docs.kind.idFront',
  ID_BACK: 'docs.kind.idBack',
  PASSPORT: 'docs.kind.passport',
  SELFIE: 'docs.kind.selfie',
  PROOF_OF_ADDRESS: 'docs.kind.address',
  COMPANY: 'docs.kind.company',
  CONTRACT: 'docs.kind.contract',
  OTHER: 'docs.kind.other',
} as const satisfies Record<DocumentKind, MsgKey>

export const ALLOWED_DOCUMENT_MIMES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
])

export const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024

export function isDocumentKind(value: string): value is DocumentKind {
  return (DOCUMENT_KINDS as readonly string[]).includes(value)
}

export function isAllowedDocumentMime(mime: string): boolean {
  return ALLOWED_DOCUMENT_MIMES.has(mime.toLowerCase())
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export const DOCUMENT_LIST_SELECT = {
  id: true,
  kind: true,
  title: true,
  fileName: true,
  mimeType: true,
  sizeBytes: true,
  notes: true,
  uploadedBy: true,
  createdAt: true,
} as const

export function safeDownloadName(name: string): string {
  return name.replace(/[\r\n"]/g, '_').slice(0, 180) || 'document'
}
