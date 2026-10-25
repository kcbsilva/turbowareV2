import type { I18n, Lang } from './types'

export function t(en: string, pt: string, fr: string, es: string): I18n {
  return { en, pt, fr, es }
}

export function pick(lang: Lang, map: I18n): string {
  return map[lang]
}

export function trail(en: string[], pt: string[], fr: string[], es: string[]): I18n[] {
  if (pt.length !== en.length || fr.length !== en.length || es.length !== en.length) {
    throw new Error(`Menu trail length mismatch (${en.length}/${pt.length}/${fr.length}/${es.length})`)
  }
  return en.map((_, i) => t(en[i]!, pt[i]!, fr[i]!, es[i]!))
}
