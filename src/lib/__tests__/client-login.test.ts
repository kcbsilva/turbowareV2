import { describe, expect, it } from 'vitest'
import {
  clientLoginWhere,
  formatLoginIdentifierInput,
  loginIdentifierFromBody,
  looksLikeEmail,
} from '../client-login'

describe('looksLikeEmail', () => {
  it('accepts a normal email', () => {
    expect(looksLikeEmail('ops@isp.com')).toBe(true)
    expect(looksLikeEmail('  OPS@isp.com  ')).toBe(true)
  })

  it('rejects business numbers', () => {
    expect(looksLikeEmail('12.345.678/0001-90')).toBe(false)
    expect(looksLikeEmail('12345678000190')).toBe(false)
  })
})

describe('formatLoginIdentifierInput', () => {
  it('masks a CNPJ while typing', () => {
    expect(formatLoginIdentifierInput('12345678000190')).toBe('12.345.678/0001-90')
  })

  it('leaves emails alone', () => {
    expect(formatLoginIdentifierInput('ops@isp.com')).toBe('ops@isp.com')
  })
})

describe('loginIdentifierFromBody', () => {
  it('prefers identifier, then email, then cnpj', () => {
    expect(loginIdentifierFromBody({ identifier: 'a@b.c', email: 'x@y.z', cnpj: '1' })).toBe('a@b.c')
    expect(loginIdentifierFromBody({ email: 'x@y.z' })).toBe('x@y.z')
    expect(loginIdentifierFromBody({ cnpj: '12.345.678/0001-90' })).toBe('12.345.678/0001-90')
  })
})

describe('clientLoginWhere', () => {
  it('looks up emails case-insensitively', () => {
    expect(clientLoginWhere('Ops@ISP.com')).toEqual({
      email: { equals: 'Ops@ISP.com', mode: 'insensitive' },
    })
  })

  it('matches formatted or digit-only business numbers', () => {
    expect(clientLoginWhere('12.345.678/0001-90')).toEqual({
      OR: [{ cnpj: '12.345.678/0001-90' }, { cnpj: '12345678000190' }],
    })
  })

  it('returns null when blank', () => {
    expect(clientLoginWhere('   ')).toBeNull()
  })
})
