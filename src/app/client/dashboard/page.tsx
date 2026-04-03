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
  formatBRL, BILLING_DATE_LOCK_MONTHS
} from '@/lib/pricing'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Invoice {
  id: string
  type: 'INSTALLATION' | 'MONTHLY' | 'PRORATED' | 'GRACE_FEE'
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

// ── Helpers ───────────────────────────────────────────────────────────────────

function daysUntil(date: string | null): number {
  if (!date) return 0
  return Math.max(0, Math.ceil((new Date(date).getTime() - Date.now()) / 86_400_000))
}

function StatusBadge({ status }: { status: Subscription['status'] }) {
  const map = {
    TRIAL:           { label: 'Trial',            cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    PENDING_PAYMENT: { label: 'Awaiting Payment',  cls: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
    ACTIVE:          { label: 'Active',            cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    SUSPENDED:       { label: 'Suspended',         cls: 'bg-red-500/10 text-red-400 border-red-500/20' },
    CANCELLED:       { label: 'Cancelled',         cls: 'bg-muted/50 text-muted-foreground border-border' },
  }
  const { label, cls } = map[status]
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-semibold ${cls}`}>
      {label}
    </span>
  )
}

function invoiceTypeLabel(type: Invoice['type']) {
  return { INSTALLATION: 'Installation fee', MONTHLY: 'Monthly subscription', PRORATED: 'Prorated charge', GRACE_FEE: 'Grace period fee' }[type]
}

// ── Activation Wizard ─────────────────────────────────────────────────────────

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
  const [cnpj, setCnpj]         = useState<string | null>(null)
  const [clientName, setClientName] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [fetchingProfile, setFetchingProfile] = useState(true)
  const [error, setError]       = useState('')
  const [result, setResult]     = useState<ActivationResult | null>(null)

  // Load the authenticated client's CNPJ from the session
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

    // Generate a stable hardware ID for this browser session.
    // In a real TurboISP desktop install this would be a real machine fingerprint;
    // here we use a UUID stored in sessionStorage so each browser tab is unique.
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
      onActivated() // refresh parent — subscription may now be visible
    } else {
      const d = await res.json().catch(() => ({}))
      setError(d.message || 'Activation failed.')
    }
  }

  const inputCls = 'w-full px-3 py-2.5 rounded-lg text-sm bg-muted border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring'

  // ── Success state ──────────────────────────────────────────────────────────
  if (result) {
    const statusLabels: Record<string, string> = {
      ACTIVE: 'Active', TRIAL: 'Trial', PENDING_PAYMENT: 'Pending Payment',
      SUSPENDED: 'Suspended', CANCELLED: 'Cancelled',
    }
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-56px)] px-6 py-12">
        <div className="w-full max-w-md space-y-5">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">TurboISP Activated</h1>
              <p className="text-xs text-muted-foreground mt-1">This installation is now linked to <strong className="text-foreground">{result.clientName}</strong>.</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg divide-y divide-border text-xs">
            <div className="flex justify-between px-4 py-2.5">
              <span className="text-muted-foreground">Plan tier</span>
              <span className="font-medium text-foreground">{result.plan.subscriberTier} subscribers</span>
            </div>
            <div className="flex justify-between px-4 py-2.5">
              <span className="text-muted-foreground">Status</span>
              <span className="font-medium text-foreground">{statusLabels[result.plan.status] ?? result.plan.status}</span>
            </div>
            <div className="flex justify-between px-4 py-2.5">
              <span className="text-muted-foreground">Max subscribers</span>
              <span className="font-medium text-foreground">{result.permissions.maxSubscribers.toLocaleString()}</span>
            </div>
            <div className="flex justify-between px-4 py-2.5">
              <span className="text-muted-foreground">Region</span>
              <span className="font-medium text-foreground">{result.plan.region}</span>
            </div>
            {result.plan.monthlyAmount !== null && (
              <div className="flex justify-between px-4 py-2.5">
                <span className="text-muted-foreground">Monthly</span>
                <span className="font-medium text-[#fca311]">{formatBRL(result.plan.monthlyAmount!)}</span>
              </div>
            )}
            {result.plan.trialEndsAt && (
              <div className="flex justify-between px-4 py-2.5">
                <span className="text-muted-foreground">Trial ends</span>
                <span className="font-medium text-blue-400">{new Date(result.plan.trialEndsAt).toLocaleDateString('pt-BR')}</span>
              </div>
            )}
            <div className="px-4 py-2.5">
              <p className="text-[10px] text-muted-foreground mb-1.5">Modules</p>
              <div className="flex flex-wrap gap-1">
                {result.permissions.modules.map((m) => (
                  <span key={m} className="px-1.5 py-0.5 rounded bg-muted border border-border text-[10px] text-muted-foreground capitalize">{m}</span>
                ))}
              </div>
            </div>
          </div>

          <p className="text-[10px] text-center text-muted-foreground/50">
            Activated at {new Date(result.activatedAt).toLocaleString('pt-BR')}
          </p>
        </div>
      </div>
    )
  }

  // ── Main wizard ────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-56px)] px-6 py-12">
      <div className="w-full max-w-md space-y-6">

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-2" style={{ backgroundColor: '#fca311' }}>
            <span className="text-base font-black" style={{ color: '#081124' }}>T</span>
          </div>
          <h1 className="text-lg font-bold text-foreground">Activate TurboISP</h1>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Your TurboISP installation will use the credentials you used to log into this portal.
            No license key is required.
          </p>
        </div>

        {/* Info notice */}
        <div className="flex gap-2.5 p-3 rounded-lg bg-blue-500/5 border border-blue-500/15">
          <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-300/80 leading-relaxed">
            TurboISP will authenticate using your CNPJ and password on startup.
            Keep your portal password safe — changing it will require re-activation.
          </p>
        </div>

        {/* CNPJ display */}
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Your CNPJ</label>
          {fetchingProfile ? (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-muted border border-border">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Loading…</span>
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

        {/* Password confirmation */}
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Confirm your password</label>
          <input
            type="password"
            className={inputCls}
            placeholder="Enter your portal password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleActivate() }}
          />
          <p className="text-[10px] text-muted-foreground mt-1">
            Used once to verify your identity. TurboISP stores this securely on the machine.
          </p>
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
          style={{ backgroundColor: '#fca311', color: '#081124' }}
        >
          {loading
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Activating…</>
            : <><ShieldCheck className="w-4 h-4" /> Activate TurboISP</>}
        </button>
      </div>
    </div>
  )
}

// ── Subscription Dashboard ────────────────────────────────────────────────────

function SubscriptionDashboard({ sub, onRefresh }: { sub: Subscription; onRefresh: () => void }) {
  const [graceConfirm, setGraceConfirm] = useState(false)
  const [graceLoading, setGraceLoading] = useState(false)
  const [graceError, setGraceError]     = useState('')
  const [changingDate, setChangingDate] = useState(false)
  const [newDate, setNewDate]           = useState<number | ''>('')
  const [dateLoading, setDateLoading]   = useState(false)
  const [dateError, setDateError]       = useState('')

  const monthly      = getMonthlyPrice(sub.seats)
  const trialDays    = daysUntil(sub.trialEndsAt)
  const graceDays    = daysUntil(sub.gracePeriodEndsAt)
  const pendingInvs  = sub.invoices.filter((i) => i.status === 'PENDING')
  const paidInvs     = sub.invoices.filter((i) => i.status === 'PAID')
  const dateCheck    = canChangeBillingDate(sub.billingDateChangedAt ? new Date(sub.billingDateChangedAt) : null)
  const graceOk      = canActivateGrace(sub.gracePeriodUsedAt ? new Date(sub.gracePeriodUsedAt) : null)
  const graceActive  = sub.gracePeriodEndsAt && new Date(sub.gracePeriodEndsAt) > new Date()

  async function activateGrace() {
    setGraceLoading(true); setGraceError('')
    const res = await fetch('/api/client/subscription/grace', { method: 'POST' })
    setGraceLoading(false)
    if (res.ok) { setGraceConfirm(false); onRefresh() }
    else { const d = await res.json().catch(() => ({})); setGraceError(d.error || 'Failed.') }
  }

  async function changeDate() {
    if (!newDate) return
    setDateLoading(true); setDateError('')
    const res = await fetch('/api/client/subscription/billing-date', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ billingDate: newDate }),
    })
    setDateLoading(false)
    if (res.ok) { setChangingDate(false); setNewDate(''); onRefresh() }
    else { const d = await res.json().catch(() => ({})); setDateError(d.error || 'Failed.') }
  }

  const card = 'bg-card border border-border rounded-lg'
  const ord  = (n: number) => n === 1 ? '1st' : n === 2 ? '2nd' : n === 3 ? '3rd' : `${n}th`

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 space-y-4">

      {/* Header card */}
      <div className={`${card} p-4`}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-bold text-foreground">TurboISP</p>
              <StatusBadge status={sub.status} />
            </div>
            <p className="text-xs text-muted-foreground">
              {sub.seats.toLocaleString()} users &middot; {monthly ? `${formatBRL(monthly)}/mo` : 'Enterprise'}
            </p>
            {sub.license && (
              <p className="text-[10px] text-muted-foreground/50 font-mono mt-0.5">{sub.license.key}</p>
            )}
          </div>
          <button onClick={onRefresh} className="text-muted-foreground hover:text-foreground transition p-1" title="Refresh">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Trial bar */}
        {sub.status === 'TRIAL' && sub.trialEndsAt && (
          <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-md bg-blue-500/10 border border-blue-500/20">
            <Clock className="w-4 h-4 text-blue-400 shrink-0" />
            <p className="text-xs text-blue-300">
              Trial active — <strong>{trialDays} day{trialDays !== 1 ? 's' : ''} remaining</strong>.
              First payment due on {new Date(sub.trialEndsAt).toLocaleDateString('pt-BR')}.
            </p>
          </div>
        )}

        {/* Grace period bar */}
        {graceActive && (
          <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-md bg-yellow-500/10 border border-yellow-500/20">
            <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0" />
            <p className="text-xs text-yellow-300">
              Grace period active — <strong>{graceDays} day{graceDays !== 1 ? 's' : ''} remaining</strong>. Settle invoices to avoid re-suspension.
            </p>
          </div>
        )}
      </div>

      {/* Suspended + grace period */}
      {sub.status === 'SUSPENDED' && (
        <div className={`${card} border-red-500/20 p-4`}>
          <div className="flex items-center gap-2 mb-3">
            <XCircle className="w-4 h-4 text-red-400" />
            <h3 className="text-sm font-semibold text-foreground">Subscription Suspended</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Access suspended due to outstanding balance. Pay your invoices below, or activate a grace period for 3 extra days.
          </p>

          {graceOk ? (
            graceConfirm ? (
              <div className="space-y-3">
                <div className="flex gap-2.5 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-yellow-300 leading-relaxed">
                    This will restore access for <strong>3 days</strong> and add a <strong>R$5,00 fee</strong> to your next bill. Can only be used <strong>once per month</strong>.
                  </p>
                </div>
                {graceError && <p className="text-xs text-destructive">{graceError}</p>}
                <div className="flex gap-2">
                  <button onClick={() => { setGraceConfirm(false); setGraceError('') }} className="flex-1 py-2 text-xs border border-border rounded-md text-muted-foreground hover:text-foreground transition">Cancel</button>
                  <button onClick={activateGrace} disabled={graceLoading} className="flex-1 py-2 text-xs font-semibold rounded-md transition hover:opacity-90 disabled:opacity-50" style={{ backgroundColor: '#fca311', color: '#081124' }}>
                    {graceLoading ? 'Activating…' : 'Confirm Grace Period'}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setGraceConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md border border-[#fca311]/40 text-[#fca311] hover:bg-[#fca311]/10 transition"
              >
                <Clock className="w-3.5 h-3.5" />
                Activate 3-Day Grace Period <span className="text-muted-foreground font-normal">(+R$5,00 on next bill)</span>
              </button>
            )
          ) : (
            <p className="text-[10px] text-muted-foreground flex items-center gap-1.5">
              <AlertTriangle className="w-3 h-3 text-yellow-500/70" />
              Grace period already used this month. Resets on the 1st of next month.
            </p>
          )}
        </div>
      )}

      {/* Billing date card */}
      <div className={card}>
        <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
            <h3 className="text-[10px] font-semibold text-foreground uppercase tracking-wider">Billing</h3>
          </div>
          {sub.status === 'ACTIVE' && !changingDate && (
            dateCheck.allowed
              ? <button onClick={() => setChangingDate(true)} className="text-[10px] text-primary hover:opacity-80">Change date</button>
              : <span className="text-[10px] text-muted-foreground/50">Locked until {dateCheck.availableOn?.toLocaleDateString('pt-BR')}</span>
          )}
        </div>
        <div className="px-4 py-3">
          {changingDate ? (
            <div className="space-y-3">
              <select value={newDate} onChange={(e) => setNewDate(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3 py-2 rounded-md text-sm bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="">Select new billing day…</option>
                {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => <option key={d} value={d}>Day {d}</option>)}
              </select>
              {dateError && <p className="text-xs text-destructive">{dateError}</p>}
              <div className="flex gap-2">
                <button onClick={() => { setChangingDate(false); setDateError('') }} className="flex-1 py-1.5 text-xs border border-border rounded-md text-muted-foreground hover:text-foreground transition">Cancel</button>
                <button onClick={changeDate} disabled={dateLoading || !newDate} className="flex-1 py-1.5 text-xs font-semibold rounded-md hover:opacity-90 disabled:opacity-40 transition" style={{ backgroundColor: '#fca311', color: '#081124' }}>
                  {dateLoading ? 'Saving…' : 'Confirm'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-foreground">Day {sub.billingDate} of each month ({ord(sub.billingDate)})</p>
                {monthly && <p className="text-[10px] text-muted-foreground mt-0.5">Next charge: {formatBRL(monthly)} on the {ord(sub.billingDate)}</p>}
              </div>
              <Users className="w-4 h-4 text-muted-foreground/30" />
            </div>
          )}
        </div>
      </div>

      {/* Pending invoices */}
      {pendingInvs.length > 0 && (
        <div className={`${card} border-yellow-500/20`}>
          <div className="px-4 py-2.5 border-b border-yellow-500/20 flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" />
            <h3 className="text-[10px] font-semibold text-foreground uppercase tracking-wider">Awaiting Payment</h3>
          </div>
          <div className="divide-y divide-border">
            {pendingInvs.map((inv) => (
              <div key={inv.id} className="px-4 py-3 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground">{invoiceTypeLabel(inv.type)}</p>
                  {inv.notes && <p className="text-[10px] text-muted-foreground/70 mt-0.5">{inv.notes}</p>}
                  <p className="text-[10px] text-muted-foreground">Due: {new Date(inv.dueDate).toLocaleDateString('pt-BR')}</p>
                  {inv.paymentGateway && (
                    <p className="text-[10px] text-muted-foreground/50 mt-0.5">
                      via {inv.paymentGateway === 'ASAAS' ? 'Pix / Boleto / Cartão' : 'Stripe'}
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
                      style={{ backgroundColor: '#fca311', color: '#081124' }}
                    >
                      <ExternalLink className="w-3 h-3" />
                      Pagar agora
                    </a>
                  )}
                </div>
              </div>
            ))}
            {pendingInvs.every((i) => !i.paymentUrl) && (
              <div className="px-4 py-3 bg-yellow-500/5 text-center">
                <p className="text-[10px] text-muted-foreground">Contact your administrator to receive a payment link.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payment history */}
      {paidInvs.length > 0 && (
        <div className={card}>
          <div className="px-4 py-2.5 border-b border-border">
            <h3 className="text-[10px] font-semibold text-foreground uppercase tracking-wider">Payment History</h3>
          </div>
          <div className="divide-y divide-border">
            {paidInvs.map((inv) => (
              <div key={inv.id} className="px-4 py-3 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-medium text-foreground">{invoiceTypeLabel(inv.type)}</p>
                  <p className="text-[10px] text-muted-foreground">Paid {inv.paidAt ? new Date(inv.paidAt).toLocaleDateString('pt-BR') : '—'}</p>
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

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [sub, setSub]     = useState<Subscription | null | undefined>(undefined)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/client/subscription')
    if (res.ok) setSub(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  if (loading || sub === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-56px)]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (sub === null) return <ActivationWizard onActivated={load} />
  return <SubscriptionDashboard sub={sub} onRefresh={load} />
}
