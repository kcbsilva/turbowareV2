import type { Metadata } from 'next'
import { requestSiteLang } from '@/lib/request-site-lang'
import { articleSlugs, getArticle, wikiCopy } from '../_content'
import { WikiArticle } from '../_components/WikiArticle'
import { WikiNotFound } from '../_components/WikiNotFound'

type PageProps = {
  params: Promise<{ slug: string[] }>
}

export function generateStaticParams() {
  return articleSlugs().map((slug) => ({ slug: [slug] }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const article = getArticle(slug.join('/'))
  const lang = await requestSiteLang()
  if (!article) return { title: 'Wiki', description: wikiCopy.indexDescription[lang] }
  return {
    title: 'Wiki',
    description: article.summary[lang],
  }
}

export default async function WikiArticlePage({ params }: PageProps) {
  const { slug } = await params
  const article = getArticle(slug.join('/'))
  if (!article) return <WikiNotFound />
  return <WikiArticle slug={article.slug} />
}
