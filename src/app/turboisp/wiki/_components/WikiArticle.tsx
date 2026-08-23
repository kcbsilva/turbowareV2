'use client'

import Link from 'next/link'
import { AlertTriangleIcon, LightbulbIcon, ListChecksIcon } from 'lucide-react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  CATEGORIES,
  getArticle,
  pick,
  wikiCopy,
  type Article,
  type Block,
} from '../_content'
import { useWikiLang } from './WikiLang'

function PathTrail({ trail }: { trail: Block & { type: 'path' } }) {
  const { lang } = useWikiLang()
  return (
    <p className="wiki-mono flex flex-wrap items-center gap-1.5 rounded-lg border bg-muted/40 px-3 py-2 text-[12px] text-muted-foreground">
      {trail.trail.map((item, i) => (
        <span key={`${item.en}-${i}`} className="inline-flex items-center gap-1.5">
          {i > 0 && <span className="text-border">›</span>}
          <span className={i === trail.trail.length - 1 ? 'text-foreground' : undefined}>
            {pick(lang, item)}
          </span>
        </span>
      ))}
    </p>
  )
}

function Callout({ block }: { block: Extract<Block, { type: 'callout' }> }) {
  const { lang } = useWikiLang()
  const Icon = block.kind === 'warn' ? AlertTriangleIcon : block.kind === 'need' ? ListChecksIcon : LightbulbIcon
  const title =
    block.kind === 'warn' ? wikiCopy.warn : block.kind === 'need' ? wikiCopy.need : wikiCopy.tip
  return (
    <Alert className={block.kind === 'warn' ? 'border-destructive/30' : undefined}>
      <Icon />
      <AlertTitle>{pick(lang, title)}</AlertTitle>
      <AlertDescription>{pick(lang, block.text)}</AlertDescription>
    </Alert>
  )
}

function Body({ article }: { article: Article }) {
  const { lang } = useWikiLang()
  return (
    <div className="space-y-6">
      {article.body.map((block, i) => {
        const key = `${block.type}-${i}`
        if (block.type === 'p') {
          return (
            <p key={key} className="text-[15px] leading-relaxed text-foreground/90">
              {pick(lang, block.text)}
            </p>
          )
        }
        if (block.type === 'h2') {
          return (
            <h2 key={key} id={block.id} className="scroll-mt-24 text-lg font-semibold">
              {pick(lang, block.text)}
            </h2>
          )
        }
        if (block.type === 'path') return <PathTrail key={key} trail={block} />
        if (block.type === 'steps') {
          return (
            <ol key={key} className="wiki-fiber relative ml-1 space-y-6 pl-6">
              {block.items.map((item, idx) => (
                <li key={item.title.en} className="relative">
                  <span className="wiki-splice" aria-hidden />
                  <p className="text-[11px] font-medium uppercase tracking-wider text-primary">
                    {pick(lang, wikiCopy.step)} {idx + 1}
                  </p>
                  <h3 className="mt-0.5 text-[15px] font-medium">{pick(lang, item.title)}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {pick(lang, item.body)}
                  </p>
                </li>
              ))}
            </ol>
          )
        }
        if (block.type === 'callout') return <Callout key={key} block={block} />
        if (block.type === 'ul') {
          return (
            <ul key={key} className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
              {block.items.map((item) => (
                <li key={item.en}>{pick(lang, item)}</li>
              ))}
            </ul>
          )
        }
        if (block.type === 'related') {
          const related = block.slugs.map((slug) => getArticle(slug)).filter(Boolean) as Article[]
          if (related.length === 0) return null
          return (
            <div key={key} className="pt-2">
              <Separator className="mb-6" />
              <p className="mb-3 text-sm font-medium">{pick(lang, wikiCopy.related)}</p>
              <div className="flex flex-wrap gap-2">
                {related.map((next) => (
                  <Link
                    key={next.slug}
                    href={`/turboisp/wiki/${next.slug}`}
                    className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
                  >
                    {pick(lang, next.title)}
                  </Link>
                ))}
              </div>
            </div>
          )
        }
        return null
      })}
    </div>
  )
}

export function WikiArticle({ slug }: { slug: string }) {
  const { lang } = useWikiLang()
  const article = getArticle(slug)
  if (!article) return null

  const category = CATEGORIES.find((c) => c.id === article.category)
  const toc = article.body.filter((b): b is Extract<Block, { type: 'h2' }> => b.type === 'h2')

  return (
    <div className="flex gap-10">
      <article className="min-w-0 max-w-2xl flex-1">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href="/turboisp/wiki" />}>
                {pick(lang, wikiCopy.brand)}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{category ? pick(lang, category.title) : article.category}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-wrap items-center gap-2">
          {category && <Badge variant="secondary">{pick(lang, category.title)}</Badge>}
          <Badge variant="outline">
            {article.minutes} {pick(lang, wikiCopy.minutes)}
          </Badge>
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">{pick(lang, article.title)}</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
          {pick(lang, article.summary)}
        </p>
        <Separator className="my-8" />
        <Body article={article} />
      </article>

      {toc.length > 0 && (
        <nav className="sticky top-24 hidden w-48 shrink-0 self-start xl:block">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {pick(lang, wikiCopy.onThisPage)}
          </p>
          <ul className="space-y-1.5 text-[13px]">
            {toc.map((h) => (
              <li key={h.id}>
                <a href={`#${h.id}`} className="text-muted-foreground hover:text-foreground">
                  {pick(lang, h.text)}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  )
}
