'use client'

import { User, Key, ClipboardList, History, CreditCard, Ticket } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useAdminLang } from '@/components/admin/AdminLangProvider'
import type { MsgKey } from '@/lib/admin-i18n'

export type ClientTab = 'overview' | 'licenses' | 'billing' | 'tickets' | 'notes' | 'history'

const PRIMARY: { id: ClientTab; icon: LucideIcon; labelKey: MsgKey }[] = [
  { id: 'overview', icon: User, labelKey: 'profile.tab.overview' },
  { id: 'licenses', icon: Key, labelKey: 'profile.tab.licenses' },
  { id: 'billing', icon: CreditCard, labelKey: 'profile.tab.billing' },
  { id: 'tickets', icon: Ticket, labelKey: 'profile.tab.tickets' },
]

const SECONDARY: { id: ClientTab; icon: LucideIcon; labelKey: MsgKey }[] = [
  { id: 'notes', icon: ClipboardList, labelKey: 'profile.tab.notes' },
  { id: 'history', icon: History, labelKey: 'profile.tab.history' },
]

interface Props {
  active: ClientTab
  onSelect: (id: ClientTab) => void
}

function NavButton({
  item,
  active,
  onSelect,
  label,
}: {
  item: { id: ClientTab; icon: LucideIcon; labelKey: MsgKey }
  active: boolean
  onSelect: (id: ClientTab) => void
  label: string
}) {
  const Icon = item.icon
  return (
    <button
      type="button"
      onClick={() => onSelect(item.id)}
      title={label}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      className={[
        'profile-nav-item relative z-[1] flex items-center gap-1.5 shrink-0 px-2.5 text-[12px] font-medium whitespace-nowrap transition-colors duration-100 focus:outline-none',
        active
          ? 'profile-folder-tab h-full text-foreground'
          : 'my-1 h-7 rounded-lg text-muted-foreground hover:bg-white/5 hover:text-foreground',
      ].join(' ')}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" strokeWidth={1.75} />
      <span>{label}</span>
    </button>
  )
}

export function ClientNavBar({ active, onSelect }: Props) {
  const { t } = useAdminLang()
  return (
    <nav
      aria-label={t('profile.navAria')}
      className="profile-nav flex h-9 shrink-0 items-end gap-0.5 overflow-x-auto px-4 scrollbar-none"
    >
      {PRIMARY.map((item) => (
        <NavButton key={item.id} item={item} active={active === item.id} onSelect={onSelect} label={t(item.labelKey)} />
      ))}
      <span aria-hidden className="mx-1.5 h-4 w-px shrink-0 self-center bg-border" />
      {SECONDARY.map((item) => (
        <NavButton key={item.id} item={item} active={active === item.id} onSelect={onSelect} label={t(item.labelKey)} />
      ))}
    </nav>
  )
}
