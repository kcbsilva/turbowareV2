'use client'

import Link from 'next/link'
import {
  CableIcon,
  FileTextIcon,
  MapIcon,
  RadioIcon,
  UserPlusIcon,
  WarehouseIcon,
  WrenchIcon,
} from 'lucide-react'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  ARTICLES,
  CATEGORIES,
  JOBS,
  pick,
  wikiCopy,
} from '../_content'
import { useWikiLang } from './WikiLang'

const JOB_ICONS = [WarehouseIcon, RadioIcon, UserPlusIcon, FileTextIcon, CableIcon, WrenchIcon, MapIcon]

export function WikiHome() {
  const { lang } = useWikiLang()

  return (
    <div className="mx-auto max-w-3xl">
      <p className="wiki-mono text-[11px] font-medium uppercase tracking-[0.18em] text-primary">
        TurboISP · {pick(lang, wikiCopy.brand)}
      </p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
        {pick(lang, wikiCopy.homeTitle)}
      </h1>
      <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
        {pick(lang, wikiCopy.homeLead)}
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {JOBS.map((job, i) => {
          const Icon = JOB_ICONS[i] ?? FileTextIcon
          const article = ARTICLES.find((a) => a.slug === job.slug)
          return (
            <Link key={job.slug} href={`/turboisp/wiki/${job.slug}`} className="group">
              <Card size="sm" className="h-full transition-colors group-hover:ring-primary/30">
                <CardHeader className="flex flex-col items-start gap-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-secondary text-primary">
                    <Icon className="size-4" />
                  </span>
                  <div className="space-y-1">
                    <CardTitle className="text-[15px]">{pick(lang, job.label)}</CardTitle>
                    <CardDescription>{pick(lang, job.blurb)}</CardDescription>
                  </div>
                  {article && (
                    <Badge variant="outline">
                      {article.minutes} {pick(lang, wikiCopy.minutes)}
                    </Badge>
                  )}
                </CardHeader>
              </Card>
            </Link>
          )
        })}
      </div>

      <Separator className="my-10" />

      <h2 className="text-sm font-medium text-muted-foreground">{pick(lang, wikiCopy.browse)}</h2>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {CATEGORIES.map((cat) => {
          const count = ARTICLES.filter((a) => a.category === cat.id).length
          const first = ARTICLES.find((a) => a.category === cat.id)
          if (!first) return null
          return (
            <Link
              key={cat.id}
              href={`/turboisp/wiki/${first.slug}`}
              className={cn(
                buttonVariants({ variant: 'outline' }),
                'h-auto justify-between px-3 py-2.5',
              )}
            >
              <span>{pick(lang, cat.title)}</span>
              <span className="text-xs font-normal text-muted-foreground">
                {count} {pick(lang, wikiCopy.guides)}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
