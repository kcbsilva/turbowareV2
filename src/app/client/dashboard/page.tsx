'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  KeyRound, CheckCircle, Clock, AlertTriangle, XCircle,
  ArrowRight, Loader2, Info, CalendarDays, Users, RefreshCw,
  ChevronDown
} from 'lucide-react'
import {
  BRAZIL_TIERS, INSTALLATION_FEE, TRIAL_DAYS,
  getMonthlyPrice, getProratedAmount,
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

function ActivationWizard({ onActivated }: { onActivated: () => void }) {
  const [step, setStep]             = useState<1 | 2>(1)
  const [licenseKey, setLicenseKey] = useState('')
  const [seats, setSeats]           = useState<number | ''>('')
  const [billingDate, setBillingDate] = useState<number | ''>('')
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')

  const monthly  = typeof seats === 'number' && seats > 0 ? getMonthlyPrice(seats) : null
  const prorated = typeof billingDate === 'number' && billingDate > 0 && monthly
    ? getProratedAmount(monthly, billingDate) : null
  const trialDue = new Date(Date.now() + TRIAL_DAYS * 86_400_000)

  async function activate() {
    setLoading(true); setError('')
    const res = await fetch('/api/client/subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ licenseKey, seats, billingDate }),
    })
    setLoading(false)
    if (res.ok) { onActivated() }
    else { const d = await res.json().catch(() => ({})); setError(d.error || 'Something went wrong.') }
  }

  const inputCls = 'w-full px-3 py-2.5 rounded-lg text-sm bg-muted border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring'

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-56px)] px-6 py-12">
      <div className="w-full max-w-md">

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {([1, 2] as const).map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all
                ${step === s ? 'border-[#fca311] bg-[#fca311]/10 text-[#fca311]'
                  : step > s ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                  : 'border-border text-muted-foreground'}`}
              >
                {step > s ? <CheckCircle className="w-3.5 h-3.5" /> : s}
              </div>
              {s < 2 && <div className={`w-12 h-0.5 ${step > s ? 'bg-emerald-500/50' : 'bg-border'}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: key + seats */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h1 className="text-lg font-bold text-foreground mb-1">Activate Your License</h1>
              <p className="text-xs text-muted-foreground">Enter the key provided by your admin and choose your user count.</p>
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">License Key</label>
              <input
                className={`${inputCls} font-mono uppercase tracking-widest`}
                placeholder="XXXX-XXXX-XXXX-XXXX"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Product</label>
              <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-muted border border-border">
                <div className="w-5 h-5 rounded flex items-center justify-center" style={{ backgroundColor: '#fca311' }}>
                  <span className="text-[8px] font-black" style={{ color: '#081124' }}>T</span>
                </div>
                <span className="text-sm font-medium text-foreground">TurboISP</span>
                <span className="ml-auto text-[10px] text-muted-foreground/50">Only available product</span>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Number of Users</label>
              <input
                type="number" min={1} max={12000}
                className={inputCls}
                placeholder="e.g. 500"
                value={seats}
                onChange={(e) => setSeats(e.target.value ? Number(e.target.value) : '')}
              />
              {typeof seats === 'number' && seats > 0 && (
                <p className={`mt-1.5 text-xs font-medium ${monthly !== null ? 'text-[#fca311]' : 'text-yellow-400'}`}>
                  {monthly !== null ? `Monthly plan: ${formatBRL(monthly)}/mo` : 'Over 12,000 users — contact us for enterprise pricing.'}
                </p>
              )}
            </div>

            {/* Pricing reference */}
            <details className="group">
              <summary className="flex items-center gap-1.5 text-[10px] text-muted-foreground cursor-pointer select-none hover:text-foreground transition">
                <Info className="w-3 h-3" /> View pricing table
                <ChevronDown className="w-3 h-3 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="mt-2 rounded-lg border border-border overflow-hidden">
                <table className="w-full text-[10px]">
                  <thead>
                    <tr className="bg-muted border-b border-border">
                      <th className="px-3 py-2 text-left text-muted-foreground font-semibold uppercase tracking-wider">Users</th>
                      <th className="px-3 py-2 text-right text-muted-foreground font-semibold uppercase tracking-wider">Monthly (BRL)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {BRAZIL_TIERS.map((t) => {
                      const isActive = typeof seats === 'number' && seats > 0 && getMonthlyPrice(seats) === t.monthly && seats <= t.maxSeats
                      return (
                        <tr key={t.maxSeats} className={isActive ? 'bg-[#fca311]/8' : ''}>
                          <td className="px-3 py-1.5 text-foreground">Up to {t.maxSeats.toLocaleString()}</td>
                          <td className={`px-3 py-1.5 text-right font-mono ${isActive ? 'text-[#fca311] font-semibold' : 'text-foreground'}`}>{formatBRL(t.monthly)}</td>
                        </tr>
                      )
                    })}
                    <tr><td className="px-3 py-1.5 text-foreground">12,000+</td><td className="px-3 py-1.5 text-right text-muted-foreground italic">Inquire</td></tr>
                  </tbody>
                </table>
              </div>
            </details>

            <button
              onClick={() => setStep(2)}
              disabled={!licenseKey.trim() || !seats || monthly === null}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition hover:opacity-90 disabled:opacity-40"
              style={{ backgroundColor: '#fca311', color: '#081124' }}
            >
              Continue to payment setup <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2: billing date + payment breakdown */}
        {step === 2 && typeof seats === 'number' && monthly !== null && (
          <div className="space-y-5">
            <div>
              <h1 className="text-lg font-bold text-foreground mb-1">Payment Setup</h1>
              <p className="text-xs text-muted-foreground">Choose your billing date. Your first payment is due after the {TRIAL_DAYS}-day trial.</p>
            </div>

            {/* Plan summary */}
            <div className="bg-card border border-border rounded-lg p-4 space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">Product</span><span className="font-medium text-foreground">TurboISP</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Users</span><span className="font-medium text-foreground">{seats.toLocaleString()} seats</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Monthly</span><span className="font-medium text-[#fca311]">{formatBRL(monthly)}/mo</span></div>
            </div>

            {/* Billing date */}
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Preferred billing day of month</label>
              <select value={billingDate} onChange={(e) => setBillingDate(e.target.value ? Number(e.target.value) : '')} className={inputCls}>
                <option value="">Select a day…</option>
                {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => <option key={d} value={d}>Day {d} of each month</option>)}
              </select>
              <p className="text-[10px] text-muted-foreground mt-1">Billing date can only be changed every {BILLING_DATE_LOCK_MONTHS} months.</p>
            </div>

            {/* Payment breakdown */}
            {prorated !== null && typeof billingDate === 'number' && billingDate > 0 && (
              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="px-4 py-2.5 border-b border-border">
                  <p className="text-[10px] font-semibold text-foreground uppercase tracking-wider">First Payment Breakdown</p>
                </div>
                <div className="px-4 py-3 space-y-2 text-xs">
                  <div className="flex justify-between"><span className="text-muted-foreground">Installation (one-time)</span><span className="font-mono text-foreground">{formatBRL(INSTALLATION_FEE)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Prorated (today → day {billingDate})</span><span className="font-mono text-foreground">{formatBRL(prorated)}</span></div>
                  <div className="border-t border-border pt-2 flex justify-between font-semibold">
                    <span className="text-foreground">Total first payment</span>
                    <span className="text-[#fca311] font-mono">{formatBRL(INSTALLATION_FEE + prorated)}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground pt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Due on {trialDue.toLocaleDateString('pt-BR')} (after {TRIAL_DAYS}-day free trial)
                  </p>
                </div>
              </div>
            )}

            {/* Trial notice */}
            <div className="flex gap-2.5 p-3 rounded-lg bg-blue-500/5 border border-blue-500/15">
              <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-300/80 leading-relaxed">
                You get <strong className="text-blue-300">{TRIAL_DAYS} days free</strong>. Payment only required after the trial ends on <strong className="text-blue-300">{trialDue.toLocaleDateString('pt-BR')}</strong>.
              </p>
            </div>

            {error && <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">{error}</p>}

            <div className="flex gap-3">
              <button onClick={() => { setStep(1); setError('') }} className="flex-1 py-2.5 rounded-lg text-sm font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 transition">
                ← Back
              </button>
              <button
                onClick={activate}
                disabled={loading || !billingDate || prorated === null}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition hover:opacity-90 disabled:opacity-40"
                style={{ backgroundColor: '#fca311', color: '#081124' }}
              >
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Starting…</> : <>Start free trial <CheckCircle className="w-4 h-4" /></>}
              </button>
            </div>
          </div>
        )}
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
                <div>
                  <p className="text-xs font-medium text-foreground">{invoiceTypeLabel(inv.type)}</p>
                  {inv.notes && <p className="text-[10px] text-muted-foreground/70 mt-0.5">{inv.notes}</p>}
                  <p className="text-[10px] text-muted-foreground">Due: {new Date(inv.dueDate).toLocaleDateString('pt-BR')}</p>
                </div>
                <p className="text-sm font-bold font-mono text-yellow-400 shrink-0">{formatBRL(inv.amount)}</p>
              </div>
            ))}
            <div className="px-4 py-3 bg-yellow-500/5 text-center">
              <p className="text-[10px] text-muted-foreground">Contact your administrator to confirm payment and activate your plan.</p>
            </div>
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
