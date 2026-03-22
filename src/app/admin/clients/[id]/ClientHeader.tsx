'use client'

interface Props {
  clientId: string
  name: string
  company: string | null
  createdAt: string
}

export function ClientHeader({ clientId, name, company, createdAt }: Props) {
  const formattedDate = new Date(createdAt).toLocaleDateString()
  const displayTrade = company?.trim() ? ` (${company.trim()})` : ''

  return (
    <div className="absolute top-0 left-0 right-0 z-30 flex items-center gap-3 px-6 py-2 bg-background border-b border-border/30">
      <div className="flex items-center gap-2 text-xs font-medium truncate">
        <span className="truncate uppercase text-[#081124] dark:text-[#FCA311]">
          {clientId.slice(-8).toUpperCase()} — {name}
          {displayTrade}
        </span>
        <span
          className="rounded-sm px-1.5 py-0 text-[10px] font-semibold uppercase leading-5 bg-primary text-primary-foreground"
        >
          Client
        </span>
        <span className="text-muted-foreground ml-1">— since {formattedDate}</span>
      </div>
    </div>
  )
}
