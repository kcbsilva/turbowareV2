'use client'

import { useState, useEffect, useRef } from 'react'
import { Ticket, Plus, ChevronLeft, Send, Loader2, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react'

type Status   = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
type Priority = 'LOW' | 'MEDIUM' | 'HIGH'
type AuthorType = 'CLIENT' | 'ADMIN'

interface Message  { id: string; body: string; authorType: AuthorType; authorName: string | null; createdAt: string }
interface TicketFull { id: string; title: string; status: Status; priority: Priority; category: string | null; createdAt: string; updatedAt: string; messages: Message[] }
interface TicketSummary extends Omit<TicketFull, 'messages'> { messages: Message[]; _count: { messages: number } }

const STATUS_STYLES: Record<Status, { label: string; cls: string; icon: React.ElementType }> = {
  OPEN:        { label: 'Open',        cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20',    icon: Clock         },
  IN_PROGRESS: { label: 'In Progress', cls: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', icon: AlertCircle },
  RESOLVED:    { label: 'Resolved',    cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: CheckCircle },
  CLOSED:      { label: 'Closed',      cls: 'bg-white/5 text-white/30 border-white/10',            icon: XCircle      },
}

const PRIORITY_STYLES: Record<Priority, string> = {
  LOW:    'text-white/30',
  MEDIUM: 'text-yellow-400/70',
  HIGH:   'text-red-400',
}

const CATEGORIES = ['Billing', 'Technical', 'Account', 'Activation', 'Other']

export default function TicketsPage() {
  const [tickets, setTickets] = useState<TicketSummary[]>([])
  const [selected, setSelected] = useState<TicketFull | null>(null)
  const [creating, setCreating] = useState(false)
  const [loading, setLoading]   = useState(true)
  const [reply, setReply]       = useState('')
  const [sending, setSending]   = useState(false)
  const [form, setForm]         = useState({ title: '', body: '', category: 'Technical', priority: 'MEDIUM' as Priority })
  const [submitting, setSubmitting] = useState(false)
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
    const r = await fetch(`/api/client/tickets/${selected.id}/messages`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: reply }),
    })
    if (r.ok) { setReply(''); openTicket(selected.id) }
    setSending(false)
  }

  async function createTicket(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    const r = await fetch('/api/client/tickets', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (r.ok) {
      const t = await r.json()
      setCreating(false)
      setForm({ title: '', body: '', category: 'Technical', priority: 'MEDIUM' })
      await loadTickets()
      openTicket(t.id)
    }
    setSubmitting(false)
  }

  useEffect(() => { loadTickets() }, [])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [selected?.messages.length])

  const inp  = 'w-full px-3 py-2.5 rounded-lg text-sm bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#fca311]/50 focus:border-[#fca311]/50 transition'
  const card = 'bg-white/3 border border-white/8 rounded-xl'

  // ── Thread view ────────────────────────────────────────────────────────────
  if (selected) {
    const { label, cls, icon: Icon } = STATUS_STYLES[selected.status]
    return (
      <div className="max-w-2xl mx-auto px-6 py-8 flex flex-col h-[calc(100vh-56px)]">
        <button onClick={() => setSelected(null)} className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition mb-4">
          <ChevronLeft className="w-3.5 h-3.5" /> Back to tickets
        </button>

        <div className={`${card} p-4 mb-4`}>
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-sm font-semibold text-white flex-1">{selected.title}</h2>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold shrink-0 ${cls}`}>
              <Icon className="w-3 h-3" />{label}
            </span>
          </div>
          {selected.category && <p className="text-[10px] text-white/30 mt-1">{selected.category} · #{selected.id.slice(-8).toUpperCase()}</p>}
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 mb-4">
          {selected.messages.map(msg => {
            const isAdmin = msg.authorType === 'ADMIN'
            return (
              <div key={msg.id} className={`flex gap-3 ${isAdmin ? '' : 'flex-row-reverse'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${isAdmin ? 'bg-[#fca311] text-[#081124]' : 'bg-white/10 text-white/60'}`}>
                  {isAdmin ? 'S' : 'C'}
                </div>
                <div className={`max-w-[80%] ${isAdmin ? '' : 'items-end flex flex-col'}`}>
                  <div className={`px-3.5 py-2.5 rounded-xl text-sm text-white/90 leading-relaxed ${isAdmin ? 'bg-white/8 rounded-tl-none' : 'bg-[#fca311]/15 border border-[#fca311]/20 rounded-tr-none'}`}>
                    {msg.body}
                  </div>
                  <p className="text-[10px] text-white/20 mt-1 px-1">
                    {msg.authorName ?? (isAdmin ? 'Support' : 'You')} · {new Date(msg.createdAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                  </p>
                </div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>

        {selected.status !== 'CLOSED' ? (
          <form onSubmit={sendReply} className={`${card} p-3 flex gap-2`}>
            <input className={`${inp} flex-1`} placeholder="Write a reply…" value={reply} onChange={e => setReply(e.target.value)} />
            <button type="submit" disabled={sending || !reply.trim()}
              className="px-4 py-2.5 rounded-lg font-semibold text-sm transition hover:opacity-90 disabled:opacity-40 flex items-center gap-1.5"
              style={{ backgroundColor: '#fca311', color: '#081124' }}>
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
        ) : (
          <div className="text-center text-xs text-white/20 py-3">This ticket is closed.</div>
        )}
      </div>
    )
  }

  // ── New ticket form ────────────────────────────────────────────────────────
  if (creating) return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <button onClick={() => setCreating(false)} className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition mb-6">
        <ChevronLeft className="w-3.5 h-3.5" /> Back
      </button>
      <h1 className="text-lg font-bold text-white mb-6">New Support Ticket</h1>
      <form onSubmit={createTicket} className={`${card} p-6 space-y-4`}>
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-white/40 mb-1.5">Subject</label>
          <input className={inp} placeholder="Brief description of the issue" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-white/40 mb-1.5">Category</label>
            <select className={inp} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-white/40 mb-1.5">Priority</label>
            <select className={inp} value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as Priority }))}>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-wider text-white/40 mb-1.5">Message</label>
          <textarea className={`${inp} resize-none`} rows={5} placeholder="Describe your issue in detail…" value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} required />
        </div>
        <div className="flex gap-3 pt-1">
          <button type="button" onClick={() => setCreating(false)} className="flex-1 py-2.5 text-sm border border-white/10 rounded-lg text-white/40 hover:text-white/70 transition">Cancel</button>
          <button type="submit" disabled={submitting}
            className="flex-1 py-2.5 text-sm font-semibold rounded-lg transition hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-2"
            style={{ backgroundColor: '#fca311', color: '#081124' }}>
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {submitting ? 'Submitting…' : 'Submit ticket'}
          </button>
        </div>
      </form>
    </div>
  )

  // ── Ticket list ────────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-bold text-white">Support Tickets</h1>
        <button onClick={() => setCreating(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition hover:opacity-90"
          style={{ backgroundColor: '#fca311', color: '#081124' }}>
          <Plus className="w-3.5 h-3.5" /> New ticket
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-white/30" /></div>
      ) : tickets.length === 0 ? (
        <div className={`${card} flex flex-col items-center justify-center py-16 text-center gap-3`}>
          <Ticket className="w-10 h-10 text-white/10" />
          <p className="text-sm text-white/40">No tickets yet</p>
          <button onClick={() => setCreating(true)} className="text-xs text-[#fca311] hover:opacity-80 transition">Open your first ticket →</button>
        </div>
      ) : (
        <div className={`${card} divide-y divide-white/5`}>
          {tickets.map(t => {
            const { label, cls, icon: Icon } = STATUS_STYLES[t.status]
            const last = t.messages[0]
            return (
              <button key={t.id} onClick={() => openTicket(t.id)}
                className="w-full px-4 py-3.5 flex items-start gap-3 hover:bg-white/3 transition text-left">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${t.status === 'CLOSED' ? 'bg-white/5' : 'bg-[#fca311]/10'}`}>
                  <Ticket className={`w-3.5 h-3.5 ${t.status === 'CLOSED' ? 'text-white/20' : 'text-[#fca311]'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <p className="text-sm font-medium text-white truncate">{t.title}</p>
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full border text-[9px] font-semibold shrink-0 ${cls}`}>
                      <Icon className="w-2.5 h-2.5" />{label}
                    </span>
                  </div>
                  {last && <p className="text-xs text-white/30 truncate">{last.authorType === 'ADMIN' ? '↩ Support: ' : ''}{last.body}</p>}
                  <p className="text-[10px] text-white/20 mt-1 flex items-center gap-2">
                    <span className={PRIORITY_STYLES[t.priority]}>{t.priority}</span>
                    <span>·</span>
                    <span>{t._count.messages} message{t._count.messages !== 1 ? 's' : ''}</span>
                    <span>·</span>
                    <span>{new Date(t.updatedAt).toLocaleDateString('pt-BR')}</span>
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
