'use client'

import Link from 'next/link'
import Image from 'next/image'
import { BookOpenIcon } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { TooltipProvider } from '@/components/ui/tooltip'
import { pick, wikiCopy } from '../_content'
import { LANGS, useWikiLang, WikiProviders } from './WikiLang'
import { WikiNav } from './WikiNav'
import { WikiSearch } from './WikiSearch'
import logo from '../../assets/TurboISP-logo.png'
import type { ReactNode } from 'react'

function WikiHeader() {
  const { lang, setLang } = useWikiLang()

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b bg-background/85 px-3 backdrop-blur-md sm:px-4">
      <SidebarTrigger className="md:hidden" />
      <Link href="/turboisp/wiki" className="flex shrink-0 items-center gap-2 md:hidden">
        <Image src={logo} alt="TurboISP" className="h-7 w-auto" height={28} />
      </Link>
      <div className="ml-auto flex min-w-0 flex-1 items-center justify-end gap-2">
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
      </div>
    </header>
  )
}

function WikiSidebar() {
  const { lang } = useWikiLang()

  return (
    <Sidebar collapsible="offcanvas" variant="sidebar">
      <SidebarHeader className="border-b border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<Link href="/turboisp/wiki" />}
              size="lg"
              tooltip={pick(lang, wikiCopy.brand)}
            >
              <Image src={logo} alt="TurboISP" className="size-8 object-contain" height={32} width={32} />
              <span className="flex min-w-0 flex-col leading-tight">
                <span className="flex items-center gap-1.5 text-sm font-medium">
                  <BookOpenIcon className="size-3.5 text-sidebar-primary" />
                  {pick(lang, wikiCopy.brand)}
                </span>
                <span className="text-[11px] font-normal text-sidebar-foreground/50">TurboISP</span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <WikiNav />
      </SidebarContent>
    </Sidebar>
  )
}

function WikiChromeInner({ children }: { children: ReactNode }) {
  return (
    <TooltipProvider delay={200}>
      <SidebarProvider className="h-full min-h-0" enableKeyboardShortcut={false}>
        <WikiSidebar />
        <SidebarInset className="min-w-0 w-auto overflow-y-auto">
          <WikiHeader />
          <div className="px-4 py-8 sm:px-8 lg:px-10">{children}</div>
        </SidebarInset>
      </SidebarProvider>
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
