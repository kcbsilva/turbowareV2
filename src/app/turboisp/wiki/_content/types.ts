import type { Lang } from '../../site/_components/constants'

export type { Lang }

export type I18n = Record<Lang, string>

export type Block =
  | { type: 'p'; text: I18n }
  | { type: 'h2'; id: string; text: I18n }
  | { type: 'steps'; items: { title: I18n; body: I18n }[] }
  | { type: 'callout'; kind: 'tip' | 'warn' | 'need'; text: I18n }
  | { type: 'path'; trail: I18n[] }
  | { type: 'ul'; items: I18n[] }
  | { type: 'related'; slugs: string[] }

export type CategoryId =
  | 'start'
  | 'network'
  | 'map'
  | 'plans'
  | 'subscribers'
  | 'billing'
  | 'fiscal'
  | 'field'
  | 'inventory'
  | 'provisioning'
  | 'noc'
  | 'portal'
  | 'reports'
  | 'settings'

export type Article = {
  slug: string
  category: CategoryId
  minutes: number
  title: I18n
  summary: I18n
  body: Block[]
}

export type Category = {
  id: CategoryId
  title: I18n
}

export type Job = {
  slug: string
  label: I18n
  blurb: I18n
}
