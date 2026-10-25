'use client'

import { useState, useEffect } from 'react'
import { Zap, CheckCircle, Clock, Package, ChevronDown, ChevronUp, Loader2, Ban, RefreshCw } from 'lucide-react'
import { useClientLang } from '@/components/client/ClientLangProvider'
import { clientDateLocale, type ClientMsgKey } from '@/lib/client-i18n'
import { explainApiError } from '@/lib/api-errors'

type ProductStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'CANCELLED'

interface Tier {
  id: string; name: string; description: string | null
  maxSeats: number | null; priceBR: number | null; priceUS: number | null
  features: string | null; sortOrder: number
}

interface Activation {
  id: string; status: ProductStatus; tierId: string | null; activatedAt: string | null
  tier: Tier | null; notes: string | null
}

interface Product {
  id: string; name: string; slug: string; description: string | null
  logoEmoji: string | null; tiers: Tier[]; activation: Activation | null
}

const STATUS_KEY: Record<ProductStatus, ClientMsgKey> = {
  PENDING: 'status.PENDING',
  ACTIVE: 'status.ACTIVE',
  SUSPENDED: 'status.SUSPENDED',
  CANCELLED: 'status.CANCELLED',
}

const STATUS_CLS: Record<ProductStatus, { cls: string; icon: React.ElementType }> = {
  PENDING: { cls: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', icon: Clock },
  ACTIVE: { cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: CheckCircle },
  SUSPENDED: { cls: 'bg-red-500/10 text-red-400 border-red-500/20', icon: Ban },
  CANCELLED: { cls: 'bg-white/5 text-white/30 border-white/10', icon: Ban },
}

function parseFeatures(raw: string | null): string[] {
  if (!raw) return []
  try { return JSON.parse(raw) } catch { return raw.split(',').map(s => s.trim()).filter(Boolean) }
}

function TierCard({ tier, selected, onSelect }: { tier: Tier; selected: boolean; onSelect: () => void }) {
  const { lang, t } = useClientLang()
  const locale = clientDateLocale(lang)
  const features = parseFeatures(tier.features)
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-4 rounded-xl border transition ${selected ? 'border-white/40 bg-white/10' : 'border-white/10 bg-white/3 hover:bg-white/5'}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-white">{tier.name}</p>
          {tier.description && <p className="text-xs text-white/40 mt-0.5">{tier.description}</p>}
        </div>
        <div className="text-right shrink-0">
          {tier.priceBR != null && <p className="text-sm font-bold text-white">R$ {tier.priceBR.toFixed(2).replace('.', ',')}<span className="text-[10px] font-normal text-white/30">{t('common.perMonth')}</span></p>}
          {tier.priceUS != null && tier.priceBR == null && <p className="text-sm font-bold text-white">${tier.priceUS}<span className="text-[10px] font-normal text-white/30">{t('common.perMonth')}</span></p>}
          {tier.maxSeats && <p className="text-[10px] text-white/30">{t('products.seats', { n: tier.maxSeats.toLocaleString(locale) })}</p>}
        </div>
      </div>
      {features.length > 0 && (
        <ul className="mt-3 space-y-1">
          {features.map((f, i) => (
            <li key={i} className="flex items-center gap-2 text-xs text-white/50">
              <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" />{f}
            </li>
          ))}
        </ul>
      )}
      {selected && <div className="mt-2 flex justify-end"><span className="text-[10px] font-semibold text-white">✓ {t('products.selected')}</span></div>}
    </button>
  )
}

