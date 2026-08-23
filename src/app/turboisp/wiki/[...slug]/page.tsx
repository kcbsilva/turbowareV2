import type { Metadata } from 'next'
import { articleSlugs, getArticle } from '../_content'
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
  if (!article) return { title: 'Wiki' }
  return {
    title: article.title.en,
    description: article.summary.en,
  }
}

export default async function WikiArticlePage({ params }: PageProps) {
  const { slug } = await params
  const article = getArticle(slug.join('/'))
  if (!article) return <WikiNotFound />
  return <WikiArticle slug={article.slug} />
}
