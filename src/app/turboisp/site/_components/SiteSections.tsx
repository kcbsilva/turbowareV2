'use client'

import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'

type Stat = { value: string; label: string }

function isCompactStatValue(value: string) {
  return /^[\d.%+\-]+$/.test(value.replace(/\s/g, '')) || value.length <= 8
}

function StatValue({ value }: { value: string }) {
  return (
    <p className={`isp-stat-value mb-1 ${isCompactStatValue(value) ? 'isp-stat-value--compact' : 'isp-stat-value--wide'}`}>
      {value}
    </p>
  )
}

export function SiteStatsBar({ stats }: { stats: Stat[] }) {
  return (
    <section className="relative z-10 max-w-5xl mx-auto px-6 pb-14">
      <motion.div
        initial={{ opacity: 1, y: 0 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.45 }}
        className="turbo-stat-strip"
      >
        {stats.map(({ value, label }) => (
          <div key={`${value}-${label}`} className="turbo-stat-cell">
            <StatValue value={value} />
            <p className="text-[11px] text-white/40 leading-snug">{label}</p>
          </div>
        ))}
      </motion.div>
    </section>
  )
}

type Module = {
  icon: LucideIcon
  title: string
  desc: string
  accent: string
}

export function SiteModulesGrid({
  eyebrow,
  title,
  modules,
}: {
  eyebrow: string
  title: string
  modules: Module[]
}) {
  return (
    <section id="modules" className="relative z-10 max-w-6xl mx-auto px-6 py-16 sm:py-20">
      <div className="text-center mb-12">
        <p className="turbo-eyebrow mb-4 justify-center">{eyebrow}</p>
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">{title}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map(({ icon: Icon, title: modTitle, desc, accent }, i) => (
          <motion.div
            key={modTitle}
            initial={{ opacity: 1, y: 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: i * 0.04 }}
            className="turbo-card rounded-xl p-5 group"
          >
            <div
              className="turbo-module-icon w-10 h-10 flex items-center justify-center mb-4 border transition-transform group-hover:scale-105 group-hover:-translate-y-0.5"
              style={{ backgroundColor: `${accent}20`, borderColor: `${accent}40` }}
            >
              <Icon className="w-5 h-5" style={{ color: accent }} />
            </div>
            <h3 className="text-sm font-bold mb-2 text-white tracking-tight">{modTitle}</h3>
            <p className="text-xs leading-relaxed text-white/42">{desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

type Value = { icon: LucideIcon; title: string; desc: string }

export function SiteValuesSection({
  eyebrow,
  title,
  values,
}: {
  eyebrow: string
  title: string
  values: Value[]
}) {
  return (
    <section id="valores" className="relative z-10 max-w-6xl mx-auto px-6 py-16 sm:py-20">
      <div className="text-center mb-12">
        <p className="turbo-eyebrow mb-4 justify-center">{eyebrow}</p>
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">{title}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {values.map(({ icon: Icon, title: vTitle, desc }) => (
          <motion.div
            key={vTitle}
            initial={{ opacity: 1, x: 0 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="turbo-card rounded-xl p-6 flex gap-4"
          >
            <div className="turbo-module-icon w-11 h-11 flex items-center justify-center shrink-0 bg-[#fca311]/12 border border-[#fca311]/30">
              <Icon className="w-5 h-5 text-[#fca311]" />
            </div>
            <div>
              <h3 className="text-sm font-bold mb-1.5 text-white">{vTitle}</h3>
              <p className="text-xs leading-relaxed text-white/42">{desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

export function SiteMetricsSection({
  eyebrow,
  title,
  metrics,
}: {
  eyebrow: string
  title: string
  metrics: { stat: string; label: string }[]
}) {
  return (
    <section id="metricas" className="relative z-10 max-w-6xl mx-auto px-6 py-16 sm:py-20">
      <div className="text-center mb-12">
        <p className="turbo-eyebrow mb-4 justify-center">{eyebrow}</p>
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">{title}</h2>
      </div>

      <div className="flex flex-wrap justify-center gap-5">
        {metrics.map(({ stat, label }) => (
          <div key={`${stat}-${label}`} className="w-full sm:w-80 turbo-card rounded-2xl p-10 text-center">
            <p className="isp-metric-value">{stat}</p>
            <p className="text-xs text-white/42 leading-snug max-w-[16rem] mx-auto">{label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
