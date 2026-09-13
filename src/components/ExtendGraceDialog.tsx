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

export function ExtendGraceDialog({
  open,
  onOpenChange,
  currentEndsAt,
  maxDays,
  feeHint,
  confirmLabel = 'Extend grace',
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentEndsAt?: string | null
  maxDays: number
  feeHint?: string
  confirmLabel?: string
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

  async function submit() {
    setError('')
    if (!preview.ok) {
      setError(preview.error)
      return
    }
    setSaving(true)
    try {
      await onConfirm(mode === 'until' ? { until } : { days: Number(days) })
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to extend grace.')
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle>Extend grace</DialogTitle>
          <DialogDescription>
            Give this account more TurboISP access time — extra days from now, or a date on the calendar.
          </DialogDescription>
        </DialogHeader>

        <div className="flex rounded-lg bg-muted p-1">{tab('days', 'Extra days')}{tab('until', 'Calendar date')}</div>

        {mode === 'days' ? (
          <label className="block space-y-1.5">
            <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              <Clock className="h-3 w-3" /> Extra days
            </span>
            <input
              type="number"
              min={MIN_GRACE_DAYS}
              max={maxDays}
              value={days}
              onChange={(e) => setDays(e.target.value)}
              className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary"
            />
            <p className="text-[11px] text-muted-foreground">Between {MIN_GRACE_DAYS} and {maxDays} days.</p>
          </label>
        ) : (
          <label className="block space-y-1.5">
            <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              <CalendarDays className="h-3 w-3" /> Access until
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
            Access through{' '}
            <strong>
              {preview.endsAt.toLocaleString(undefined, {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </strong>
            {' '}({preview.days} day{preview.days === 1 ? '' : 's'}).
          </p>
        ) : (
          <p className="text-xs text-destructive">{preview.error}</p>
        )}

        {feeHint && <p className="text-[11px] text-muted-foreground">{feeHint}</p>}
        {error && <p className="text-xs text-destructive">{error}</p>}

        <DialogFooter>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-9 rounded-md border border-border px-3 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void submit()}
            disabled={saving || !preview.ok}
            className="h-9 rounded-md px-3 text-xs font-semibold disabled:opacity-50"
            style={{ backgroundColor: '#fff', color: '#000' }}
          >
            {saving ? 'Saving…' : confirmLabel}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
