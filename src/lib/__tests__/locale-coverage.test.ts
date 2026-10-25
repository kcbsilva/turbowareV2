import { describe, expect, it } from 'vitest'
import { adminLocales } from '../admin-i18n'
import { adminUi } from '../admin-ui-copy'
import { signupCopy, SIGNUP_LOCALES } from '@/app/turboisp/register/signup-translations'
import { TurboispPageTranslations } from '@/app/turboisp/site/translation'
import { pricingCopy } from '@/app/turboisp/pricing/copy'
import { pausedCopy } from '@/app/turboisp/register/paused-copy'
import { turboIspTermsAndConditionsEn } from '@/app/turboisp/register/terms-and-conditions/tc-en'
import { turboIspTermsAndConditionsPt } from '@/app/turboisp/register/terms-and-conditions/tc-pt'
import { turboIspTermsAndConditionsFr } from '@/app/turboisp/register/terms-and-conditions/tc-fr'
import { turboIspTermsAndConditionsEs } from '@/app/turboisp/register/terms-and-conditions/tc-es'
import { ARTICLES, CATEGORIES, JOBS, wikiCopy } from '@/app/turboisp/wiki/_content'
import { adminEs } from '../admin-i18n-es'
import { adminFr } from '../admin-i18n-fr'

const SITE_LANGS = ['en', 'pt', 'fr', 'es'] as const
const FR_SPACE_BEFORE_PUNCT = / [?:;!]/
const PLACEHOLDER = /\{[a-zA-Z0-9_]+\}/g

function placeholders(value: string): string[] {
  return [...value.matchAll(PLACEHOLDER)].map((match) => match[0]).sort()
}

function assertBundle(
  name: string,
  locales: Record<string, Record<string, string>>,
  codes: readonly string[],
) {
  const base = Object.keys(locales[codes[0]!] ?? {}).sort()
  expect(base.length, `${name} has no keys`).toBeGreaterThan(0)
  for (const code of codes) {
    const keys = Object.keys(locales[code] ?? {}).sort()
    expect(keys, `${name} ${code} keys`).toEqual(base)
    for (const key of base) {
      const value = locales[code]?.[key] ?? ''
      expect(value.trim(), `${name} ${code} ${key} empty`).not.toBe('')
      expect(placeholders(value), `${name} ${code} ${key} placeholders`).toEqual(
        placeholders(locales[codes[0]!]![key]!),
      )
      if (code === 'fr') {
        expect(value, `${name} fr ${key} space before punctuation`).not.toMatch(FR_SPACE_BEFORE_PUNCT)
      }
    }
  }
}

function walkI18n(value: unknown, path: string, problems: string[]) {
  if (!value || typeof value !== 'object') return
  if (Array.isArray(value)) {
    value.forEach((item, index) => walkI18n(item, `${path}[${index}]`, problems))
    return
  }
  const record = value as Record<string, unknown>
  const keys = Object.keys(record)
  const isMap = SITE_LANGS.every((lang) => typeof record[lang] === 'string')
    && keys.every((key) => (SITE_LANGS as readonly string[]).includes(key))
  if (isMap) {
    const en = record.en as string
    for (const lang of SITE_LANGS) {
      const text = record[lang] as string
      if (!text.trim()) problems.push(`${path}.${lang} empty`)
      if (placeholders(text).join() !== placeholders(en).join()) {
        problems.push(`${path}.${lang} placeholders`)
      }
      if (lang === 'fr' && FR_SPACE_BEFORE_PUNCT.test(text)) {
        problems.push(`${path}.fr space before punctuation`)
      }
    }
    return
  }
  for (const [key, child] of Object.entries(record)) {
    if (['slug', 'id', 'category', 'minutes', 'type', 'kind'].includes(key)) continue
    walkI18n(child, `${path}.${key}`, problems)
  }
}

describe('locale coverage', () => {
  it('keeps signup keys aligned', () => {
    assertBundle('signup', signupCopy, SIGNUP_LOCALES)
  })

  it('keeps marketing translation keys aligned', () => {
    const locales = Object.fromEntries(SITE_LANGS.map((lang) => [lang, {} as Record<string, string>]))
    for (const [key, value] of Object.entries(TurboispPageTranslations)) {
      for (const lang of SITE_LANGS) locales[lang]![key] = value[lang]
    }
    assertBundle('site', locales, SITE_LANGS)
  })

  it('keeps pricing and paused-signup copy aligned', () => {
    const pricing = Object.fromEntries(SITE_LANGS.map((lang) => [lang, {} as Record<string, string>]))
    for (const [key, value] of Object.entries(pricingCopy)) {
      for (const lang of SITE_LANGS) pricing[lang]![key] = value[lang]
    }
    assertBundle('pricing', pricing, SITE_LANGS)

    const paused = Object.fromEntries(SITE_LANGS.map((lang) => [lang, {} as Record<string, string>]))
    for (const [key, value] of Object.entries(pausedCopy)) {
      for (const lang of SITE_LANGS) paused[lang]![key] = value[lang]
    }
    assertBundle('paused', paused, SITE_LANGS)
  })

  it('keeps wiki articles, catalog, and chrome aligned', () => {
    const problems: string[] = []
    walkI18n(ARTICLES, 'articles', problems)
    walkI18n(CATEGORIES, 'categories', problems)
    walkI18n(JOBS, 'jobs', problems)
    walkI18n(wikiCopy, 'wikiCopy', problems)
    expect(problems).toEqual([])
  })

  it('keeps terms in all four languages', () => {
    const terms = {
      en: turboIspTermsAndConditionsEn,
      pt: turboIspTermsAndConditionsPt,
      fr: turboIspTermsAndConditionsFr,
      es: turboIspTermsAndConditionsEs,
    }
    for (const [lang, text] of Object.entries(terms)) {
      expect(text.trim().length, lang).toBeGreaterThan(400)
    }
    expect(terms.fr).not.toMatch(FR_SPACE_BEFORE_PUNCT)
    expect(terms.pt).toMatch(/[áàâãéêíóôõúç]/i)
    expect(terms.fr).toMatch(/[àâéèêëïîôùûüç]/i)
    expect(terms.es).toMatch(/[áéíóúñ]/i)
    expect(terms.es).not.toMatch(/M[eé]xico/i)
  })

  it('keeps admin dictionaries aligned, with no English fallback gaps', () => {
    assertBundle('admin-ui', adminUi, ['en', 'pt-BR', 'fr', 'es'])
    const core = {
      en: adminLocales.en,
      'pt-BR': adminLocales['pt-BR'],
      fr: adminFr,
      es: adminEs,
    }
    assertBundle('admin', core, ['en', 'pt-BR', 'fr', 'es'])
  })
})
