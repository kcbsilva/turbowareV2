'use client'

import { Building2 } from 'lucide-react'

interface Props {
  clientId: string
  name: string
  company: string | null
  createdAt: string
}

export function ClientHeader({ clientId, name, company, createdAt }: Props) {
  const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
  const displayTrade = company?.trim() ? ` (${company.trim()})` : ''

  return (
    <div className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border bg-black px-5">
      <div className="flex min-w-0 items-center gap-3">
        <div className="grid size-8 shrink-0 place-content-center rounded-md bg-white/15">
          <Building2 className="h-4 w-4 text-white" />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate text-sm font-semibold uppercase tracking-wide text-white">
              {clientId.slice(-8).toUpperCase()} — {name}
              {displayTrade}
            </span>
            <span className="shrink-0 rounded border border-white/30 bg-white/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase leading-none text-white">
              Client
            </span>
          </div>
          <p className="mt-0.5 text-[11px] text-white/70">Since {formattedDate}</p>
        </div>
      </div>
    </div>
  )
}
