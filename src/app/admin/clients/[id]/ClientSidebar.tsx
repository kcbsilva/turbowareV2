'use client'

import { User, Key, ClipboardList, History, CreditCard } from 'lucide-react'

export type ClientTab = 'overview' | 'licenses' | 'billing' | 'notes' | 'history'

const ITEMS: { id: ClientTab; icon: React.ElementType; label: string }[] = [
  { id: 'overview',  icon: User,          label: 'Overview'  },
  { id: 'licenses',  icon: Key,           label: 'Licenses'  },
  { id: 'billing',   icon: CreditCard,    label: 'Billing'   },
  { id: 'notes',     icon: ClipboardList, label: 'Notes'     },
  { id: 'history',   icon: History,       label: 'History'   },
]

interface Props {
  active: ClientTab
  onSelect: (id: ClientTab) => void
}

export function ClientSidebar({ active, onSelect }: Props) {
  return (
    <div className="flex flex-col items-center h-full w-16 pt-14 pb-2 space-y-2 bg-background border-r-2 border-[#081124] shrink-0">
      {ITEMS.map(({ id, icon: Icon, label }) => (
        <div key={id} className="relative group">
          <button
            onClick={() => onSelect(id)}
            className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-150 hover:bg-white/10 focus:outline-none
              ${active === id ? 'bg-[#081124]/30 scale-105 shadow-md dark:bg-[#FCA311]/10' : ''}`}
            aria-label={label}
          >
            <Icon
              className={`w-5 h-5 transition-colors ${
                active === id
                  ? 'text-[#081124] dark:text-[#FCA311]'
                  : 'text-[#081124]/60 dark:text-[#FCA311]/60'
              }`}
            />
          </button>
          {/* CSS tooltip */}
          <div className="pointer-events-none absolute left-[52px] top-1/2 -translate-y-1/2 hidden group-hover:block z-50">
            <div className="bg-card border border-border text-xs font-medium text-foreground px-2 py-1 rounded-md shadow-lg whitespace-nowrap">
              {label}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
