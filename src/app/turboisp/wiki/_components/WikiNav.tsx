'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  ActivityIcon,
  BarChart3Icon,
  CableIcon,
  ChevronRightIcon,
  FileTextIcon,
  MapIcon,
  MessageSquareIcon,
  NetworkIcon,
  PackageIcon,
  RadioIcon,
  ReceiptIcon,
  SettingsIcon,
  UsersIcon,
  WifiIcon,
  WrenchIcon,
} from 'lucide-react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar'
import {
  ARTICLES,
  CATEGORIES,
  pick,
  wikiCopy,
  type CategoryId,
} from '../_content'
import { useWikiLang } from './WikiLang'

const CATEGORY_ICONS: Record<CategoryId, typeof RadioIcon> = {
  start: RadioIcon,
  network: NetworkIcon,
  map: MapIcon,
  plans: WifiIcon,
  subscribers: UsersIcon,
  billing: ReceiptIcon,
  fiscal: FileTextIcon,
  field: WrenchIcon,
  inventory: PackageIcon,
  provisioning: CableIcon,
  noc: ActivityIcon,
  portal: MessageSquareIcon,
  reports: BarChart3Icon,
  settings: SettingsIcon,
}

function categoryFromPath(pathname: string): CategoryId | 'home' {
  const slug = pathname.replace(/^\/turboisp\/wiki\/?/, '').split('/')[0]
  if (!slug) return 'home'
  return ARTICLES.find((a) => a.slug === slug)?.category ?? 'home'
}

export function WikiNav() {
  const { lang } = useWikiLang()
  const pathname = usePathname()
  const { setOpenMobile } = useSidebar()
  const active = categoryFromPath(pathname)
  const [open, setOpen] = useState<string[]>(active === 'home' ? ['start'] : [active])

  useEffect(() => {
    if (active === 'home') return
    setOpen((prev) => (prev.includes(active) ? prev : [...prev, active]))
  }, [active])

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{pick(lang, wikiCopy.browse)}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {CATEGORIES.map((cat) => {
            const items = ARTICLES.filter((a) => a.category === cat.id)
            const Icon = CATEGORY_ICONS[cat.id]
            const isOpen = open.includes(cat.id)
            return (
              <Collapsible
                key={cat.id}
                className="group/collapsible"
                open={isOpen}
                onOpenChange={(next) => {
                  setOpen((prev) =>
                    next ? [...new Set([...prev, cat.id])] : prev.filter((id) => id !== cat.id),
                  )
                }}
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger
                    render={
                      <SidebarMenuButton
                        isActive={active === cat.id}
                        tooltip={pick(lang, cat.title)}
                      />
                    }
                  >
                    <Icon />
                    <span>{pick(lang, cat.title)}</span>
                    <span className="ml-auto tabular-nums text-[11px] text-sidebar-foreground/45 group-data-[collapsible=icon]:hidden">
                      {items.length}
                    </span>
                    <ChevronRightIcon className="size-4 transition-transform group-data-open/collapsible:rotate-90 group-data-[collapsible=icon]:hidden" />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {items.map((article) => {
                        const href = `/turboisp/wiki/${article.slug}`
                        return (
                          <SidebarMenuSubItem key={article.slug}>
                            <SidebarMenuSubButton
                              render={
                                <Link
                                  href={href}
                                  onClick={() => setOpenMobile(false)}
                                />
                              }
                              isActive={pathname === href}
                              size="sm"
                            >
                              {pick(lang, article.title)}
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        )
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
