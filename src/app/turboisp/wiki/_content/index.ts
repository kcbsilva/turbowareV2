import { CATEGORIES, JOBS } from './catalog'
import { startAndNetwork } from './start-network'
import { mapPlansCustomers } from './map-customers'
import { billingFiscal } from './billing'
import { opsArticles } from './ops'
import type { Article, CategoryId } from './types'

export { CATEGORIES, JOBS }
export type { Article, CategoryId, I18n, Lang, Block, Category, Job } from './types'
export { pick, t } from './helpers'
export { wikiCopy } from './strings'

export const ARTICLES: Article[] = [
  ...startAndNetwork,
  ...mapPlansCustomers,
  ...billingFiscal,
  ...opsArticles,
]

const bySlug = new Map(ARTICLES.map((a) => [a.slug, a]))

export function getArticle(slug: string): Article | undefined {
  return bySlug.get(slug)
}

export function articlesIn(category: CategoryId): Article[] {
  return ARTICLES.filter((a) => a.category === category)
}

export function articleSlugs(): string[] {
  return ARTICLES.map((a) => a.slug)
}

export function flattenArticleText(article: Article, lang: 'en' | 'pt' | 'fr'): string {
  const parts = [article.title[lang], article.summary[lang]]
  for (const block of article.body) {
    if (block.type === 'p' || block.type === 'h2' || block.type === 'callout') {
      parts.push(block.text[lang])
    } else if (block.type === 'steps') {
      for (const item of block.items) {
        parts.push(item.title[lang], item.body[lang])
      }
    } else if (block.type === 'ul') {
      for (const item of block.items) parts.push(item[lang])
    } else if (block.type === 'path') {
      for (const item of block.trail) parts.push(item[lang])
    }
  }
  return parts.join(' ')
}
