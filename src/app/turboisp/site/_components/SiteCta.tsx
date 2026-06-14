'use client'

import { ArrowRight, Zap } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { turboispSignupUrl } from '@/lib/signup-slug'
import { cn } from '@/lib/utils'

type Props = {
  title: string
  description: string
  cta: string
}

export function SiteCtaBanner({ title, description, cta }: Props) {
  return (
    <section className="relative z-10 max-w-6xl mx-auto px-6 py-12">
      <div className="turbo-cta-panel rounded-2xl p-10 sm:p-14 text-center relative">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl mb-5 bg-gradient-to-br from-[#fca311]/25 to-[#1AABF0]/15 border border-[#fca311]/35">
          <Zap className="w-7 h-7 text-[#fca311]" />
        </div>
        <h2 className="font-display text-2xl sm:text-3xl font-black text-white mb-3 tracking-tight italic">{title}</h2>
        <p className="text-sm mb-8 max-w-md mx-auto text-white/45">{description}</p>
        <a
          href={turboispSignupUrl()}
          className={cn(buttonVariants({ size: 'lg' }), 'turbo-btn-primary rounded-lg px-8')}
        >
          {cta} <ArrowRight className="w-4 h-4 ml-1" />
        </a>
      </div>
    </section>
  )
}
