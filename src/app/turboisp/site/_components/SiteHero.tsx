'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, BookOpen, Gauge } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type Props = {
  badge: string
  tagline: string
  title: string
  subtitle: string
  cta: string
  seeModules: string
  trustBadges: string[]
}

export function SiteHero({ badge, tagline, title, subtitle, cta, seeModules, trustBadges }: Props) {
  return (
    <section className="relative z-10 max-w-5xl mx-auto px-6 pt-16 pb-12 sm:pt-20 sm:pb-16 text-center">
      <motion.div
        initial={{ opacity: 1, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="turbo-badge mb-8">
          <span className="turbo-badge-dot" />
          {badge}
        </div>

        <div className="inline-flex items-center gap-2 mb-5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#fca311]/80">
          <Gauge className="w-3.5 h-3.5" />
          Turbo · {tagline}
        </div>

        <h1 className="font-display text-4xl sm:text-5xl md:text-[3.5rem] font-black tracking-tight leading-[1.05] mb-6 text-turbo-gradient max-w-4xl mx-auto italic">
          {title}
        </h1>

        <p className="text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed text-white/50">
          {subtitle}
        </p>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link
            href="/turboisp/register"
            className={cn(buttonVariants({ size: 'lg' }), 'turbo-btn-primary h-12 px-8 rounded-lg')}
          >
            {cta} <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
          <a
            href="#modules"
            className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'turbo-btn-ghost h-12 px-7 rounded-lg')}
          >
            {seeModules} <BookOpen className="w-4 h-4 ml-1" />
          </a>
        </div>

        <div className="mt-14 flex items-center justify-center gap-4 sm:gap-6 flex-wrap">
          {trustBadges.map((b) => (
            <span key={b} className="turbo-trust-item">
              <span className="w-1 h-1 rounded-full bg-[#fca311]" />
              {b}
            </span>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
