'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Ticket,
  Loader2,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Send,
  ChevronLeft,
  Plus,
} from 'lucide-react'
import { useAdminLang } from '@/components/admin/AdminLangProvider'
import { dateLocale, type MsgKey } from '@/lib/admin-i18n'

type Status = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
type Priority = 'LOW' | 'MEDIUM' | 'HIGH'
type AuthorType = 'CLIENT' | 'ADMIN'

interface Message {
  id: string
  body: string
  authorType: AuthorType
  authorName: string | null
  createdAt: string
}

interface TicketRow {
  id: string
  title: string
  status: Status
  priority: Priority
  category: string | null
  createdAt: string
  updatedAt: string
  client: { id: string; name: string; company: string | null; email: string | null }
  messages: Message[]
  _count: { messages: number }
}

interface TicketFull extends Omit<TicketRow, '_count'> {
  messages: Message[]
}

const STATUS_STYLES: Record<Status, { cls: string; icon: React.ElementType }> = {
  OPEN:        { cls: 'tw-badge-sky', icon: Clock },
  IN_PROGRESS: { cls: 'tw-badge-peach', icon: AlertCircle },
  RESOLVED:    { cls: 'tw-badge-teal', icon: CheckCircle },
  CLOSED:      { cls: 'tw-badge-mute', icon: XCircle },
}

const STATUS_KEY: Record<Status, MsgKey> = {
  OPEN: 'ticket.open',
  IN_PROGRESS: 'ticket.progress',
  RESOLVED: 'ticket.resolved',
  CLOSED: 'ticket.closed',
}

const PRIORITY_KEY: Record<Priority, MsgKey> = {
  LOW: 'ticket.low',
  MEDIUM: 'ticket.medium',
  HIGH: 'ticket.high',
}

const CATEGORIES = ['Billing', 'Technical', 'Account', 'Activation', 'Other'] as const

const CATEGORY_KEY: Record<string, MsgKey> = {
  Billing: 'ticket.cat.billing',
  Technical: 'ticket.cat.technical',
  Account: 'ticket.cat.account',
  Activation: 'ticket.cat.activation',
  Other: 'ticket.cat.other',
  General: 'ticket.cat.general',
}

interface Props {
  clientId: string
  clientName: string
}

