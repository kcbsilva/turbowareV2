'use client'

import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, Clock } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DEFAULT_GRACE_DAYS,
  MIN_GRACE_DAYS,
  resolveGracePeriodEnd,
  toDateInputValue,
} from '@/lib/grace-period'

type Mode = 'days' | 'until'

export type GraceDialogLabels = {
  title: string
  description: string
  extraDays: string
  calendarDate: string
  accessUntil: string
  range: string
  accessThrough: string
  day: string
  days: string
  cancel: string
  saving: string
  failed: string
  confirm: string
}

function fill(template: string, vars: Record<string, string | number>) {
  let out = template
  for (const [name, value] of Object.entries(vars)) out = out.replaceAll(`{${name}}`, String(value))
  return out
}

export function ExtendGraceDialog({
  open,
  onOpenChange,
  currentEndsAt,
  maxDays,
  feeHint,
  labels,
  dateLocale,
  formatError,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentEndsAt?: string | null
  maxDays: number
  feeHint?: string
  labels: GraceDialogLabels
  dateLocale?: string
  formatError?: (message: string) => string
  onConfirm: (payload: { days?: number; until?: string }) => Promise<void>
}) {
  const [mode, setMode] = useState<Mode>('days')
  const [days, setDays] = useState(String(DEFAULT_GRACE_DAYS))
  const [until, setUntil] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const minDate = toDateInputValue(new Date(Date.now() + 86_400_000))
  const maxDate = toDateInputValue(new Date(Date.now() + maxDays * 86_400_000))

  useEffect(() => {
    if (!open) return
    setMode('days')
    setDays(String(DEFAULT_GRACE_DAYS))
    setUntil(toDateInputValue(new Date(Date.now() + 86_400_000)))
    setError('')
    setSaving(false)
  }, [open])

  const preview = useMemo(() => {
    const current = currentEndsAt ? new Date(currentEndsAt) : null
    const input = mode === 'until' ? { until } : { days }
    return resolveGracePeriodEnd({
      input,
      currentEndsAt: current,
      maxDays,
    })
  }, [mode, days, until, currentEndsAt, maxDays])

  function showError(message: string) {
    return formatError ? formatError(message) : message
  }

  async function submit() {
    setError('')
    if (!preview.ok) {
      setError(showError(preview.error))
      return
    }
    setSaving(true)
    try {
      await onConfirm(mode === 'until' ? { until } : { days: Number(days) })
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : labels.failed)
    } finally {
      setSaving(false)
    }
  }

  const tab = (id: Mode, label: string) => (
    <button
      type="button"
      onClick={() => setMode(id)}
      className={`flex-1 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
        mode === id
          ? 'bg-background text-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      {label}
    </button>
  )

  const unit = preview.ok ? (preview.days === 1 ? labels.day : labels.days) : labels.days

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle>{labels.title}</DialogTitle>
          <DialogDescription>{labels.description}</DialogDescription>
        </DialogHeader>

        <div className="flex rounded-lg bg-muted p-1">
          {tab('days', labels.extraDays)}
          {tab('until', labels.calendarDate)}
        </div>

        {mode === 'days' ? (
          <label className="block space-y-1.5">
            <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              <Clock className="h-3 w-3" /> {labels.extraDays}
            </span>
            <input
              type="number"
              min={MIN_GRACE_DAYS}
              max={maxDays}
              value={days}
              onChange={(e) => setDays(e.target.value)}
              className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary"
            />
            <p className="text-[11px] text-muted-foreground">{fill(labels.range, { min: MIN_GRACE_DAYS, max: maxDays })}</p>
          </label>
        ) : (
          <label className="block space-y-1.5">
            <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              <CalendarDays className="h-3 w-3" /> {labels.accessUntil}
            </span>
            <input
              type="date"
              min={minDate}
              max={maxDate}
              value={until}
              onChange={(e) => setUntil(e.target.value)}
              className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary"
            />
          </label>
        )}

        {preview.ok ? (
          <p className="rounded-md border border-border bg-muted/40 px-3 py-2 text-xs text-foreground">
            {labels.accessThrough}{' '}
            <strong>
              {preview.endsAt.toLocaleString(dateLocale, {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </strong>
            {` (${preview.days} ${unit}).`}
          </p>
        ) : (
          <p className="text-xs text-destructive">{showError(preview.error)}</p>
        )}

        {feeHint && <p className="text-[11px] text-muted-foreground">{feeHint}</p>}
        {error && <p className="text-xs text-destructive">{error}</p>}

        <DialogFooter>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-9 rounded-md border border-border px-3 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            {labels.cancel}
          </button>
          <button
            type="button"
            onClick={() => void submit()}
            disabled={saving || !preview.ok}
            className="h-9 rounded-md px-3 text-xs font-semibold disabled:opacity-50"
            style={{ backgroundColor: '#fff', color: '#000' }}
          >
            {saving ? labels.saving : labels.confirm}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
