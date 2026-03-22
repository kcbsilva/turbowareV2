'use client'

import { History, Key, User, FileText } from 'lucide-react'

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

interface Props {
  client: {
    id: string
    name: string
    createdAt: string
    updatedAt: string
  }
  licenses: License[]
  notes: Note[]
}

interface TimelineEvent {
  id: string
  time: string
  icon: React.ElementType
  iconColor: string
  title: string
  detail?: string
}

const statusColors: Record<LicenseStatus, string> = {
  ACTIVE:    'text-emerald-400',
  SUSPENDED: 'text-yellow-400',
  REVOKED:   'text-red-400',
  EXPIRED:   'text-muted-foreground',
}

export function HistoryTab({ client, licenses, notes }: Props) {
  const events: TimelineEvent[] = []

  // Client created
  events.push({
    id: 'created',
    time: client.createdAt,
    icon: User,
    iconColor: 'text-primary',
    title: `Client profile created`,
    detail: client.name,
  })

  // License assignments
  for (const l of licenses) {
    events.push({
      id: `lic-${l.id}`,
      time: l.createdAt,
      icon: Key,
      iconColor: statusColors[l.status],
      title: `License assigned`,
      detail: `${l.key} — ${l.product} (${l.status})`,
    })
  }

  // Notes
  for (const n of notes) {
    events.push({
      id: `note-${n.id}`,
      time: n.createdAt,
      icon: FileText,
      iconColor: 'text-muted-foreground',
      title: `Note added by ${n.author}`,
      detail: n.body.length > 80 ? n.body.slice(0, 80) + '…' : n.body,
    })
  }

  // Sort newest first
  events.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())

  return (
    <div className="space-y-1">
      {events.length === 0 ? (
        <div className="bg-card border border-border rounded-lg px-6 py-10 flex flex-col items-center gap-2 text-muted-foreground">
          <History className="w-8 h-8 opacity-20" />
          <p className="text-xs">No activity recorded yet.</p>
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
                        {new Date(ev.time).toLocaleString()}
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