export function TicketsTab({ clientId, clientName }: Props) {
  const { t, lang } = useAdminLang()
  const locale = dateLocale(lang)
  const [tickets, setTickets] = useState<TicketRow[]>([])
  const [openCount, setOpenCount] = useState(0)
  const [inProgressCount, setInProgressCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<TicketFull | null>(null)
  const [creating, setCreating] = useState(false)
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ title: '', body: '', category: 'Technical', priority: 'MEDIUM' as Priority })
  const bottomRef = useRef<HTMLDivElement>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/admin/tickets?clientId=${encodeURIComponent(clientId)}`, { cache: 'no-store' })
    if (res.ok) {
      const data = await res.json()
      setTickets(data.tickets)
      setOpenCount(data.openCount)
      setInProgressCount(data.inProgressCount)
    }
    setLoading(false)
  }, [clientId])

  useEffect(() => { load() }, [load])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [selected?.messages.length])

  async function openTicket(id: string) {
    const res = await fetch(`/api/admin/tickets/${id}`, { cache: 'no-store' })
    if (res.ok) {
      const ticket = await res.json()
      if (ticket.client?.id === clientId) setSelected(ticket)
    }
  }

  async function sendReply(e: React.FormEvent) {
    e.preventDefault()
    if (!selected || !reply.trim()) return
    setSending(true)
    const res = await fetch(`/api/admin/tickets/${selected.id}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: reply }),
    })
    setSending(false)
    if (res.ok) {
      setReply('')
      await openTicket(selected.id)
      await load()
    }
  }

  async function changeStatus(next: Status) {
    if (!selected) return
    setUpdating(true)
    const res = await fetch(`/api/admin/tickets/${selected.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    })
    setUpdating(false)
    if (res.ok) {
      setSelected(await res.json())
      await load()
    }
  }

  async function createTicket(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim() || !form.body.trim()) return
    setSubmitting(true)
    const res = await fetch('/api/admin/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, clientId }),
    })
    setSubmitting(false)
    if (res.ok) {
      const ticket = await res.json()
      setCreating(false)
      setForm({ title: '', body: '', category: 'Technical', priority: 'MEDIUM' })
      await load()
      setSelected(ticket)
    }
  }

  if (creating) {
    return (
      <div className="space-y-4">
        <button type="button" onClick={() => setCreating(false)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-3.5 h-3.5" /> {t('ticket.back')}
        </button>
        <form onSubmit={createTicket} className="bg-card border border-border rounded-lg p-4 space-y-3">
          <h2 className="text-sm font-semibold text-foreground">{t('ticket.newFor', { name: clientName })}</h2>
          <input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder={t('ticket.subject')}
            className="w-full px-3 py-2 bg-muted border border-border rounded-md text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <textarea
            value={form.body}
            onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
            rows={4}
            placeholder={t('ticket.firstMessage')}
            className="w-full px-3 py-2 bg-muted border border-border rounded-md text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
          <div className="flex flex-wrap gap-2">
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="px-3 py-1.5 bg-muted border border-border rounded-md text-xs"
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{t(CATEGORY_KEY[c])}</option>)}
            </select>
            <select
              value={form.priority}
              onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as Priority }))}
              className="px-3 py-1.5 bg-muted border border-border rounded-md text-xs"
            >
              <option value="LOW">{t('ticket.low')}</option>
              <option value="MEDIUM">{t('ticket.medium')}</option>
              <option value="HIGH">{t('ticket.high')}</option>
            </select>
            <button
              type="submit"
              disabled={submitting || !form.title.trim() || !form.body.trim()}
              className="tw-btn-primary ml-auto px-3 py-1.5 rounded-md text-xs font-semibold disabled:opacity-40"
            >
              {submitting ? t('ticket.opening') : t('ticket.openAction')}
            </button>
          </div>
        </form>
      </div>
    )
  }

  if (selected) {
    const meta = STATUS_STYLES[selected.status]
    const Icon = meta.icon
    return (
      <div className="flex min-h-0 flex-col">
        <button type="button" onClick={() => setSelected(null)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-4">
          <ChevronLeft className="w-3.5 h-3.5" /> {t('ticket.back')}
        </button>

        <div className="bg-card border border-border rounded-lg p-4 mb-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-sm font-semibold text-foreground">{selected.title}</h1>
              <p className="text-[10px] text-muted-foreground mt-1">
                {(selected.category && CATEGORY_KEY[selected.category] ? t(CATEGORY_KEY[selected.category]) : selected.category) || t('ticket.cat.general')} · #{selected.id.slice(-8).toUpperCase()}
              </p>
            </div>
            <span className={`tw-badge gap-1 ${meta.cls}`}>
              <Icon className="w-3 h-3" />{t(STATUS_KEY[selected.status])}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as Status[]).map((s) => (
              <button
                key={s}
                type="button"
                disabled={updating || selected.status === s}
                onClick={() => changeStatus(s)}
                className="px-2 py-1 rounded-md border border-border text-[10px] font-medium text-foreground hover:bg-muted disabled:opacity-40"
              >
                {t(STATUS_KEY[s])}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3 mb-4">
          {selected.messages.map((msg) => {
            const isAdmin = msg.authorType === 'ADMIN'
            return (
              <div key={msg.id} className={`flex gap-3 ${isAdmin ? 'flex-row-reverse' : ''}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${isAdmin ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground'}`}>
                  {isAdmin ? 'A' : 'C'}
                </div>
                <div className={`max-w-[80%] ${isAdmin ? 'items-end flex flex-col' : ''}`}>
                  <div className={`px-3.5 py-2.5 rounded-xl text-xs text-foreground leading-relaxed ${isAdmin ? 'bg-primary/10 border border-primary/20 rounded-tr-none' : 'bg-muted rounded-tl-none'}`}>
                    {msg.body}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1 px-1">
                    {msg.authorName ?? (isAdmin ? t('ticket.support') : clientName)} · {new Date(msg.createdAt).toLocaleString(locale)}
                  </p>
                </div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>

        {selected.status !== 'CLOSED' ? (
          <form onSubmit={sendReply} className="bg-card border border-border rounded-lg p-3 flex gap-2">
            <input
              className="flex-1 px-3 py-2 bg-muted border border-border rounded-md text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder={t('ticket.reply')}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
            />
            <button
              type="submit"
              disabled={sending || !reply.trim()}
              className="tw-btn-primary px-3 py-2 rounded-md text-xs font-semibold disabled:opacity-40"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
        ) : (
          <p className="text-center text-xs text-muted-foreground py-2">{t('ticket.closedHint')}</p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          {t('ticket.openCount', { n: openCount.toLocaleString(locale) })} · {t('ticket.progressCount', { n: inProgressCount.toLocaleString(locale) })}
        </p>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="tw-btn-primary flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold"
        >
          <Plus className="w-3.5 h-3.5" />
          {t('ticket.new')}
        </button>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
            <Ticket className="w-8 h-8 opacity-20" />
            <p className="text-xs">{t('ticket.emptyClient')}</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {tickets.map((ticket) => {
              const meta = STATUS_STYLES[ticket.status]
              const Icon = meta.icon
              const last = ticket.messages[0]
              return (
                <button
                  key={ticket.id}
                  type="button"
                  onClick={() => openTicket(ticket.id)}
                  className="w-full px-4 py-3 flex items-start gap-3 hover:bg-muted/40 text-left"
                >
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Ticket className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-medium text-foreground truncate">{ticket.title}</p>
                      <span className={`tw-badge gap-1 ${meta.cls}`}>
                        <Icon className="w-2.5 h-2.5" />{t(STATUS_KEY[ticket.status])}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {last ? `${last.authorType === 'ADMIN' ? `${t('ticket.you')} ` : ''}${last.body}` : t('ticket.noMessages')}
                    </p>
                    <p className="text-[10px] text-muted-foreground/70 mt-1">
                      {t(PRIORITY_KEY[ticket.priority])} · {ticket._count.messages === 1 ? t('ticket.messageOne') : t('ticket.messageMany', { n: ticket._count.messages.toLocaleString(locale) })} · {new Date(ticket.updatedAt).toLocaleDateString(locale)}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
