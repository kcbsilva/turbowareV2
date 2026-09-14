'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { FileText, Loader2, Plus, Pencil, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ContractBodyEditor, type ContractBodyEditorHandle } from '@/components/admin/ContractBodyEditor'
import { ContractVariableSidebar } from '@/components/admin/ContractVariableSidebar'
import { useAdminLang } from '@/components/admin/AdminLangProvider'

interface Template {
  id: string
  name: string
  title: string
  notes: string | null
  body: string | null
}

const inputClass =
  'w-full px-3 py-2 bg-muted border border-border rounded-md text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring'

const editorDialogClass =
  'h-[min(90vh,820px)] w-[min(calc(100%-2rem),72rem)] max-w-none overflow-hidden sm:max-w-[72rem]'

export default function ContractTemplatesPage() {
  const { t } = useAdminLang()
  const bodyEditorRef = useRef<ContractBodyEditorHandle>(null)
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', body: '' })
  const [formError, setFormError] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    const res = await fetch('/api/admin/contract-templates', { cache: 'no-store' })
    if (res.ok) {
      const data = await res.json()
      setTemplates(data.templates ?? [])
    } else {
      setError(t('templates.loadError'))
    }
    setLoading(false)
  }, [t])

  useEffect(() => {
    load()
  }, [load])

  function openNew() {
    setEditingId(null)
    setForm({ name: '', body: '' })
    setFormError('')
    setOpen(true)
  }

  function openEdit(row: Template) {
    setEditingId(row.id)
    setForm({ name: row.name, body: row.body ?? '' })
    setFormError('')
    setOpen(true)
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')
    if (!form.name.trim()) {
      setFormError(t('templates.required'))
      return
    }
    setSaving(true)
    const res = await fetch(
      editingId ? `/api/admin/contract-templates/${editingId}` : '/api/admin/contract-templates',
      {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          title: form.name.trim(),
          body: form.body,
        }),
      },
    )
    const data = await res.json().catch(() => ({}))
    setSaving(false)
    if (!res.ok) {
      setFormError(data.error || t('templates.saveError'))
      return
    }
    setOpen(false)
    await load()
  }

  async function remove(id: string) {
    if (!window.confirm(t('templates.deleteConfirm'))) return
    setBusyId(id)
    const res = await fetch(`/api/admin/contract-templates/${id}`, { method: 'DELETE' })
    setBusyId(null)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error || t('templates.saveError'))
      return
    }
    await load()
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
            <FileText className="h-4 w-4 text-foreground" />
          </div>
          <div>
            <h1 className="text-base font-bold text-foreground">{t('settings.templates')}</h1>
            <p className="text-[11px] text-muted-foreground">{t('templates.dialogDesc')}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={openNew}
          className="tw-btn-primary inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold"
        >
          <Plus className="h-3.5 w-3.5" />
          {t('templates.new')}
        </button>
      </div>

      {error && (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {error}
        </p>
      )}

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : templates.length === 0 ? (
          <p className="px-4 py-10 text-center text-xs text-muted-foreground">{t('templates.empty')}</p>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-2.5 font-medium">{t('templates.name')}</th>
                <th className="px-4 py-2.5 font-medium">{t('templates.body')}</th>
                <th className="px-4 py-2.5 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {templates.map((row) => (
                <tr key={row.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium text-foreground">{row.name}</td>
                  <td className="max-w-xs truncate px-4 py-3 text-muted-foreground">
                    {row.body ? t('templates.hasBody') : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(row)}
                        className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                        title={t('templates.edit')}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={busyId === row.id}
                        onClick={() => remove(row.id)}
                        className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-40"
                        title={t('templates.delete')}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className={editorDialogClass} showCloseButton>
          <DialogHeader>
            <DialogTitle>{editingId ? t('templates.edit') : t('templates.new')}</DialogTitle>
            <DialogDescription>{t('templates.dialogDesc')}</DialogDescription>
          </DialogHeader>
          <form onSubmit={save} className="flex min-h-0 flex-1 flex-col gap-3">
            <label className="block shrink-0 space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{t('templates.name')}</span>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className={inputClass}
                required
              />
            </label>
            <div className="flex min-h-0 flex-1 flex-col gap-3 sm:flex-row">
              <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-1 overflow-hidden">
                <span className="shrink-0 text-[10px] uppercase tracking-wider text-muted-foreground">{t('templates.body')}</span>
                <div className="min-h-0 flex-1">
                  <ContractBodyEditor
                    ref={bodyEditorRef}
                    value={form.body}
                    onChange={(body) => setForm((f) => ({ ...f, body }))}
                  />
                </div>
              </div>
              <div className="h-[min(50vh,420px)] w-full shrink-0 sm:h-auto sm:w-56">
                <ContractVariableSidebar onInsert={(key) => bodyEditorRef.current?.insertVariable(key)} />
              </div>
            </div>
            {formError && <p className="text-xs text-destructive">{formError}</p>}
            <DialogFooter>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
              >
                {t('licenses.cancel')}
              </button>
              <button
                type="submit"
                disabled={saving}
                className="tw-btn-primary rounded-md px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
              >
                {saving ? t('templates.saving') : t('templates.save')}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