function ProductCard({ product, onRequestSent }: { product: Product; onRequestSent: () => void }) {
  const { lang, t } = useClientLang()
  const [expanded, setExpanded] = useState(false)
  const [selectedTier, setSelected] = useState<string | null>(null)
  const [requesting, setRequesting] = useState(false)
  const [error, setError] = useState('')
  const act = product.activation

  async function request() {
    if (product.tiers.length > 0 && !selectedTier) { setError(t('products.selectTier')); return }
    setRequesting(true); setError('')
    const r = await fetch('/api/client/products', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: product.id, tierId: selectedTier }),
    })
    setRequesting(false)
    if (r.ok) { onRequestSent() }
    else {
      const data = await r.json().catch(() => ({}))
      setError(explainApiError(data.error, lang) || t('products.requestFailed'))
    }
  }

  const isActive = act?.status === 'ACTIVE'
  const isPending = act?.status === 'PENDING'
  const canRequest = !act || act.status === 'CANCELLED' || act.status === 'SUSPENDED'
  const since = act?.activatedAt
    ? new Date(act.activatedAt).toLocaleDateString(clientDateLocale(lang))
    : ''

  return (
    <div className={`bg-white/3 border rounded-xl overflow-hidden transition ${isActive ? 'border-emerald-500/25' : 'border-white/8'}`}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{product.logoEmoji ?? '📦'}</span>
            <div>
              <p className="text-sm font-bold text-white">{product.name}</p>
              {product.description && <p className="text-xs text-white/40 mt-0.5 leading-relaxed">{product.description}</p>}
            </div>
          </div>
          {act && (() => {
            const { cls, icon: Icon } = STATUS_CLS[act.status]
            return (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold shrink-0 ${cls}`}>
                <Icon className="w-3 h-3" />{t(STATUS_KEY[act.status])}
              </span>
            )
          })()}
        </div>

        {isActive && act?.tier && (
          <div className="mt-3 px-3 py-2 rounded-lg bg-emerald-500/5 border border-emerald-500/15 text-xs text-emerald-300">
            {t('products.activeOn', { tier: act.tier.name })}
            {since && ` · ${t('products.since', { date: since })}`}
          </div>
        )}

        {isPending && (
          <div className="mt-3 px-3 py-2 rounded-lg bg-yellow-500/5 border border-yellow-500/15 text-xs text-yellow-300">
            {t('products.pendingNote')}
          </div>
        )}

        {act?.notes && (
          <div className="mt-2 px-3 py-2 rounded-lg bg-red-500/5 border border-red-500/15 text-xs text-red-300">
            {act.notes}
          </div>
        )}

        {canRequest && product.tiers.length > 0 && (
          <div className="mt-4">
            <button
              onClick={() => setExpanded(e => !e)}
              className="flex items-center gap-1.5 text-xs text-white hover:opacity-80 transition"
            >
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              {expanded
                ? t('products.hidePlans')
                : product.tiers.length === 1
                  ? t('products.viewPlan')
                  : t('products.viewPlans', { n: product.tiers.length })}
            </button>

            {expanded && (
              <div className="mt-3 space-y-2">
                {product.tiers.map(tier => (
                  <TierCard key={tier.id} tier={tier} selected={selectedTier === tier.id} onSelect={() => setSelected(tier.id)} />
                ))}
              </div>
            )}
          </div>
        )}

        {canRequest && (
          <div className="mt-4">
            {error && <p className="text-xs text-red-400 mb-2">{error}</p>}
            <button onClick={request} disabled={requesting || (product.tiers.length > 0 && !selectedTier && !expanded)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition hover:opacity-90 disabled:opacity-40"
              style={{ backgroundColor: '#fff', color: '#000' }}>
              {requesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
              {requesting ? t('products.requesting') : t('products.request')}
            </button>
            {product.tiers.length > 0 && !expanded && (
              <p className="text-[10px] text-white/20 mt-1.5">{t('products.selectHint')}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ActivatePage() {
  const { t } = useClientLang()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    const r = await fetch('/api/client/products')
    if (r.ok) setProducts(await r.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const active = products.filter(p => p.activation?.status === 'ACTIVE')
  const pending = products.filter(p => p.activation?.status === 'PENDING')
  const rest = products.filter(p => !p.activation || p.activation.status === 'CANCELLED' || p.activation.status === 'SUSPENDED')

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold text-white">{t('products.title')}</h1>
          <p className="text-xs text-white/30 mt-0.5">{t('products.lead')}</p>
        </div>
        <button onClick={load} className="p-2 rounded-lg text-white/30 hover:text-white/60 transition" title={t('common.refresh')} aria-label={t('common.refresh')}>
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-white/30" /></div>
      ) : products.length === 0 ? (
        <div className="bg-white/3 border border-white/8 rounded-xl flex flex-col items-center justify-center py-16 text-center gap-3">
          <Package className="w-10 h-10 text-white/10" />
          <p className="text-sm text-white/40">{t('products.empty')}</p>
          <p className="text-xs text-white/20">{t('products.emptyHint')}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {active.length > 0 && (
            <section>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30 mb-3">{t('products.active')}</p>
              <div className="space-y-3">{active.map(p => <ProductCard key={p.id} product={p} onRequestSent={load} />)}</div>
            </section>
          )}
          {pending.length > 0 && (
            <section>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30 mb-3">{t('products.pending')}</p>
              <div className="space-y-3">{pending.map(p => <ProductCard key={p.id} product={p} onRequestSent={load} />)}</div>
            </section>
          )}
          {rest.length > 0 && (
            <section>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30 mb-3">{t('products.available')}</p>
              <div className="space-y-3">{rest.map(p => <ProductCard key={p.id} product={p} onRequestSent={load} />)}</div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
