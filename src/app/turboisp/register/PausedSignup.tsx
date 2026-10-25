'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ChevronDown } from 'lucide-react'
import logo from '../assets/TurboISP-logo.png'
import { LANGS, pick, type Lang } from '../site/_components/constants'
import { useSiteLang } from '../site/_components/site-lang'
import { pausedCopy } from './paused-copy'

export function PausedSignup() {
  const { lang, setLang } = useSiteLang()
  const s = (key: keyof typeof pausedCopy) => pick(pausedCopy[key], lang)

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-sky-50 to-white text-slate-900 flex flex-col">
      <nav className="flex items-center justify-between px-6 py-4 lg:px-12 border-b border-slate-100 bg-white/85">
        <Link href="/turboisp/site" className="flex items-center">
          <Image src={logo} alt="TurboISP" priority className="h-16 w-auto -my-4" />
        </Link>
        <label className="relative inline-flex h-9 items-center">
          <span className="sr-only">{pick({ en: 'Language', pt: 'Idioma', fr: 'Langue', es: 'Idioma' }, lang)}</span>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as Lang)}
            className="h-9 appearance-none rounded-full border border-slate-800 bg-white pl-3.5 pr-8 text-sm font-semibold text-black cursor-pointer"
          >
            {LANGS.map(({ code, label }) => (
              <option key={code} value={code}>{label}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-black" />
        </label>
      </nav>

      <main className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="max-w-lg text-center">
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 mb-4">
            {s('title')}
          </h1>
          <p className="text-slate-600 leading-relaxed mb-8">
            {s('body')}
          </p>
          <Link
            href="/turboisp/site"
            className="inline-block px-6 py-3 border border-sky-600 rounded-lg font-semibold text-sky-700 hover:bg-sky-50 transition"
          >
            {s('back')}
          </Link>
        </div>
      </main>
    </div>
  )
}
