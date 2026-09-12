'use client'

import { User, Key, ClipboardList, History, CreditCard, Ticket } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type ClientTab = 'overview' | 'licenses' | 'billing' | 'tickets' | 'notes' | 'history'

const PRIMARY: { id: ClientTab; icon: LucideIcon; label: string }[] = [
  { id: 'overview', icon: User, label: 'Overview' },
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
      className={[
        'profile-nav-item relative z-[1] flex items-center gap-1.5 shrink-0 px-2.5 text-[12px] font-medium whitespace-nowrap transition-colors duration-100 focus:outline-none',
        active
          ? 'profile-folder-tab h-full text-[#1B2430]'
          : 'my-1 h-7 rounded-lg text-white/70 hover:bg-black/20 hover:text-white',
      ].join(' ')}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />
      <span>{item.label}</span>
    </button>
  )
}

export function ClientNavBar({ active, onSelect }: Props) {
  return (
    <nav
      aria-label="Client profile sections"
      className="profile-nav flex items-end gap-0.5 h-9 px-3 shrink-0 overflow-x-auto scrollbar-none"
    >
      {PRIMARY.map((item) => (
        <NavButton key={item.id} item={item} active={active === item.id} onSelect={onSelect} />
      ))}
      <span aria-hidden className="self-center mx-1.5 h-4 w-px shrink-0 bg-white/25" />
      {SECONDARY.map((item) => (
        <NavButton key={item.id} item={item} active={active === item.id} onSelect={onSelect} />
      ))}
    </nav>
  )
}
