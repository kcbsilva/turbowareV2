'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Button } from '@/components/ui/button'
import { Kbd, KbdGroup } from '@/components/ui/kbd'
import { SearchIcon } from 'lucide-react'
import {
  ARTICLES,
  CATEGORIES,
  pick,
  wikiCopy,
} from '../_content'
import { useWikiLang } from './WikiLang'

export function WikiSearch() {
  const { lang } = useWikiLang()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        className="h-8 w-full max-w-xs justify-between gap-3 px-2.5 text-muted-foreground sm:w-72"
      >
        <span className="flex min-w-0 items-center gap-2 leading-none">
          <SearchIcon className="size-3.5" />
          <span className="truncate">{pick(lang, wikiCopy.search)}</span>
        </span>
        <KbdGroup className="hidden sm:inline-flex">
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title={pick(lang, wikiCopy.searchTitle)}
        description={pick(lang, wikiCopy.search)}
        className="sm:max-w-lg"
      >
        <Command className="[&_[data-slot=command-item]>svg:last-child]:hidden">
          <CommandInput placeholder={pick(lang, wikiCopy.search)} />
          <CommandList>
            <CommandEmpty>{pick(lang, wikiCopy.searchEmpty)}</CommandEmpty>
            {CATEGORIES.map((cat) => {
              const items = ARTICLES.filter((a) => a.category === cat.id)
              if (items.length === 0) return null
              return (
                <CommandGroup key={cat.id} heading={pick(lang, cat.title)}>
                  {items.map((article) => (
                    <CommandItem
                      key={article.slug}
                      value={`${pick(lang, article.title)} ${pick(lang, article.summary)}`}
                      onSelect={() => {
                        setOpen(false)
                        router.push(`/turboisp/wiki/${article.slug}`)
                      }}
                    >
                      <span className="flex min-w-0 flex-col">
                        <span className="truncate">{pick(lang, article.title)}</span>
                        <span className="truncate text-xs text-muted-foreground">
                          {pick(lang, article.summary)}
                        </span>
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )
            })}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  )
}
