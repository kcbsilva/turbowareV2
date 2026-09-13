'use client'

import { User, Key, ClipboardList, History, CreditCard, Ticket } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type ClientTab = 'overview' | 'licenses' | 'billing' | 'tickets' | 'notes' | 'history'

const PRIMARY: { id: ClientTab; icon: LucideIcon; label: string }[] = [
  { id: 'overview', icon: User, label: 'Client' },
  { id: 'licenses', icon: Key, label: 'Licenses' },
  { id: 'billing', icon: CreditCard, label: 'Billing' },
  { id: 'tickets', icon: Ticket, label: 'Tickets' },
]

const SECONDARY: { id: ClientTab; icon: LucideIcon; label: string }[] = [
  { id: 'notes', icon: ClipboardList, label: 'Notes' },
  { id: 'history', icon: History, label: 'History' },
]

interface Props {
  active: ClientTab
  onSelect: (id: ClientTab) => void
}

function NavButton({
  item,
  active,
  onSelect,
}: {
  item: { id: ClientTab; icon: LucideIcon; label: string }
  active: boolean
  onSelect: (id: ClientTab) => void
}) {
  const Icon = item.icon
  return (
    <button
      type="button"
      onClick={() => onSelect(item.id)}
      title={item.label}
      aria-label={item.label}
      aria-current={active ? 'page' : undefined}
      className={`relative flex flex-col items-center justify-center gap-1 px-1 py-2.5 ${
        active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      {active && <span className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-white" />}
      <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
      <span className="max-w-full truncate text-[10px] font-medium leading-none">{item.label}</span>
    </button>
  )
}

export function ClientNavBar({ active, onSelect }: Props) {
  return (
    <nav
      aria-label="Client profile sections"
      className="flex w-16 shrink-0 flex-col border-r border-border bg-background py-1"
    >
      {PRIMARY.map((item) => (
        <NavButton key={item.id} item={item} active={active === item.id} onSelect={onSelect} />
      ))}
      <span aria-hidden className="mx-3 my-1 h-px shrink-0 bg-border" />
      {SECONDARY.map((item) => (
        <NavButton key={item.id} item={item} active={active === item.id} onSelect={onSelect} />
      ))}
    </nav>
  )
}
