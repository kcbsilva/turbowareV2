import { describe, expect, it } from 'vitest'
import { contractVariableValues, interpolateContractText } from '../contract-variables'

describe('interpolateContractText', () => {
  it('replaces known tokens and leaves unknown ones', () => {
    const html = '<p>Hello {{client.name}} of {{client.company}} {{unknown.x}}</p>'
    expect(interpolateContractText(html, {
      'client.name': 'Ada',
      'client.company': 'Lovelace Ltd',
    })).toBe('<p>Hello Ada of Lovelace Ltd {{unknown.x}}</p>')
  })

  it('uses an em dash for blank known values', () => {
    expect(interpolateContractText('CNPJ {{client.cnpj}}', { 'client.cnpj': '' })).toBe('CNPJ —')
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
  })
})
