'use client'

import { useState, useEffect, useRef } from 'react'
import { Ticket, Plus, ChevronLeft, Send, Loader2, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react'
import { useClientLang } from '@/components/client/ClientLangProvider'
import { clientDateLocale, type ClientMsgKey } from '@/lib/client-i18n'
import { explainApiError } from '@/lib/api-errors'

type Status = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
type Priority = 'LOW' | 'MEDIUM' | 'HIGH'
type AuthorType = 'CLIENT' | 'ADMIN'
type Category = 'Billing' | 'Technical' | 'Account' | 'Activation' | 'Other'

interface Message { id: string; body: string; authorType: AuthorType; authorName: string | null; createdAt: string }
interface TicketFull { id: string; title: string; status: Status; priority: Priority; category: string | null; createdAt: string; updatedAt: string; messages: Message[] }
interface TicketSummary extends Omit<TicketFull, 'messages'> { messages: Message[]; _count: { messages: number } }

const STATUS_KEY: Record<Status, ClientMsgKey> = {
  OPEN: 'status.OPEN',
  IN_PROGRESS: 'status.IN_PROGRESS',
  RESOLVED: 'status.RESOLVED',
  CLOSED: 'status.CLOSED',
}

const STATUS_STYLES: Record<Status, { cls: string; icon: React.ElementType }> = {
  OPEN: { cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: Clock },
  IN_PROGRESS: { cls: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', icon: AlertCircle },
  RESOLVED: { cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: CheckCircle },
  CLOSED: { cls: 'bg-white/5 text-white/30 border-white/10', icon: XCircle },
}

const PRIORITY_STYLES: Record<Priority, string> = {
  LOW: 'text-white/30',
  MEDIUM: 'text-yellow-400/70',
  HIGH: 'text-red-400',
}

const CATEGORIES: Category[] = ['Billing', 'Technical', 'Account', 'Activation', 'Other']
const PRIORITIES: Priority[] = ['LOW', 'MEDIUM', 'HIGH']

function categoryLabel(category: string | null, t: (key: ClientMsgKey) => string) {
  if (!category) return ''
  const key = `category.${category}` as ClientMsgKey
  return CATEGORIES.includes(category as Category) ? t(key) : category
}

export default function TicketsPage() {
  const { lang, t } = useClientLang()
  const locale = clientDateLocale(lang)
  const [tickets, setTickets] = useState<TicketSummary[]>([])
  const [selected, setSelected] = useState<TicketFull | null>(null)
  const [creating, setCreating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)
  const [form, setForm] = useState({ title: '', body: '', category: 'Technical' as Category, priority: 'MEDIUM' as Priority })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  async function loadTickets() {
    const r = await fetch('/api/client/tickets')
    if (r.ok) setTickets(await r.json())
    setLoading(false)
  }

  async function openTicket(id: string) {
    const r = await fetch(`/api/client/tickets/${id}`)
    if (r.ok) setSelected(await r.json())
  }

  async function sendReply(e: React.FormEvent) {
    e.preventDefault()
    if (!reply.trim() || !selected) return
    setSending(true)
    setError('')
    const r = await fetch(`/api/client/tickets/${selected.id}/messages`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: reply }),
    })
    if (r.ok) {
      setReply('')
      openTicket(selected.id)
    } else {
      const data = await r.json().catch(() => ({}))
      setError(explainApiError(data.error, lang) || t('tickets.replyFailed'))
    }
    setSending(false)
  }

  async function createTicket(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    const r = await fetch('/api/client/tickets', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (r.ok) {
      const created = await r.json()
      setCreating(false)
      setForm({ title: '', body: '', category: 'Technical', priority: 'MEDIUM' })
      await loadTickets()
      openTicket(created.id)
    } else {
      const data = await r.json().catch(() => ({}))
      setError(explainApiError(data.error, lang) || t('tickets.createFailed'))
    }
    setSubmitting(false)
  }

  useEffect(() => { loadTickets() }, [])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [selected?.messages.length])

  const inp = 'w-full px-3 py-2.5 rounded-lg text-sm bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/30 transition'
  const card = 'bg-white/3 border border-white/8 rounded-xl'

  if (selected) {
    const { cls, icon: Icon } = STATUS_STYLES[selected.status]
    return (
      <div className="max-w-2xl mx-auto px-6 py-8 flex flex-col h-[calc(100vh-56px)]">
        <button onClick={() => { setSelected(null); setError('') }} className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition mb-4">
          <ChevronLeft className="w-3.5 h-3.5" /> {t('tickets.backList')}
        </button>

        <div className={`${card} p-4 mb-4`}>
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-sm font-semibold text-white flex-1">{selected.title}</h2>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold shrink-0 ${cls}`}>
              <Icon className="w-3 h-3" />{t(STATUS_KEY[selected.status])}
            </span>
          </div>
          {selected.category && (
            <p className="text-[10px] text-white/30 mt-1">{categoryLabel(selected.category, t)} · #{selected.id.slice(-8).toUpperCase()}</p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 mb-4">
          {selected.messages.map(msg => {
            const isAdmin = msg.authorType === 'ADMIN'
            return (
              <div key={msg.id} className={`flex gap-3 ${isAdmin ? '' : 'flex-row-reverse'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${isAdmin ? 'bg-white text-black' : 'bg-white/10 text-white/60'}`}>
                  {isAdmin ? 'S' : 'C'}
                </div>
                <div className={`max-w-[80%] ${isAdmin ? '' : 'items-end flex flex-col'}`}>
                  <div className={`px-3.5 py-2.5 rounded-xl text-sm text-white/90 leading-relaxed ${isAdmin ? 'bg-white/8 rounded-tl-none' : 'bg-white/10 border border-white/15 rounded-tr-none'}`}>
                    {msg.body}
                  </div>
                  <p className="text-[10px] text-white/20 mt-1 px-1">
                    {msg.authorName ?? (isAdmin ? t('tickets.support') : t('tickets.you'))} · {new Date(msg.createdAt).toLocaleString(locale, { dateStyle: 'short', timeStyle: 'short' })}
                  </p>
                </div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>

        {selected.status !== 'CLOSED' ? (
          <form onSubmit={sendReply} className={`${card} p-3 space-y-2`}>
            {error && <p className="text-xs text-red-400">{error}</p>}
            <div className="flex gap-2">
              <input className={`${inp} flex-1`} placeholder={t('tickets.replyPlaceholder')} value={reply} onChange={e => setReply(e.target.value)} />
              <button type="submit" disabled={sending || !reply.trim()}
                className="px-4 py-2.5 rounded-lg font-semibold text-sm transition hover:opacity-90 disabled:opacity-40 flex items-center gap-1.5"
                aria-label={t('tickets.submit')}
                style={{ backgroundColor: '#fff', color: '#000' }}>
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center text-xs text-white/20 py-3">{t('tickets.closed')}</div>
        )}
      </div>
    )
  }

  if (creating) return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <button onClick={() => { setCreating(false); setError('') }} className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition mb-6">
        <ChevronLeft className="w-3.5 h-3.5" /> {t('common.back')}
      </button>
      <h1 className="text-lg font-bold text-white mb-6">{t('tickets.newTitle')}</h1>
      <form onSubmit={createTicket} className={`${card} p-6 space-y-4`}>
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-white/40 mb-1.5">{t('tickets.subject')}</label>
          <input className={inp} placeholder={t('tickets.subjectPlaceholder')} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-white/40 mb-1.5">{t('tickets.category')}</label>
            <select className={inp} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as Category }))}>
              {CATEGORIES.map(c => <option key={c} value={c}>{t(`category.${c}` as ClientMsgKey)}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-white/40 mb-1.5">{t('tickets.priority')}</label>
            <select className={inp} value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as Priority }))}>
              {PRIORITIES.map(p => <option key={p} value={p}>{t(`priority.${p}` as ClientMsgKey)}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-white/40 mb-1.5">{t('tickets.message')}</label>
          <textarea className={`${inp} resize-none`} rows={5} placeholder={t('tickets.messagePlaceholder')} value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} required />
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
        <div className="flex gap-3 pt-1">
          <button type="button" onClick={() => setCreating(false)} className="flex-1 py-2.5 text-sm border border-white/10 rounded-lg text-white/40 hover:text-white/70 transition">{t('common.cancel')}</button>
          <button type="submit" disabled={submitting}
            className="flex-1 py-2.5 text-sm font-semibold rounded-lg transition hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-2"
            style={{ backgroundColor: '#fff', color: '#000' }}>
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {submitting ? t('tickets.submitting') : t('tickets.submit')}
          </button>
        </div>
      </form>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-bold text-white">{t('tickets.title')}</h1>
        <button onClick={() => setCreating(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition hover:opacity-90"
          style={{ backgroundColor: '#fff', color: '#000' }}>
          <Plus className="w-3.5 h-3.5" /> {t('tickets.new')}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-white/30" /></div>
      ) : tickets.length === 0 ? (
        <div className={`${card} flex flex-col items-center justify-center py-16 text-center gap-3`}>
          <Ticket className="w-10 h-10 text-white/10" />
          <p className="text-sm text-white/40">{t('tickets.empty')}</p>
          <button onClick={() => setCreating(true)} className="text-xs text-white hover:opacity-80 transition">{t('tickets.openFirst')}</button>
        </div>
      ) : (
        <div className={`${card} divide-y divide-white/5`}>
          {tickets.map(ticket => {
            const { cls, icon: Icon } = STATUS_STYLES[ticket.status]
            const last = ticket.messages[0]
            return (
              <button key={ticket.id} onClick={() => openTicket(ticket.id)}
                className="w-full px-4 py-3.5 flex items-start gap-3 hover:bg-white/3 transition text-left">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${ticket.status === 'CLOSED' ? 'bg-white/5' : 'bg-white/10'}`}>
                  <Ticket className={`w-3.5 h-3.5 ${ticket.status === 'CLOSED' ? 'text-white/20' : 'text-white'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <p className="text-sm font-medium text-white truncate">{ticket.title}</p>
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full border text-[9px] font-semibold shrink-0 ${cls}`}>
                      <Icon className="w-2.5 h-2.5" />{t(STATUS_KEY[ticket.status])}
                    </span>
                  </div>
                  {last && <p className="text-xs text-white/30 truncate">{last.authorType === 'ADMIN' ? t('tickets.supportPrefix') : ''}{last.body}</p>}
                  <p className="text-[10px] text-white/20 mt-1 flex items-center gap-2">
                    <span className={PRIORITY_STYLES[ticket.priority]}>{t(`priority.${ticket.priority}` as ClientMsgKey)}</span>
                    <span>·</span>
                    <span>{ticket._count.messages === 1 ? t('tickets.messageOne', { n: ticket._count.messages }) : t('tickets.messageMany', { n: ticket._count.messages })}</span>
                    <span>·</span>
                    <span>{new Date(ticket.updatedAt).toLocaleDateString(locale)}</span>
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
