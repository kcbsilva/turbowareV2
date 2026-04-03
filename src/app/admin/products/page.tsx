'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  PRICING_TIERS,
  INSTALLATION_FEES,
  CURRENCY_SYMBOL,
  REGION_LABELS,
  type Region,
} from '@/lib/pricing'
import { Package, CheckCircle, ChevronDown } from 'lucide-react'

type RegionTab = Region

const REGIONS: { code: RegionTab; label: string; flag: string }[] = [
  { code: 'BR', label: 'Brasil',        flag: '🇧🇷' },
  { code: 'CA', label: 'Canada',        flag: '🇨🇦' },
  { code: 'US', label: 'United States', flag: '🇺🇸' },
  { code: 'GB', label: 'England',       flag: '🇬🇧' },
]

interface ClientOption {
  id: string
  name: string
  company: string | null
  subscription: {
    region: string | null
    subscriberTier: string | null
    monthlyAmount: number | null
  } | null
}

function fmt(amount: number | 'inquire', region: Region): string {
  if (amount === 'inquire') return 'Inquire'
  const sym = CURRENCY_SYMBOL[region]
  return `${sym}\u00A0${amount.toLocaleString('en-US')}`
}

export default function ProductsPage() {
  const [tableRegion, setTableRegion]   = useState<RegionTab>('BR')
  const [clients, setClients]           = useState<ClientOption[]>([])
  const [loadingClients, setLoadingClients] = useState(true)

  // Form state
  const [selectedClient, setSelectedClient] = useState('')
  const [formRegion, setFormRegion]          = useState<Region>('BR')
  const [selectedTier, setSelectedTier]      = useState('')
  const [saving, setSaving]                  = useState(false)
  const [saveMsg, setSaveMsg]                = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const fetchClients = useCallback(async () => {
    setLoadingClients(true)
    const res = await fetch('/api/admin/clients')
    if (res.ok) {
      const data = await res.json()
      // Fetch subscriptions for each client
      const withSubs = await Promise.all(
        data.map(async (c: ClientOption) => {
          const subRes = await fetch(`/api/admin/clients/${c.id}/subscription`)
          const sub = subRes.ok ? await subRes.json() : null
          return { ...c, subscription: sub }
        })
      )
      setClients(withSubs)
    }
    setLoadingClients(false)
  }, [])

  useEffect(() => { fetchClients() }, [fetchClients])

  async function handleApplyPlan(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedClient || !selectedTier) return
    setSaving(true)
    setSaveMsg(null)
    try {
      const res = await fetch(`/api/admin/clients/${selectedClient}/plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriberTier: selectedTier, region: formRegion }),
      })
      if (res.ok) {
        setSaveMsg({ type: 'ok', text: 'Plan applied successfully.' })
        fetchClients()
      } else {
        const err = await res.json()
        setSaveMsg({ type: 'err', text: err.error || 'Failed to apply plan.' })
      }
    } catch {
      setSaveMsg({ type: 'err', text: 'Network error.' })
    } finally {
      setSaving(false)
    }
  }

  const selectedPricePreview = selectedTier
    ? PRICING_TIERS.find((t) => t.label === selectedTier)?.prices[formRegion]
    : null

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'hsl(var(--accent)/0.12)' }}>
          <Package className="w-4 h-4" style={{ color: 'hsl(var(--accent))' }} />
        </div>
        <div>
          <h1 className="text-base font-bold text-foreground">Products & Pricing</h1>
          <p className="text-[11px] text-muted-foreground">Assign subscriber plans to clients</p>
        </div>
      </div>

      {/* ── Pricing Table ──────────────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-foreground">
            Pricing Table
          </h2>
          {/* Region tabs */}
          <div className="flex items-center gap-1">
            {REGIONS.map(({ code, label, flag }) => (
              <button
                key={code}
                onClick={() => setTableRegion(code)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border transition"
                style={{
                  backgroundColor: tableRegion === code ? 'hsl(var(--accent)/0.12)' : 'transparent',
                  borderColor:     tableRegion === code ? 'hsl(var(--accent)/0.3)'  : 'transparent',
                  color:           tableRegion === code ? 'hsl(var(--accent))'      : 'hsl(var(--muted-foreground))',
                }}
              >
                <span>{flag}</span>
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Installation fee */}
        <div
          className="px-4 py-3 flex items-center justify-between border-b border-border"
          style={{ backgroundColor: 'hsl(var(--accent)/0.04)' }}
        >
          <span className="text-xs text-muted-foreground font-medium">One-time Installation</span>
          <span className="text-sm font-bold text-foreground">
            {CURRENCY_SYMBOL[tableRegion]}&nbsp;{INSTALLATION_FEES[tableRegion].toLocaleString('en-US')}
          </span>
        </div>

        {/* Tiers */}
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border text-left text-[10px] text-muted-foreground uppercase tracking-wider">
              <th className="px-4 py-2.5 font-medium">Tier (subscribers)</th>
              <th className="px-4 py-2.5 font-medium text-right">
                {REGION_LABELS[tableRegion]} ({CURRENCY_SYMBOL[tableRegion]}) / month
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {PRICING_TIERS.map((tier, i) => {
              const price = tier.prices[tableRegion]
              const isLast = i === PRICING_TIERS.length - 1
              return (
                <tr key={tier.label} className="hover:bg-muted/30 transition">
                  <td className="px-4 py-2.5 text-foreground font-medium">
                    {isLast ? '12,000+' : `Up to ${Number(tier.label).toLocaleString('en-US')}`}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {price === 'inquire' ? (
                      <span className="text-primary font-semibold">Inquire</span>
                    ) : (
                      <span className="text-foreground font-bold">{fmt(price, tableRegion)}</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* ── Assign Plan Form ───────────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-foreground">Assign Plan to Client</h2>
        </div>

        <form onSubmit={handleApplyPlan} className="p-4 grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          {/* Client select */}
          <div className="md:col-span-1">
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Client
            </label>
            <div className="relative">
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="w-full appearance-none bg-background border border-border rounded-md px-3 py-1.5 text-xs text-foreground pr-8 focus:outline-none focus:ring-2 focus:ring-ring"
                required
              >
                <option value="">Select client…</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}{c.company ? ` (${c.company})` : ''}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Region select */}
          <div className="md:col-span-1">
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Region
            </label>
            <div className="relative">
              <select
                value={formRegion}
                onChange={(e) => setFormRegion(e.target.value as Region)}
                className="w-full appearance-none bg-background border border-border rounded-md px-3 py-1.5 text-xs text-foreground pr-8 focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {REGIONS.map(({ code, label, flag }) => (
                  <option key={code} value={code}>{flag} {label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Tier select */}
          <div className="md:col-span-1">
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Subscriber Tier
            </label>
            <div className="relative">
              <select
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.target.value)}
                className="w-full appearance-none bg-background border border-border rounded-md px-3 py-1.5 text-xs text-foreground pr-8 focus:outline-none focus:ring-2 focus:ring-ring"
                required
              >
                <option value="">Select tier…</option>
                {PRICING_TIERS.filter((t) => t.maxSeats !== null).map((tier) => {
                  const price = tier.prices[formRegion]
                  return (
                    <option key={tier.label} value={tier.label}>
                      Up to {Number(tier.label).toLocaleString('en-US')} — {fmt(price, formRegion)}/mo
                    </option>
                  )
                })}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Apply button */}
          <div className="md:col-span-1">
            <button
              type="submit"
              disabled={saving || !selectedClient || !selectedTier}
              className="w-full px-4 py-1.5 rounded-md text-xs font-semibold transition disabled:opacity-40"
              style={{
                backgroundColor: 'hsl(var(--accent))',
                color: 'hsl(var(--accent-foreground))',
              }}
            >
              {saving ? 'Applying…' : 'Apply Plan'}
            </button>
          </div>

          {/* Price preview */}
          {selectedPricePreview !== null && selectedTier && (
            <div className="md:col-span-4 flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
              <p className="text-[11px] text-muted-foreground">
                Monthly amount:{' '}
                <span className="font-bold text-foreground">
                  {fmt(selectedPricePreview ?? 'inquire', formRegion)}
                </span>
                {' '}· Region:{' '}
                <span className="font-bold text-foreground">{REGION_LABELS[formRegion]}</span>
              </p>
            </div>
          )}

          {/* Save message */}
          {saveMsg && (
            <div className="md:col-span-4">
              <p
                className="text-[11px] font-medium px-3 py-2 rounded-md border"
                style={{
                  color:           saveMsg.type === 'ok' ? 'hsl(142 71% 45%)' : 'hsl(var(--destructive))',
                  backgroundColor: saveMsg.type === 'ok' ? 'hsl(142 71% 45% / 0.1)' : 'hsl(var(--destructive) / 0.1)',
                  borderColor:     saveMsg.type === 'ok' ? 'hsl(142 71% 45% / 0.25)' : 'hsl(var(--destructive) / 0.25)',
                }}
              >
                {saveMsg.text}
              </p>
            </div>
          )}
        </form>
      </div>

      {/* ── Client Plan Summary ─────────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-foreground">Current Plans</h2>
        </div>

        {loadingClients ? (
          <div className="p-8 text-center">
            <p className="text-xs text-muted-foreground animate-pulse">Loading clients…</p>
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-left text-[10px] text-muted-foreground uppercase tracking-wider">
                <th className="px-4 py-2.5 font-medium">Client</th>
                <th className="px-4 py-2.5 font-medium">Region</th>
                <th className="px-4 py-2.5 font-medium">Tier</th>
                <th className="px-4 py-2.5 font-medium">Monthly</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {clients.map((c) => {
                const sub = c.subscription
                const hasPlan = sub?.region && sub?.subscriberTier
                return (
                  <tr key={c.id} className="hover:bg-muted/30 transition">
                    <td className="px-4 py-3 font-medium text-foreground">
                      {c.name}
                      {c.company && (
                        <span className="ml-1.5 text-muted-foreground font-normal">({c.company})</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {hasPlan ? (
                        <span className="flex items-center gap-1.5">
                          {REGIONS.find((r) => r.code === sub!.region)?.flag ?? ''}
                          {REGION_LABELS[sub!.region as Region] ?? sub!.region}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {hasPlan ? (
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-semibold border"
                          style={{
                            color: 'hsl(var(--accent))',
                            borderColor: 'hsl(var(--accent)/0.3)',
                            backgroundColor: 'hsl(var(--accent)/0.08)',
                          }}
                        >
                          Up to {Number(sub!.subscriberTier).toLocaleString('en-US')}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-bold text-foreground">
                      {sub?.monthlyAmount != null ? (
                        `${CURRENCY_SYMBOL[sub.region as Region] ?? ''}\u00A0${sub.monthlyAmount.toLocaleString('en-US')}`
                      ) : (
                        <span className="text-muted-foreground font-normal">—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
              {clients.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                    No clients found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
