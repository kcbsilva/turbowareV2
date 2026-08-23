import type { I18n, Lang } from './types'

export function t(en: string, pt: string, fr: string): I18n {
  return { en, pt, fr }
}

export function pick(lang: Lang, map: I18n): string {
  return map[lang] || map.en
}

export function trail(en: string[], pt: string[], fr: string[]): I18n[] {
  return en.map((_, i) => t(en[i], pt[i] ?? en[i], fr[i] ?? en[i]))
}
