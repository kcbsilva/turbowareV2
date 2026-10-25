import type { I18n, Lang } from './types'

/** Fourth argument is optional Spanish. Omitted copy falls back to English. */
export function t(en: string, pt: string, fr: string, es?: string): I18n {
  return { en, pt, fr, es: es || en }
}

export function pick(lang: Lang, map: Partial<I18n> & Pick<I18n, 'en'>): string {
  return map[lang] || map.en
}

export function trail(en: string[], pt: string[], fr: string[], es?: string[]): I18n[] {
  return en.map((_, i) => t(en[i], pt[i] ?? en[i], fr[i] ?? en[i], es?.[i] ?? en[i]))
}
