'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Activity,
  ArrowUpRight,
  KeyRound,
  Sparkles,
  Ticket,
  TrendingUp,
  UserPlus,
  Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useAdminLang } from '@/components/admin/AdminLangProvider'
import { dateLocale } from '@/lib/admin-i18n'

export interface DashboardData {
  total: number
  withLicense: number
  newThisMonth: number
  openTickets: number
  pendingInvoices: number
  activeLicenses: number
  coverage: number
  signups: { year: number; month: number; value: number }[]
  recent: {
    id: string
    name: string
    subtitle: string
    licenses: number
    createdAt: string
  }[]
}

const ease = [0.22, 1, 0.36, 1] as const

function greeting(t: (key: 'dash.morning' | 'dash.afternoon' | 'dash.evening') => string) {
  const h = new Date().getHours()
  if (h < 12) return t('dash.morning')
  if (h < 18) return t('dash.afternoon')
  return t('dash.evening')
}

function CountUp({ value }: { value: number }) {
  const [n, setN] = useState(0)
  useEffect(() => {
    const start = performance.now()
    const dur = 700
    let frame = 0
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur)
      setN(Math.round(value * (1 - Math.pow(1 - p, 3))))
      if (p < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [value])
  return <>{n}</>
}

function SparkBars({ values, color }: { values: number[]; color: string }) {
  const max = Math.max(1, ...values)
  return (
    <div className="mt-4 flex h-10 items-end gap-1">
      {values.map((v, i) => (
        <motion.div
          key={i}
          initial={{ height: 4 }}
          animate={{ height: `${Math.max(12, (v / max) * 100)}%` }}
          transition={{ delay: 0.15 + i * 0.05, type: 'spring', stiffness: 260, damping: 20 }}
          className="flex-1 rounded-full"
          style={{ backgroundColor: color, opacity: 0.35 + (v / max) * 0.65 }}
        />
      ))}
    </div>
  )
}

function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)

  function onMove(e: React.MouseEvent) {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    el.style.transform = `perspective(900px) rotateX(${(-y * 6).toFixed(2)}deg) rotateY(${(x * 6).toFixed(2)}deg) scale(1.02)`
  }

  function onLeave() {
    const el = ref.current
    if (!el) return
    el.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)'
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={className}
      style={{ transformStyle: 'preserve-3d', transition: 'transform 180ms ease-out' }}
    >
      {children}
    </div>
  )
}

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  href,
  spark,
  accent,
}: {
  label: string
  value: number
  hint: string
  icon: LucideIcon
  href: string
  spark: number[]
  accent: string
  id?: string
}) {
  const { t } = useAdminLang()
  return (
    <TiltCard className="rounded-2xl">
      <Link
        href={href}
        className="group relative block overflow-hidden rounded-2xl border border-border bg-card p-5"
      >
        <div
          className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full blur-2xl"
          style={{ backgroundColor: accent, opacity: 0.18 }}
        />
        <div className="relative flex items-start justify-between">
          <div
            className="grid size-10 place-content-center rounded-xl shadow-sm"
            style={{ backgroundColor: `${accent}22`, color: accent }}
          >
            <Icon className="h-5 w-5" />
          </div>
          <span className="tw-badge tw-badge-teal gap-0.5">
            <TrendingUp className="h-3 w-3" />
            {t('dash.live')}
          </span>
        </div>
        <p className="relative mt-4 text-sm font-medium text-muted-foreground">{label}</p>
        <p className="relative text-3xl font-bold tracking-tight text-foreground">
          <CountUp value={value} />
        </p>
        <p className="relative mt-1 text-xs text-muted-foreground">{hint}</p>
        <SparkBars values={spark} color={accent} />
        <ArrowUpRight className="absolute right-4 top-4 h-4 w-4 text-muted-foreground/40 transition group-hover:text-foreground" />
      </Link>
    </TiltCard>
  )
}

