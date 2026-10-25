'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  CheckCircle, Clock, AlertTriangle, XCircle,
  Loader2, Info, CalendarDays, Users, RefreshCw,
  ExternalLink, ShieldCheck, Building2
} from 'lucide-react'
import {
  getMonthlyPrice,
  canChangeBillingDate, canActivateGrace,
  formatBRL
} from '@/lib/pricing'
import { ExtendGraceDialog, type GraceDialogLabels } from '@/components/ExtendGraceDialog'
import { MAX_CLIENT_GRACE_DAYS } from '@/lib/grace-period'
import { useClientLang } from '@/components/client/ClientLangProvider'
import { clientDateLocale, clientSpan, type ClientMsgKey } from '@/lib/client-i18n'
import { explainApiError } from '@/lib/api-errors'

interface Invoice {
  id: string
  type: 'INSTALLATION' | 'MONTHLY' | 'PRORATED' | 'GRACE_FEE' | 'IMPORTATION' | 'CUSTOM'
  amount: number
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'WAIVED'
  dueDate: string
  paidAt: string | null
  notes: string | null
  paymentUrl: string | null
  paymentGateway: 'ASAAS' | 'STRIPE' | null
}

interface Subscription {
  id: string
  product: string
  seats: number
  status: 'TRIAL' | 'PENDING_PAYMENT' | 'ACTIVE' | 'SUSPENDED' | 'CANCELLED'
  billingDate: number
  billingDateChangedAt: string | null
  trialEndsAt: string | null
  gracePeriodUsedAt: string | null
  gracePeriodEndsAt: string | null
  invoices: Invoice[]
  license: { key: string; status: string; maxSeats: number } | null
}

interface ClientProfile {
  id: string
  name: string
  cnpj: string | null
  email: string | null
  mustChangePassword: boolean
}

function daysUntil(date: string | null): number {
  if (!date) return 0
  return Math.max(0, Math.ceil((new Date(date).getTime() - Date.now()) / 86_400_000))
}

const STATUS_CLS: Record<Subscription['status'], string> = {
  TRIAL: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  PENDING_PAYMENT: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  ACTIVE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  SUSPENDED: 'bg-red-500/10 text-red-400 border-red-500/20',
  CANCELLED: 'bg-muted/50 text-muted-foreground border-border',
}

