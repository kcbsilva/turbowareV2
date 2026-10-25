export type SiteLang = 'en' | 'pt' | 'fr' | 'es'

export type Copy = Record<SiteLang, string>

export function c(en: string, pt: string, fr: string, es: string): Copy {
  return { en, pt, fr, es }
}

export function textOf(lang: SiteLang, value: string | Copy): string {
  return typeof value === 'string' ? value : value[lang]
}

/** App default is Brazilian Portuguese, matching the marketing language switch. */
export function matchSiteLang(header: string | null | undefined): SiteLang {
  if (!header?.trim()) return 'pt'
  const ranked = header
    .split(',')
    .map((part) => {
      const [rawTag, ...params] = part.trim().split(';')
      const qParam = params.map((item) => item.trim()).find((item) => item.startsWith('q='))
      const quality = qParam ? Number(qParam.slice(2)) : 1
      return {
        tag: rawTag.trim().toLowerCase(),
        quality: Number.isFinite(quality) ? quality : 0,
      }
    })
    .filter((item) => item.tag && item.quality > 0)
    .sort((a, b) => b.quality - a.quality)

  for (const { tag } of ranked) {
    if (tag.startsWith('pt')) return 'pt'
    if (tag.startsWith('fr')) return 'fr'
    if (tag.startsWith('es')) return 'es'
    if (tag.startsWith('en')) return 'en'
  }
  return 'pt'
}

export function siteHtmlLang(lang: SiteLang): string {
  if (lang === 'pt') return 'pt-BR'
  if (lang === 'fr') return 'fr-CA'
  return lang
}

export const ROOT_DESCRIPTION = c(
  'Turboware builds operations software for ISPs and infrastructure teams: billing, network, conversations, and field work in one place.',
  'A Turboware faz software de operação para provedores e equipes de infraestrutura: faturamento, rede, atendimento e campo no mesmo lugar.',
  'Turboware conçoit des logiciels d’exploitation pour les FAI et les équipes d’infrastructure: facturation, réseau, conversations et travail sur le terrain au même endroit.',
  'Turboware hace software de operación para ISPs y equipos de infraestructura: facturación, red, atención y campo en un solo lugar.',
)