export function AdminDashboard({ data }: { data: DashboardData }) {
  const { t, lang } = useAdminLang()
  const spark = data.signups.map((s) => s.value)
  const licenseSpark = data.signups.map((s, i) => Math.max(0, s.value + (i % 2)))
  const ticketSpark = data.signups.map((_, i) => (i === data.signups.length - 1 ? data.openTickets : Math.max(0, data.openTickets - (5 - i))))
  const invoiceSpark = data.signups.map((_, i) => Math.max(0, data.pendingInvoices - i))

  return (
    <div className="relative min-h-full overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,255,255,0.04),_transparent_50%)]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
        }}
      />

      <div className="relative space-y-8 p-6">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease }}
          className="relative overflow-hidden rounded-2xl border border-border bg-card p-6"
        >
          <motion.div
            aria-hidden
            className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-foreground/5 blur-3xl"
            animate={{ x: [0, 12, 0], y: [0, 8, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-1 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5" />
                {greeting(t)}
              </p>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">{t('dash.title')}</h1>
              <p className="mt-1 max-w-lg text-sm text-muted-foreground">
                {t('dash.lead', { n: data.total })}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/admin/tickets"
                className="rounded-full border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted"
              >
                {t('dash.tickets')}{data.openTickets > 0 ? ` (${data.openTickets})` : ''}
              </Link>
              <Link
                href="/admin/clients/new"
                className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90"
              >
                {t('dash.setup')}
              </Link>
            </div>
          </div>
        </motion.section>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              id: 'total',
              label: t('dash.total'),
              value: data.total,
              hint: t('dash.newMonth', { n: data.newThisMonth }),
              icon: Users,
              href: '/admin/clients',
              spark,
              accent: '#a3a3a3',
            },
            {
              id: 'licensed',
              label: t('dash.withLicenses'),
              value: data.withLicense,
              hint: t('dash.activeLicenses', { n: data.activeLicenses }),
              icon: KeyRound,
              href: '/admin/licenses',
              spark: licenseSpark,
              accent: '#e5e5e5',
            },
            {
              id: 'tickets',
              label: t('dash.openTickets'),
              value: data.openTickets,
              hint: t('dash.openHint'),
              icon: Ticket,
              href: '/admin/tickets',
              spark: ticketSpark,
              accent: '#737373',
            },
            {
              id: 'invoices',
              label: t('dash.pendingInvoices'),
              value: data.pendingInvoices,
              hint: t('dash.awaiting'),
              icon: Activity,
              href: '/admin/invoices',
              spark: invoiceSpark,
              accent: '#f87171',
            },
          ].map((card, i) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 * i, duration: 0.4, ease }}
            >
              <StatCard {...card} />
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.45, ease }}
            className="lg:col-span-2 overflow-hidden rounded-2xl border border-border bg-card"
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <h3 className="text-base font-semibold text-foreground">{t('dash.recent')}</h3>
                <p className="text-xs text-muted-foreground">{t('dash.newest')}</p>
              </div>
              <Link href="/admin/clients" className="text-sm font-semibold text-foreground hover:underline">
                {t('dash.viewAll')}
              </Link>
            </div>
            {data.recent.length === 0 ? (
              <div className="px-5 py-12 text-center text-sm text-muted-foreground">
                {t('dash.empty')}
              </div>
            ) : (
              <div className="divide-y divide-border">
                {data.recent.map((c, i) => (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.24 + i * 0.04, duration: 0.3 }}
                  >
                    <Link
                      href={`/admin/clients/${c.id}`}
                      className="flex items-center gap-4 px-5 py-3.5 transition hover:bg-muted"
                    >
                      <div className="grid size-10 shrink-0 place-content-center rounded-full bg-neutral-800 text-sm font-bold text-foreground">
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-foreground">{c.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{c.subtitle}</p>
                      </div>
                      <div className="hidden items-center gap-1.5 text-xs text-muted-foreground md:flex">
                        <KeyRound className="h-3 w-3" />
                        {c.licenses === 1 ? t('dash.licenseOne') : t('dash.licenseMany', { n: c.licenses })}
                      </div>
                      <p className="hidden text-xs text-muted-foreground lg:block">
                        {new Date(c.createdAt).toLocaleDateString(dateLocale(lang))}
                      </p>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28, duration: 0.45, ease }}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <h3 className="mb-1 text-base font-semibold text-foreground">{t('dash.signups')}</h3>
              <p className="mb-4 text-xs text-muted-foreground">{t('dash.lastSix')}</p>
              <div className="flex h-28 items-end gap-2">
                {data.signups.map((m) => {
                  const max = Math.max(1, ...data.signups.map((s) => s.value))
                  const label = new Date(m.year, m.month, 1).toLocaleDateString(dateLocale(lang), { month: 'short' })
                  return (
                    <div key={`${m.year}-${m.month}`} className="flex flex-1 flex-col items-center gap-1.5">
                      <motion.div
                        initial={{ height: 8 }}
                        animate={{ height: `${Math.max(10, (m.value / max) * 100)}%` }}
                        transition={{ type: 'spring', stiffness: 220, damping: 18 }}
                        className="w-full rounded-t-lg bg-foreground"
                        title={`${label}: ${m.value}`}
                      />
                      <span className="text-[10px] font-medium text-muted-foreground">{label}</span>
                    </div>
                  )
                })}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.34, duration: 0.45, ease }}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <h3 className="mb-4 text-base font-semibold text-foreground">{t('dash.coverage')}</h3>
              {[
                { id: 'licensed', label: t('dash.licensed'), value: data.coverage, color: '#e5e5e5' },
                { id: 'tickets', label: t('dash.openTickets'), value: Math.min(100, data.openTickets * 10), color: '#737373' },
                {
                  id: 'new',
                  label: t('dash.newThisMonth'),
                  value: data.total === 0 ? 0 : Math.min(100, Math.round((data.newThisMonth / data.total) * 100)),
                  color: '#a3a3a3',
                },
              ].map((row) => (
                <div key={row.id} className="mb-4 last:mb-0">
                  <div className="mb-1.5 flex justify-between text-xs">
                    <span className="text-muted-foreground">{row.label}</span>
                    <span className="font-semibold text-foreground">{row.value}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${row.value}%` }}
                      transition={{ duration: 0.8, ease }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: row.color }}
                    />
                  </div>
                </div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.45, ease }}
              className="rounded-2xl border border-border bg-card p-5 text-foreground"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('dash.quick')}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t('dash.quickLead')}</p>
              <div className="mt-4 space-y-1">
                {[
                  { href: '/admin/clients/new', icon: UserPlus, label: t('dash.setup') },
                  { href: '/admin/licenses/new', icon: KeyRound, label: t('dash.newLicense') },
                  { href: '/admin/invoices', icon: Activity, label: t('dash.reviewInvoices') },
                ].map((a) => (
                  <Link
                    key={a.href}
                    href={a.href}
                    className="flex items-center gap-3 rounded-xl px-2 py-2 text-sm text-foreground/90 transition hover:bg-muted"
                  >
                    <a.icon className="h-4 w-4 text-muted-foreground" />
                    {a.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
