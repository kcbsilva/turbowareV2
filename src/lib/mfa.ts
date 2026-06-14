import crypto from 'crypto'
import { authenticator } from 'otplib'
import { getJwtSecret } from '@/lib/auth'

const APP_NAME = 'Turboware Admin'

function encryptionKey(): Buffer {
  return crypto.scryptSync(Buffer.from(getJwtSecret()), 'tw-mfa-v1', 32)
}

export function encryptTotpSecret(plain: string): string {
  const key = encryptionKey()
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  const encrypted = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return `${iv.toString('base64url')}.${tag.toString('base64url')}.${encrypted.toString('base64url')}`
}

export function decryptTotpSecret(stored: string): string | null {
  try {
    const [ivB64, tagB64, dataB64] = stored.split('.')
    if (!ivB64 || !tagB64 || !dataB64) return null
    const key = encryptionKey()
    const iv = Buffer.from(ivB64, 'base64url')
    const tag = Buffer.from(tagB64, 'base64url')
    const data = Buffer.from(dataB64, 'base64url')
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
    decipher.setAuthTag(tag)
    return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8')
  } catch {
    return null
  }
}

export function generateTotpSecret(): string {
  return authenticator.generateSecret()
}

export function totpKeyUri(email: string, secret: string): string {
  return authenticator.keyuri(email, APP_NAME, secret)
}

export function verifyTotpCode(secret: string, code: string): boolean {
  const token = code.replace(/\s/g, '')
  if (!/^\d{6}$/.test(token)) return false
  return authenticator.verify({ token, secret })
}
