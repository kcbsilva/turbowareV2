'use client'

import { History, Key, User, FileText, Ticket } from 'lucide-react'
import { useAdminLang } from '@/components/admin/AdminLangProvider'
import { dateLocale, type MsgKey } from '@/lib/admin-i18n'

type LicenseStatus = 'ACTIVE' | 'SUSPENDED' | 'REVOKED' | 'EXPIRED'

interface License {
  id: string
  key: string
  product: string
  status: LicenseStatus
  createdAt: string
  updatedAt?: string
}

interface Note {
  id: string
  body: string
  author: string
  createdAt: string
}

interface TicketEvent {
  id: string
  title: string
  status: string
  createdAt: string
}

interface Props {
  client: {
    id: string
    name: string
    createdAt: string
    updatedAt: string
  }
  licenses: License[]
  notes: Note[]
  tickets?: TicketEvent[]
}

interface TimelineEvent {
  id: string
  time: string
  icon: React.ElementType
  iconColor: string
  title: string
  detail?: string
}

const LICENSE_STATUS_KEY: Record<LicenseStatus, MsgKey> = {
  ACTIVE: 'licenses.status.active',
  SUSPENDED: 'licenses.status.suspended',
  REVOKED: 'lic.revoked',
  EXPIRED: 'lic.expired',
}

const TICKET_STATUS_KEY: Record<string, MsgKey> = {
  OPEN: 'ticket.open',
  IN_PROGRESS: 'ticket.progress',
  RESOLVED: 'ticket.resolved',
  CLOSED: 'ticket.closed',
}

const statusColors: Record<LicenseStatus, string> = {
  ACTIVE:    'text-foreground',
  SUSPENDED: 'text-muted-foreground',
  REVOKED:   'text-[#E85D4C]',
  EXPIRED:   'text-muted-foreground',
}

export function HistoryTab({ client, licenses, notes, tickets = [] }: Props) {
  const { t, lang } = useAdminLang()
  const events: TimelineEvent[] = []

  // Client created
  events.push({
    id: 'created',
    time: client.createdAt,
    icon: User,
    iconColor: 'text-primary',
    title: t('history.created'),
    detail: client.name,
  })

  // License assignments
  for (const l of licenses) {
    events.push({
      id: `lic-${l.id}`,
      time: l.createdAt,
      icon: Key,
      iconColor: statusColors[l.status],
      title: t('history.license'),
      detail: `${l.key} — ${l.product} (${t(LICENSE_STATUS_KEY[l.status])})`,
    })
  }

  // Notes
  for (const n of notes) {
    events.push({
      id: `note-${n.id}`,
      time: n.createdAt,
      icon: FileText,
      iconColor: 'text-muted-foreground',
      title: t('history.note', { name: n.author }),
      detail: n.body.length > 80 ? n.body.slice(0, 80) + '…' : n.body,
    })
  }

  for (const ticket of tickets) {
    events.push({
      id: `ticket-${ticket.id}`,
      time: ticket.createdAt,
      icon: Ticket,
      iconColor: 'text-[#2B6CB0]',
      title: t('history.ticket'),
      detail: `${ticket.title} (${TICKET_STATUS_KEY[ticket.status] ? t(TICKET_STATUS_KEY[ticket.status]) : ticket.status})`,
    })
  }

  // Sort newest first
  events.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())

  return (
    <div className="space-y-1">
      {events.length === 0 ? (
        <div className="bg-card border border-border rounded-lg px-6 py-10 flex flex-col items-center gap-2 text-muted-foreground">
          <History className="w-8 h-8 opacity-20" />
          <p className="text-xs">{t('history.empty')}</p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[22px] top-4 bottom-4 w-px bg-border" />

          <div className="space-y-0">
            {events.map((ev) => {
              const Icon = ev.icon
              return (
                <div key={ev.id} className="flex items-start gap-4 py-2.5 relative">
                  {/* Icon dot */}
                  <div className={`w-11 h-11 flex items-center justify-center shrink-0 z-10`}>
                    <div className="w-7 h-7 rounded-full bg-card border border-border flex items-center justify-center">
                      <Icon className={`w-3.5 h-3.5 ${ev.iconColor}`} />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 bg-card border border-border rounded-lg px-3 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-medium text-foreground">{ev.title}</p>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {new Date(ev.time).toLocaleString(dateLocale(lang))}
                      </span>
                    </div>
                    {ev.detail && (
                      <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{ev.detail}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
