import { describe, expect, it } from 'vitest'
import { ARTICLES, CATEGORIES, JOBS, articleSlugs, getArticle } from './index'

describe('wiki catalog', () => {
  it('has unique slugs', () => {
    const slugs = articleSlugs()
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('every job points at a real article', () => {
    for (const job of JOBS) {
      expect(getArticle(job.slug), job.slug).toBeTruthy()
    }
  })

  it('every related slug exists', () => {
    for (const article of ARTICLES) {
      for (const block of article.body) {
        if (block.type !== 'related') continue
        for (const slug of block.slugs) {
          expect(getArticle(slug), `${article.slug} → ${slug}`).toBeTruthy()
        }
      }
    }
  })

  it('every article category is in the nav', () => {
    const ids = new Set(CATEGORIES.map((c) => c.id))
    for (const article of ARTICLES) {
      expect(ids.has(article.category), article.slug).toBe(true)
    }
  })
})
