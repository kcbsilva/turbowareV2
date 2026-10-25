'use client'

import Link from 'next/link'
import { SearchXIcon } from 'lucide-react'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { pick, wikiCopy } from '../_content'
import { useWikiLang } from './WikiLang'
import { turbowareTitle, useDocumentTitle } from '@/lib/document-title'

export function WikiNotFound() {
  const { lang } = useWikiLang()
  useDocumentTitle(turbowareTitle(pick(lang, {
    en: 'Guide not found',
    pt: 'Guia não encontrado',
    fr: 'Guide introuvable',
    es: 'Guía no encontrada',
  })))
  return (
    <Empty className="min-h-[50vh] border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <SearchXIcon />
        </EmptyMedia>
        <EmptyTitle>
          {pick(lang, {
            en: 'Guide not found',
            pt: 'Guia não encontrado',
            fr: 'Guide introuvable',
            es: 'Guía no encontrada',
          })}
        </EmptyTitle>
        <EmptyDescription>
          {pick(lang, {
            en: 'That URL is not a wiki article. Search or go back home.',
            pt: 'Essa URL não é um artigo do wiki. Busque ou volte ao início.',
            fr: 'Cette URL n’est pas un article du wiki. Cherchez ou revenez à l’accueil.',
            es: 'Esa URL no es un artículo del wiki. Busca o vuelve al inicio.',
          })}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Link href="/turboisp/wiki" className={cn(buttonVariants())}>
          {pick(lang, wikiCopy.backHome)}
        </Link>
      </EmptyContent>
    </Empty>
  )
}
