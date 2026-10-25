export type Lang = 'en' | 'pt' | 'fr' | 'es'

export const LANGS: { code: Lang; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'pt', label: 'PT' },
  { code: 'fr', label: 'FR' },
  { code: 'es', label: 'ES' },
]

export const ISP_CYAN = '#1AABF0'
export const ISP_NAVY = '#0a1428'

export function pick(map: Record<Lang, string>, lang: Lang): string {
  return map[lang]
}

export const NUMBER_LOCALE: Record<Lang, string> = {
  en: 'en-US',
  pt: 'pt-BR',
  fr: 'fr-CA',
  es: 'es-419',
}
