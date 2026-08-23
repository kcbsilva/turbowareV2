'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import {
  ARTICLES,
  CATEGORIES,
  pick,
  wikiCopy,
  type CategoryId,
} from '../_content'
import { useWikiLang } from './WikiLang'
import { useEffect, useState } from 'react'

function categoryFromPath(pathname: string): CategoryId | 'home' {
  const slug = pathname.replace(/^\/turboisp\/wiki\/?/, '').split('/')[0]
  if (!slug) return 'home'
  return ARTICLES.find((a) => a.slug === slug)?.category ?? 'home'
}

export function WikiNav({ onNavigate }: { onNavigate?: () => void }) {
  const { lang } = useWikiLang()
  const pathname = usePathname()
  const active = categoryFromPath(pathname)
  const [open, setOpen] = useState<string[]>(active === 'home' ? ['start'] : [active])

  useEffect(() => {
    if (active === 'home') return
    setOpen((prev) => (prev.includes(active) ? prev : [...prev, active]))
  }, [active])

  return (
    <ScrollArea className="h-full">
      <div className="pr-3 pb-8">
        <p className="mb-2 px-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {pick(lang, wikiCopy.browse)}
        </p>
        <Accordion
          multiple
          value={open}
          onValueChange={(value) => setOpen(value as string[])}
        >
          {CATEGORIES.map((cat) => {
            const items = ARTICLES.filter((a) => a.category === cat.id)
            return (
              <AccordionItem key={cat.id} value={cat.id} className="border-border/70">
                <AccordionTrigger className="px-2 py-2 text-[13px] hover:no-underline">
                  <span className="flex w-full items-center justify-between gap-2 pr-2">
                    {pick(lang, cat.title)}
                    <span className="text-[11px] font-normal text-muted-foreground">
                      {items.length}
                    </span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pb-2">
                  <ul className="wiki-fiber ml-2 space-y-0.5 pl-4">
                    {items.map((article) => {
                      const href = `/turboisp/wiki/${article.slug}`
                      const isActive = pathname === href
                      return (
                        <li key={article.slug} className="relative py-0.5">
                          <span className="wiki-splice" aria-hidden />
                          <Link
                            href={href}
                            onClick={onNavigate}
                            className={cn(
                              'block rounded-md px-2 py-1 text-[13px] leading-snug transition-colors',
                              isActive
                                ? 'bg-accent font-medium text-accent-foreground'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                            )}
                          >
                            {pick(lang, article.title)}
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      </div>
    </ScrollArea>
  )
}
