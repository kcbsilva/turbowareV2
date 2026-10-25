export type Lang = 'en' | 'pt' | 'fr' | 'es'

export const LANGS: { code: Lang; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'pt', label: 'PT' },
  { code: 'fr', label: 'FR' },
  { code: 'es', label: 'ES' },
]

export const ISP_CYAN = '#1AABF0'
export const ISP_NAVY = '#0a1428'

export function pick<T extends Partial<Record<Lang, string>> & Record<'en', string>>(
  map: T,
  lang: Lang,
): string {
  return map[lang] || map.en
}
