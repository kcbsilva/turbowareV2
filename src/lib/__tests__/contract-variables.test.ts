import { describe, expect, it } from 'vitest'
import {
  contractVariableValues,
  interpolateContractText,
  tokenFor,
} from '../contract-variables'

describe('interpolateContractText', () => {
  it('replaces known tokens and leaves unknown ones', () => {
    const html = '<p>Hello {{client.name}} of {{client.company}} {{unknown.x}}</p>'
    expect(interpolateContractText(html, {
      'client.name': 'Ada',
      'client.company': 'Lovelace Ltd',
    })).toBe('<p>Hello Ada of Lovelace Ltd {{unknown.x}}</p>')
  })

  it('keeps blank known values as tokens', () => {
    expect(interpolateContractText('CNPJ {{client.cnpj}}', { 'client.cnpj': '' })).toBe('CNPJ {{client.cnpj}}')
  })

  it('escapes values interpolated into HTML', () => {
    expect(interpolateContractText(
      '<p>{customer_legal_name}</p>',
      { customer_legal_name: '<img src=x onerror=alert(1)>' },
    )).toBe('<p>&lt;img src=x onerror=alert(1)&gt;</p>')
  })

  it('replaces single-brace legal tokens', () => {
    expect(interpolateContractText(
      'Between {provider_legal_name} and {customer_legal_name}',
      { provider_legal_name: 'TurboISP Ltd', customer_legal_name: 'Acme ISP' },
    )).toBe('Between TurboISP Ltd and Acme ISP')
  })
})

describe('tokenFor', () => {
  it('uses double braces for dotted keys', () => {
    expect(tokenFor('client.name')).toBe('{{client.name}}')
  })

  it('uses single braces for legal keys', () => {
    expect(tokenFor('customer_legal_name')).toBe('{customer_legal_name}')
  })
})

describe('contractVariableValues', () => {
  it('maps client and contract fields', () => {
    const values = contractVariableValues({
      client: { name: 'Ada', company: 'Acme', email: 'a@x.com', phone: '1', cnpj: '00', subdomain: 'ada' },
      contract: { title: 'MSA', number: 'CTR-202609-ABCDEF', startsAt: '2026-09-13' },
      today: new Date('2026-09-13T12:00:00.000Z'),
    })
    expect(values['client.name']).toBe('Ada')
    expect(values['contract.number']).toBe('CTR-202609-ABCDEF')
    expect(values['contract.startsAt']).toBe('2026-09-13')
    expect(values.today).toBe('2026-09-13')
    expect(values.effective_date).toBe('2026-09-13')
    expect(values.customer_legal_name).toBe('Acme')
  })

  it('prefers collected contract terms', () => {
    const values = contractVariableValues({
      client: {
        name: 'Ada',
        company: 'Acme',
        contractTerms: { customer_legal_name: 'Acme Telecom Ltda', currency: 'BRL' },
      },
      providerTerms: { provider_legal_name: 'TurboISP Ltd' },
      contract: { title: 'MSA', number: 'CTR-1', startsAt: '2026-09-13' },
      today: new Date('2026-09-13T12:00:00.000Z'),
    })
    expect(values.customer_legal_name).toBe('Acme Telecom Ltda')
    expect(values.currency).toBe('BRL')
    expect(values.provider_legal_name).toBe('TurboISP Ltd')
    expect(values.signing_place_date).toBe('2026-09-13')
  })
})
