'use client'

import { ChevronDown } from 'lucide-react'
import { LANGS, type Lang } from '@/app/turboisp/site/_components/constants'

type Props = {
  lang: Lang
  setLang: (lang: Lang) => void
  label: string
  tone?: 'light' | 'dark'
}

export function SiteLangSelect({ lang, setLang, label, tone = 'light' }: Props) {
  const dark = tone === 'dark'
  return (
    <label className="relative inline-flex h-9 items-center">
      <span className="sr-only">{label}</span>
      <select
        value={lang}
        onChange={(event) => setLang(event.target.value as Lang)}
        className={
          dark
            ? 'h-9 cursor-pointer appearance-none rounded-full border border-white/20 bg-white/10 pl-3.5 pr-8 text-sm font-semibold text-white focus:outline-none'
            : 'h-9 cursor-pointer appearance-none rounded-full border border-slate-800 bg-white pl-3.5 pr-8 text-sm font-semibold text-black hover:bg-slate-50 focus:border-sky-500 focus:outline-none'
        }
      >
        {LANGS.map(({ code, label: option }) => (
          <option key={code} value={code}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown
        className={`pointer-events-none absolute right-2.5 h-3.5 w-3.5 ${dark ? 'text-white' : 'text-black'}`}
      />
    </label>
  )
}
