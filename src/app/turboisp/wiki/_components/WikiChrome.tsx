'use client'

import Link from 'next/link'
import Image from 'next/image'
import { BookOpenIcon, MenuIcon } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { TooltipProvider } from '@/components/ui/tooltip'
import { pick, wikiCopy } from '../_content'
import { LANGS, useWikiLang, WikiProviders } from './WikiLang'
import { WikiNav } from './WikiNav'
import { WikiSearch } from './WikiSearch'
import logo from '../../assets/TurboISP-logo.png'
import { useState, type ReactNode } from 'react'

function WikiHeader() {
  const { lang, setLang } = useWikiLang()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1440px] items-center gap-3 px-4 sm:px-6">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger
            render={<Button variant="ghost" size="icon-sm" className="lg:hidden" />}
          >
            <MenuIcon className="size-4" />
            <span className="sr-only">{pick(lang, wikiCopy.openMenu)}</span>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0">
            <SheetHeader className="border-b">
              <SheetTitle>{pick(lang, wikiCopy.contents)}</SheetTitle>
            </SheetHeader>
            <div className="h-[calc(100svh-4.5rem)] px-2 pt-2">
              <WikiNav onNavigate={() => setMobileOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>

        <Link href="/turboisp/wiki" className="flex shrink-0 items-center gap-2">
          <Image src={logo} alt="TurboISP" className="h-8 w-auto" height={32} />
          <span className="hidden items-center gap-1.5 text-sm font-medium leading-none sm:flex">
            <BookOpenIcon className="size-3.5 text-primary" />
            {pick(lang, wikiCopy.brand)}
          </span>
        </Link>

        <div className="ml-auto flex min-w-0 flex-1 items-center justify-end gap-2 sm:ml-4">
          <WikiSearch />
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
              {lang.toUpperCase()}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-28">
              {LANGS.map(({ code, label }) => (
                <DropdownMenuItem key={code} onClick={() => setLang(code)}>
                  {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Link href="/turboisp/site" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}>
            {pick(lang, wikiCopy.site)}
          </Link>
          <Link
            href="/admin/login"
            className={cn(buttonVariants({ size: 'sm' }), 'hidden sm:inline-flex')}
          >
            {pick(lang, wikiCopy.signIn)}
          </Link>
        </div>
      </div>
    </header>
  )
}

function WikiChromeInner({ children }: { children: ReactNode }) {
  return (
    <TooltipProvider delay={200}>
      <div className="flex min-h-full flex-col">
        <WikiHeader />
        <div className="mx-auto flex w-full max-w-[1440px] flex-1">
          <aside className="sticky top-14 hidden h-[calc(100svh-3.5rem)] w-64 shrink-0 border-r lg:block">
            <div className="h-full py-4 pl-4">
              <WikiNav />
            </div>
          </aside>
          <main className="min-w-0 flex-1 px-4 py-8 sm:px-8 lg:px-10">{children}</main>
        </div>
      </div>
    </TooltipProvider>
  )
}

export function WikiChrome({ children }: { children: ReactNode }) {
  return (
    <WikiProviders>
      <WikiChromeInner>{children}</WikiChromeInner>
    </WikiProviders>
  )
}
