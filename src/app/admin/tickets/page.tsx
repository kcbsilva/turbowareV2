'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  Ticket,
  Loader2,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Send,
  ChevronLeft,
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

const CATEGORY_KEY: Record<string, MsgKey> = {
  Billing: 'ticket.cat.billing',
  Technical: 'ticket.cat.technical',
  Account: 'ticket.cat.account',
  Activation: 'ticket.cat.activation',
  Other: 'ticket.cat.other',
  General: 'ticket.cat.general',
}

export default function AdminTicketsPage() {
  const { t, lang } = useAdminLang()
  const locale = dateLocale(lang)
  const [tickets, setTickets] = useState<TicketRow[]>([])
  const [openCount, setOpenCount] = useState(0)
  const [inProgressCount, setInProgressCount] = useState(0)
  const [status, setStatus] = useState('')
  const [priority, setPriority] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<TicketFull | null>(null)
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)
  const [updating, setUpdating] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (status) params.set('status', status)
    if (priority) params.set('priority', priority)
    if (search) params.set('search', search)
    const res = await fetch(`/api/admin/tickets?${params.toString()}`, { cache: 'no-store' })
    if (res.ok) {
      const data = await res.json()
      setTickets(data.tickets)
      setOpenCount(data.openCount)
      setInProgressCount(data.inProgressCount)
    }
    setLoading(false)
  }, [status, priority, search])

  useEffect(() => { load() }, [load])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [selected?.messages.length])

  async function openTicket(id: string) {
    const res = await fetch(`/api/admin/tickets/${id}`, { cache: 'no-store' })
    if (res.ok) setSelected(await res.json())
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

  if (selected) {
    const meta = STATUS_STYLES[selected.status]
    const Icon = meta.icon
    return (
      <div className="h-full flex flex-col p-6">
        <button onClick={() => setSelected(null)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-4">
          <ChevronLeft className="w-3.5 h-3.5" /> {t('ticket.backInbox')}
        </button>

        <div className="bg-card border border-border rounded-lg p-4 mb-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-sm font-semibold text-foreground">{selected.title}</h1>
              <p className="text-[10px] text-muted-foreground mt-1">
                {(selected.category && CATEGORY_KEY[selected.category] ? t(CATEGORY_KEY[selected.category]) : selected.category) || t('ticket.cat.general')} · #{selected.id.slice(-8).toUpperCase()} ·{' '}
                <Link href={`/admin/clients/${selected.client.id}`} className="text-primary hover:underline">
                  {selected.client.company || selected.client.name}
                </Link>
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

        <div className="flex-1 overflow-y-auto space-y-3 mb-4">
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
                    {msg.authorName ?? (isAdmin ? t('ticket.support') : selected.client.name)} · {new Date(msg.createdAt).toLocaleString(locale)}
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
    <div className="h-full flex flex-col p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-bold text-foreground">{t('title.tickets')}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t('ticket.openCount', { n: openCount.toLocaleString(locale) })} · {t('ticket.progressCount', { n: inProgressCount.toLocaleString(locale) })}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('ticket.search')}
          className="flex-1 min-w-[180px] px-3 py-1.5 bg-card border border-border rounded-md text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-3 py-1.5 bg-card border border-border rounded-md text-xs">
          <option value="">{t('common.allStatuses')}</option>
          <option value="OPEN">{t('ticket.open')}</option>
          <option value="IN_PROGRESS">{t('ticket.progress')}</option>
          <option value="RESOLVED">{t('ticket.resolved')}</option>
          <option value="CLOSED">{t('ticket.closed')}</option>
        </select>
        <select value={priority} onChange={(e) => setPriority(e.target.value)} className="px-3 py-1.5 bg-card border border-border rounded-md text-xs">
          <option value="">{t('common.allPriorities')}</option>
          <option value="HIGH">{t('ticket.high')}</option>
          <option value="MEDIUM">{t('ticket.medium')}</option>
          <option value="LOW">{t('ticket.low')}</option>
        </select>
      </div>

      <div className="flex-1 bg-card border border-border rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
            <Ticket className="w-8 h-8 opacity-20" />
            <p className="text-xs">{t('ticket.emptyFilters')}</p>
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
                      {ticket.client.company || ticket.client.name}
                      {last ? ` · ${last.authorType === 'ADMIN' ? `${t('ticket.you')} ` : ''}${last.body}` : ''}
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
