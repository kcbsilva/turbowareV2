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

const STATUS_STYLES: Record<Status, { label: string; cls: string; icon: React.ElementType }> = {
  OPEN:        { label: 'Open',        cls: 'tw-badge-sky', icon: Clock },
  IN_PROGRESS: { label: 'In Progress', cls: 'tw-badge-peach', icon: AlertCircle },
  RESOLVED:    { label: 'Resolved',    cls: 'tw-badge-teal', icon: CheckCircle },
  CLOSED:      { label: 'Closed',      cls: 'tw-badge-mute', icon: XCircle },
}

export default function AdminTicketsPage() {
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
          <ChevronLeft className="w-3.5 h-3.5" /> Back to inbox
        </button>

        <div className="bg-card border border-border rounded-lg p-4 mb-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-sm font-semibold text-foreground">{selected.title}</h1>
              <p className="text-[10px] text-muted-foreground mt-1">
                {selected.category || 'General'} · #{selected.id.slice(-8).toUpperCase()} ·{' '}
                <Link href={`/admin/clients/${selected.client.id}`} className="text-primary hover:underline">
                  {selected.client.company || selected.client.name}
                </Link>
              </p>
            </div>
            <span className={`tw-badge gap-1 ${meta.cls}`}>
              <Icon className="w-3 h-3" />{meta.label}
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
                {STATUS_STYLES[s].label}
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
                    {msg.authorName ?? (isAdmin ? 'Support' : selected.client.name)} · {new Date(msg.createdAt).toLocaleString()}
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
              placeholder="Reply as admin…"
              value={reply}
              onChange={(e) => setReply(e.target.value)}
            />
            <button
              type="submit"
              disabled={sending || !reply.trim()}
              className="px-3 py-2 rounded-md text-xs font-semibold disabled:opacity-40"
              style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
        ) : (
          <p className="text-center text-xs text-muted-foreground py-2">This ticket is closed.</p>
        )}
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-bold text-foreground">Tickets</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {openCount} open · {inProgressCount} in progress
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search title, client, category…"
          className="flex-1 min-w-[180px] px-3 py-1.5 bg-card border border-border rounded-md text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-3 py-1.5 bg-card border border-border rounded-md text-xs">
          <option value="">All statuses</option>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In progress</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
        </select>
        <select value={priority} onChange={(e) => setPriority(e.target.value)} className="px-3 py-1.5 bg-card border border-border rounded-md text-xs">
          <option value="">All priorities</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
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
            <p className="text-xs">No tickets match these filters.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {tickets.map((t) => {
              const meta = STATUS_STYLES[t.status]
              const Icon = meta.icon
              const last = t.messages[0]
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => openTicket(t.id)}
                  className="w-full px-4 py-3 flex items-start gap-3 hover:bg-muted/40 text-left"
                >
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Ticket className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-medium text-foreground truncate">{t.title}</p>
                      <span className={`tw-badge gap-1 ${meta.cls}`}>
                        <Icon className="w-2.5 h-2.5" />{meta.label}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {t.client.company || t.client.name}
                      {last ? ` · ${last.authorType === 'ADMIN' ? 'You: ' : ''}${last.body}` : ''}
                    </p>
                    <p className="text-[10px] text-muted-foreground/70 mt-1">
                      {t.priority} · {t._count.messages} messages · {new Date(t.updatedAt).toLocaleDateString()}
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
