'use client'

import Image from 'next/image'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { LANGS, type Lang } from './constants'
import logo from '../../assets/TurboISP-logo.png'

type Props = {
  lang: Lang
  onLangChange: (l: Lang) => void
  labels: {
    modules: string
    why: string
    results: string
    pricing: string
    login: string
    demo: string
  }
}

export function SiteNavbar({ lang, onLangChange, labels }: Props) {
  return (
    <header className="sticky top-0 z-30 turbo-nav">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link href="/turboisp/site" className="shrink-0">
          <Image src={logo} alt="TurboISP" height={48} className="h-10 w-auto" priority />
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-sm">
          <a href="#modules" className="turbo-nav-link">{labels.modules}</a>
          <a href="#valores" className="turbo-nav-link">{labels.why}</a>
          <a href="#metricas" className="turbo-nav-link">{labels.results}</a>
          <Link href="/turboisp/pricing" className="turbo-nav-link">{labels.pricing}</Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:flex rounded-md overflow-hidden border border-white/10">
            {LANGS.map(({ code, label }) => (
              <button
                key={code}
                type="button"
                onClick={() => onLangChange(code)}
                className={cn(
                  'px-2.5 py-1 text-[10px] font-bold transition-colors',
                  lang === code ? 'turbo-lang-active' : 'text-white/45 hover:text-white/70',
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <Link href="/client/login" className="hidden sm:inline text-sm text-white/45 hover:text-white transition-colors">
            {labels.login}
          </Link>
          <Link
            href="/turboisp/register"
            className={cn(buttonVariants({ size: 'sm' }), 'turbo-btn-primary rounded-md px-4')}
          >
            {labels.demo}
          </Link>
        </div>
      </div>
    </header>
  )
}

export function SiteFooter({
  labels,
}: {
  labels: {
    modules: string
    why: string
    results: string
    pricing: string
    demo: string
    admin: string
    copy: string
  }
}) {
  return (
    <footer className="relative z-10 mt-16 turbo-footer">
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6 text-white/35 text-xs">
        <Image src={logo} alt="TurboISP" height={44} className="h-9 w-auto opacity-70" />
        <div className="flex flex-wrap items-center justify-center gap-5">
          <a href="#modules" className="hover:text-[#fca311]/80 transition">{labels.modules}</a>
          <a href="#valores" className="hover:text-[#fca311]/80 transition">{labels.why}</a>
          <a href="#metricas" className="hover:text-[#fca311]/80 transition">{labels.results}</a>
          <Link href="/turboisp/pricing" className="hover:text-[#fca311]/80 transition">{labels.pricing}</Link>
          <Link href="/turboisp/register" className="hover:text-[#fca311]/80 transition">{labels.demo}</Link>
          <Link href="/admin/login" className="hover:text-white/60 transition">{labels.admin}</Link>
        </div>
        <p>© {new Date().getFullYear()} TurboISP. {labels.copy}</p>
      </div>
    </footer>
  )
}