function StatusBadge({ status }: { status: Subscription['status'] }) {
  const { t } = useClientLang()
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-semibold ${STATUS_CLS[status]}`}>
      {t(`status.${status}` as ClientMsgKey)}
    </span>
  )
}

function useDates() {
  const { lang, t } = useClientLang()
  const locale = clientDateLocale(lang)
  return {
    lang,
    t,
    locale,
    day(iso: string | null | undefined) {
      return iso ? new Date(iso).toLocaleDateString(locale) : '—'
    },
    stamp(iso: string) {
      return new Date(iso).toLocaleString(locale)
    },
  }
}

function graceCopy(t: (key: ClientMsgKey, vars?: Record<string, string | number>) => string): GraceDialogLabels {
  return {
    title: t('grace.title'),
    description: t('grace.description'),
    extraDays: t('grace.extraDays'),
    calendarDate: t('grace.calendar'),
    accessUntil: t('grace.accessUntil'),
    range: t('grace.range'),
    accessThrough: t('grace.accessThrough'),
    day: t('grace.day'),
    days: t('grace.days'),
    cancel: t('grace.cancel'),
    saving: t('grace.saving'),
    failed: t('grace.failed'),
    confirm: t('dash.graceConfirm'),
  }
}

interface ActivationResult {
  clientName: string
  plan: {
    region: string
    subscriberTier: string
    monthlyAmount: number | null
    status: string
    trialEndsAt: string | null
  }
  permissions: {
    maxSubscribers: number
    modules: string[]
  }
  activatedAt: string
  hardwareId: string
}

function ActivationWizard({ onActivated }: { onActivated: () => void }) {
  const { lang, t, locale, day, stamp } = useDates()
  const [cnpj, setCnpj] = useState<string | null>(null)
  const [clientName, setClientName] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetchingProfile, setFetchingProfile] = useState(true)
  const [error, setError] = useState('')
  const [result, setResult] = useState<ActivationResult | null>(null)

  useEffect(() => {
    fetch('/api/client/me')
      .then((r) => r.json())
      .then((d) => {
        setCnpj(d.cnpj ?? null)
        setClientName(d.name ?? null)
      })
      .catch(() => {})
      .finally(() => setFetchingProfile(false))
  }, [])

  async function handleActivate() {
    if (!cnpj || !password.trim()) return
    setLoading(true)
    setError('')

    let hardwareId = sessionStorage.getItem('turboisp_hwid')
    if (!hardwareId) {
      hardwareId = crypto.randomUUID()
      sessionStorage.setItem('turboisp_hwid', hardwareId)
    }

    const res = await fetch('/api/client/auth/activate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cnpj, password, hardwareId }),
    })

    setLoading(false)

    if (res.ok) {
      const data = await res.json()
      setResult(data)
      onActivated()
    } else {
      const d = await res.json().catch(() => ({}))
      setError(explainApiError(d.message || d.error, lang) || t('activate.failed'))
    }
  }

  const inputCls = 'w-full px-3 py-2.5 rounded-lg text-sm bg-muted border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring'

  if (result) {
    const statusKey = `status.${result.plan.status}` as ClientMsgKey
    const statusLabel = statusKey.startsWith('status.') && ['ACTIVE', 'TRIAL', 'PENDING_PAYMENT', 'SUSPENDED', 'CANCELLED'].includes(result.plan.status)
      ? t(statusKey)
      : result.plan.status
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-56px)] px-6 py-12">
        <div className="w-full max-w-md space-y-5">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">{t('activate.successTitle')}</h1>
              <p className="text-xs text-muted-foreground mt-1">{t('activate.successBody', { name: result.clientName })}</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg divide-y divide-border text-xs">
            <div className="flex justify-between px-4 py-2.5">
              <span className="text-muted-foreground">{t('activate.planTier')}</span>
              <span className="font-medium text-foreground">{t('activate.subscribers', { tier: result.plan.subscriberTier })}</span>
            </div>
            <div className="flex justify-between px-4 py-2.5">
              <span className="text-muted-foreground">{t('common.status')}</span>
              <span className="font-medium text-foreground">{statusLabel}</span>
            </div>
            <div className="flex justify-between px-4 py-2.5">
              <span className="text-muted-foreground">{t('activate.maxSubscribers')}</span>
              <span className="font-medium text-foreground">{result.permissions.maxSubscribers.toLocaleString(locale)}</span>
            </div>
            <div className="flex justify-between px-4 py-2.5">
              <span className="text-muted-foreground">{t('common.region')}</span>
              <span className="font-medium text-foreground">{result.plan.region}</span>
            </div>
            {result.plan.monthlyAmount !== null && (
              <div className="flex justify-between px-4 py-2.5">
                <span className="text-muted-foreground">{t('common.monthly')}</span>
                <span className="font-medium text-white">{formatBRL(result.plan.monthlyAmount)}{t('common.perMonth')}</span>
              </div>
            )}
            {result.plan.trialEndsAt && (
              <div className="flex justify-between px-4 py-2.5">
                <span className="text-muted-foreground">{t('activate.trialEnds')}</span>
                <span className="font-medium text-blue-400">{day(result.plan.trialEndsAt)}</span>
              </div>
            )}
            <div className="px-4 py-2.5">
              <p className="text-[10px] text-muted-foreground mb-1.5">{t('common.modules')}</p>
              <div className="flex flex-wrap gap-1">
                {result.permissions.modules.map((m) => (
                  <span key={m} className="px-1.5 py-0.5 rounded bg-muted border border-border text-[10px] text-muted-foreground capitalize">{m}</span>
                ))}
              </div>
            </div>
          </div>

          <p className="text-[10px] text-center text-muted-foreground/50">
            {t('activate.activatedAt', { date: stamp(result.activatedAt) })}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-56px)] px-6 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-2" style={{ backgroundColor: '#fff' }}>
            <span className="text-base font-black" style={{ color: '#000' }}>T</span>
          </div>
          <h1 className="text-lg font-bold text-foreground">{t('activate.title')}</h1>
          <p className="text-xs text-muted-foreground leading-relaxed">{t('activate.lead')}</p>
        </div>

        <div className="flex gap-2.5 p-3 rounded-lg bg-blue-500/5 border border-blue-500/15">
          <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-300/80 leading-relaxed">{t('activate.notice')}</p>
        </div>

        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">{t('activate.cnpj')}</label>
          {fetchingProfile ? (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-muted border border-border">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{t('common.loading')}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-muted border border-border">
              <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                {clientName && <p className="text-xs font-medium text-foreground truncate">{clientName}</p>}
                <p className="text-xs font-mono text-muted-foreground">{cnpj ?? '—'}</p>
              </div>
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            </div>
          )}
        </div>

        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">{t('activate.password')}</label>
          <input
            type="password"
            className={inputCls}
            placeholder={t('activate.passwordPlaceholder')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleActivate() }}
          />
          <p className="text-[10px] text-muted-foreground mt-1">{t('activate.passwordHint')}</p>
        </div>

        {error && (
          <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button
          onClick={handleActivate}
          disabled={loading || !password.trim() || !cnpj || fetchingProfile}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition hover:opacity-90 disabled:opacity-40"
          style={{ backgroundColor: '#fff', color: '#000' }}
        >
          {loading
            ? <><Loader2 className="w-4 h-4 animate-spin" /> {t('activate.submitting')}</>
            : <><ShieldCheck className="w-4 h-4" /> {t('activate.submit')}</>}
        </button>
      </div>
    </div>
  )
}

function SubscriptionDashboard({ sub, onRefresh }: { sub: Subscription; onRefresh: () => void }) {
  const { lang, t, locale, day } = useDates()
  const [graceOpen, setGraceOpen] = useState(false)
  const [changingDate, setChangingDate] = useState(false)
  const [newDate, setNewDate] = useState<number | ''>('')
  const [dateLoading, setDateLoading] = useState(false)
  const [dateError, setDateError] = useState('')

  const monthly = getMonthlyPrice(sub.seats)
  const trialDays = daysUntil(sub.trialEndsAt)
  const graceDays = daysUntil(sub.gracePeriodEndsAt)
  const pendingInvs = sub.invoices.filter((i) => i.status === 'PENDING')
  const paidInvs = sub.invoices.filter((i) => i.status === 'PAID')
  const dateCheck = canChangeBillingDate(sub.billingDateChangedAt ? new Date(sub.billingDateChangedAt) : null)
  const graceOk = canActivateGrace(sub.gracePeriodUsedAt ? new Date(sub.gracePeriodUsedAt) : null)
  const graceActive = sub.gracePeriodEndsAt && new Date(sub.gracePeriodEndsAt) > new Date()
  const priceLabel = monthly ? `${formatBRL(monthly)}${t('common.perMonth')}` : t('common.enterprise')

  async function changeDate() {
    if (!newDate) return
    setDateLoading(true); setDateError('')
    const res = await fetch('/api/client/subscription/billing-date', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ billingDate: newDate }),
    })
    setDateLoading(false)
    if (res.ok) { setChangingDate(false); setNewDate(''); onRefresh() }
    else {
      const d = await res.json().catch(() => ({}))
      setDateError(explainApiError(d.error, lang) || t('common.failed'))
    }
  }

  const card = 'bg-card border border-border rounded-lg'

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 space-y-4">
      <div className={`${card} p-4`}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-bold text-foreground">TurboISP</p>
              <StatusBadge status={sub.status} />
            </div>
            <p className="text-xs text-muted-foreground">
              {t('dash.seats', { n: sub.seats.toLocaleString(locale), price: priceLabel })}
            </p>
            {sub.license && (
              <p className="text-[10px] text-muted-foreground/50 font-mono mt-0.5">{sub.license.key}</p>
            )}
          </div>
          <button onClick={onRefresh} className="text-muted-foreground hover:text-foreground transition p-1" title={t('common.refresh')}>
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {sub.status === 'TRIAL' && sub.trialEndsAt && (
          <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-md bg-blue-500/10 border border-blue-500/20">
            <Clock className="w-4 h-4 text-blue-400 shrink-0" />
            <p className="text-xs text-blue-300">
              {t('dash.trial', { span: clientSpan(lang, trialDays), date: day(sub.trialEndsAt) })}
            </p>
          </div>
        )}

        {graceActive && (
          <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-md bg-yellow-500/10 border border-yellow-500/20">
            <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0" />
            <p className="text-xs text-yellow-300">
              {t('dash.grace', { span: clientSpan(lang, graceDays) })}
            </p>
          </div>
        )}
      </div>

      {sub.status === 'SUSPENDED' && (
        <div className={`${card} border-red-500/20 p-4`}>
          <div className="flex items-center gap-2 mb-3">
            <XCircle className="w-4 h-4 text-red-400" />
            <h3 className="text-sm font-semibold text-foreground">{t('dash.suspendedTitle')}</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-4">{t('dash.suspendedBody')}</p>

          {graceOk ? (
            <>
              <button
                type="button"
                onClick={() => setGraceOpen(true)}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md border border-white/20 text-white hover:bg-white/10 transition"
              >
                <Clock className="w-3.5 h-3.5" />
                {t('dash.extend')} <span className="text-muted-foreground font-normal">{t('dash.extendFee')}</span>
              </button>
              <ExtendGraceDialog
                open={graceOpen}
                onOpenChange={setGraceOpen}
                currentEndsAt={sub.gracePeriodEndsAt}
                maxDays={MAX_CLIENT_GRACE_DAYS}
                feeHint={t('dash.graceHint')}
                labels={graceCopy(t)}
                dateLocale={locale}
                formatError={(message) => explainApiError(message, lang)}
                onConfirm={async (payload) => {
                  const res = await fetch('/api/client/subscription/grace', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                  })
                  const data = await res.json().catch(() => ({}))
                  if (!res.ok) throw new Error(explainApiError(data.error, lang) || t('dash.graceFailed'))
                  onRefresh()
                }}
              />
            </>
          ) : (
            <p className="text-[10px] text-muted-foreground flex items-center gap-1.5">
              <AlertTriangle className="w-3 h-3 text-yellow-500/70" />
              {t('dash.graceUsed')}
            </p>
          )}
        </div>
      )}

      <div className={card}>
        <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
            <h3 className="text-[10px] font-semibold text-foreground uppercase tracking-wider">{t('dash.billing')}</h3>
          </div>
          {sub.status === 'ACTIVE' && !changingDate && (
            dateCheck.allowed
              ? <button onClick={() => setChangingDate(true)} className="text-[10px] text-primary hover:opacity-80">{t('dash.changeDate')}</button>
              : <span className="text-[10px] text-muted-foreground/50">{t('dash.lockedUntil', { date: dateCheck.availableOn ? day(dateCheck.availableOn.toISOString()) : '—' })}</span>
          )}
        </div>
        <div className="px-4 py-3">
          {changingDate ? (
            <div className="space-y-3">
              <select value={newDate} onChange={(e) => setNewDate(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3 py-2 rounded-md text-sm bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="">{t('dash.selectDay')}</option>
                {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => <option key={d} value={d}>{t('dash.dayN', { n: d })}</option>)}
              </select>
              {dateError && <p className="text-xs text-destructive">{dateError}</p>}
              <div className="flex gap-2">
                <button onClick={() => { setChangingDate(false); setDateError('') }} className="flex-1 py-1.5 text-xs border border-border rounded-md text-muted-foreground hover:text-foreground transition">{t('common.cancel')}</button>
                <button onClick={changeDate} disabled={dateLoading || !newDate} className="flex-1 py-1.5 text-xs font-semibold rounded-md hover:opacity-90 disabled:opacity-40 transition" style={{ backgroundColor: '#fff', color: '#000' }}>
                  {dateLoading ? t('common.saving') : t('common.confirm')}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-foreground">{t('dash.billingDayEn', { n: sub.billingDate })}</p>
                {monthly && <p className="text-[10px] text-muted-foreground mt-0.5">{t('dash.nextCharge', { price: formatBRL(monthly), n: sub.billingDate })}</p>}
              </div>
              <Users className="w-4 h-4 text-muted-foreground/30" />
            </div>
          )}
        </div>
      </div>

      {pendingInvs.length > 0 && (
        <div className={`${card} border-yellow-500/20`}>
          <div className="px-4 py-2.5 border-b border-yellow-500/20 flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" />
            <h3 className="text-[10px] font-semibold text-foreground uppercase tracking-wider">{t('dash.awaiting')}</h3>
          </div>
          <div className="divide-y divide-border">
            {pendingInvs.map((inv) => (
              <div key={inv.id} className="px-4 py-3 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground">{t(`invoice.${inv.type}` as ClientMsgKey)}</p>
                  {inv.notes && <p className="text-[10px] text-muted-foreground/70 mt-0.5">{inv.notes}</p>}
                  <p className="text-[10px] text-muted-foreground">{t('dash.due', { date: day(inv.dueDate) })}</p>
                  {inv.paymentGateway && (
                    <p className="text-[10px] text-muted-foreground/50 mt-0.5">
                      {inv.paymentGateway === 'ASAAS' ? t('dash.viaPix') : t('dash.viaStripe')}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <p className="text-sm font-bold font-mono text-yellow-400">{formatBRL(inv.amount)}</p>
                  {inv.paymentUrl && (
                    <a
                      href={inv.paymentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold rounded-md transition hover:opacity-90"
                      style={{ backgroundColor: '#fff', color: '#000' }}
                    >
                      <ExternalLink className="w-3 h-3" />
                      {t('dash.payNow')}
                    </a>
                  )}
                </div>
              </div>
            ))}
            {pendingInvs.every((i) => !i.paymentUrl) && (
              <div className="px-4 py-3 bg-yellow-500/5 text-center">
                <p className="text-[10px] text-muted-foreground">{t('dash.contactAdmin')}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {paidInvs.length > 0 && (
        <div className={card}>
          <div className="px-4 py-2.5 border-b border-border">
            <h3 className="text-[10px] font-semibold text-foreground uppercase tracking-wider">{t('dash.history')}</h3>
          </div>
          <div className="divide-y divide-border">
            {paidInvs.map((inv) => (
              <div key={inv.id} className="px-4 py-3 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-medium text-foreground">{t(`invoice.${inv.type}` as ClientMsgKey)}</p>
                  <p className="text-[10px] text-muted-foreground">{t('dash.paidOn', { date: inv.paidAt ? day(inv.paidAt) : '—' })}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-foreground">{formatBRL(inv.amount)}</span>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function DashboardPage() {
  const { lang, t } = useClientLang()
  const [sub, setSub] = useState<Subscription | null | undefined>(undefined)
  const [profile, setProfile] = useState<ClientProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [passwordModal, setPasswordModal] = useState({ open: false, saving: false, error: '', success: '' })
  const [passwordForm, setPasswordForm] = useState({ newPassword: '', confirmPassword: '' })

  const load = useCallback(async () => {
    setLoading(true)
    const [subRes, profileRes] = await Promise.all([
      fetch('/api/client/subscription'),
      fetch('/api/client/me'),
    ])

    if (subRes.ok) setSub(await subRes.json())
    if (profileRes.ok) {
      const data = await profileRes.json()
      setProfile(data)
      setPasswordModal((prev) => ({ ...prev, open: !!data.mustChangePassword }))
    }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function changePassword() {
    if (!passwordForm.newPassword.trim() || passwordForm.newPassword.length < 8) {
      setPasswordModal((prev) => ({ ...prev, error: t('password.tooShort'), success: '' }))
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordModal((prev) => ({ ...prev, error: t('password.mismatch'), success: '' }))
      return
    }

    setPasswordModal((prev) => ({ ...prev, saving: true, error: '', success: '' }))

    const res = await fetch('/api/client/password', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newPassword: passwordForm.newPassword }),
    })

    if (res.ok) {
      setPasswordForm({ newPassword: '', confirmPassword: '' })
      setPasswordModal({ open: false, saving: false, error: '', success: '' })
      await load()
    } else {
      const data = await res.json().catch(() => ({}))
      setPasswordModal((prev) => ({
        ...prev,
        saving: false,
        error: explainApiError(data.error, lang) || t('password.failed'),
        success: '',
      }))
    }
  }

  if (loading || sub === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-56px)]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <>
      {sub === null ? <ActivationWizard onActivated={load} /> : <SubscriptionDashboard sub={sub} onRefresh={load} />}

      {passwordModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-foreground">{t('password.title')}</h2>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{t('password.lead')}</p>
            {profile?.email && (
              <p className="mt-1 text-[10px] text-muted-foreground/70">
                {t('password.sentTo', { email: profile.email })}
              </p>
            )}

            <div className="mt-5 space-y-3">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  {t('password.new')}
                </label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg text-sm bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder={t('password.minPlaceholder')}
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  {t('password.confirm')}
                </label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg text-sm bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder={t('password.repeatPlaceholder')}
                />
              </div>
            </div>

            {passwordModal.error && (
              <p className="mt-3 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                {passwordModal.error}
              </p>
            )}

            <button
              type="button"
              onClick={changePassword}
              disabled={passwordModal.saving}
              className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition hover:opacity-90 disabled:opacity-40"
              style={{ backgroundColor: '#fff', color: '#000' }}
            >
              {passwordModal.saving ? <><Loader2 className="w-4 h-4 animate-spin" /> {t('common.saving')}</> : t('password.update')}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
