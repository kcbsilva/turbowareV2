'use client'

import { useCallback, useEffect, useState } from 'react'
import { FileText, Loader2, Plus, Trash2, Eye } from 'lucide-react'
import { useAdminLang } from '@/components/admin/AdminLangProvider'
import { dateLocale } from '@/lib/admin-i18n'
import {
  DOCUMENT_KINDS,
  DOCUMENT_KIND_KEY,
  MAX_DOCUMENT_BYTES,
  formatFileSize,
  type DocumentKind,
} from '@/lib/client-documents'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface ClientDoc {
  id: string
  kind: DocumentKind
  title: string
  fileName: string
  mimeType: string
  sizeBytes: number
  notes: string | null
  uploadedBy: string
  createdAt: string
}

interface Props {
  clientId: string
}

export function DocumentsTab({ clientId }: Props) {
  const { t, lang } = useAdminLang()
  const [docs, setDocs] = useState<ClientDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [removing, setRemoving] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')
  const [kind, setKind] = useState<DocumentKind>('ID_FRONT')
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [file, setFile] = useState<File | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/admin/clients/${clientId}/documents`, { cache: 'no-store' })
    if (res.ok) setDocs(await res.json())
    else setError(t('docs.loadError'))
    setLoading(false)
  }, [clientId, t])

  useEffect(() => { load() }, [load])

  function openUpload() {
    setError('')
    setKind('ID_FRONT')
    setTitle('')
    setNotes('')
    setFile(null)
    setOpen(true)
  }

  async function upload(e: React.FormEvent) {
    e.preventDefault()
    if (!file) {
      setError(t('docs.fileRequired'))
      return
    }
    if (file.size > MAX_DOCUMENT_BYTES) {
      setError(t('docs.tooLarge'))
      return
    }
    setUploading(true)
    setError('')
    const body = new FormData()
    body.append('file', file)
    body.append('kind', kind)
    if (title.trim()) body.append('title', title.trim())
    if (notes.trim()) body.append('notes', notes.trim())
    const res = await fetch(`/api/admin/clients/${clientId}/documents`, { method: 'POST', body })
    const data = await res.json().catch(() => ({}))
    setUploading(false)
    if (!res.ok) {
      setError(data.error || t('docs.uploadError'))
      return
    }
    setDocs((prev) => [data, ...prev])
    setOpen(false)
  }

  async function remove(doc: ClientDoc) {
    if (!window.confirm(t('docs.removeConfirm', { n: doc.title || doc.fileName }))) return
    setRemoving(doc.id)
    const res = await fetch(`/api/admin/clients/${clientId}/documents/${doc.id}`, { method: 'DELETE' })
    setRemoving(null)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error || t('docs.removeError'))
      return
    }
    setDocs((prev) => prev.filter((d) => d.id !== doc.id))
  }

  const card = 'bg-card border border-border rounded-lg'

  return (
    <div className="space-y-4">
      <div className={card}>
        <div className="px-4 py-2.5 border-b border-border flex items-center justify-between gap-2">
          <h2 className="text-[10px] font-semibold text-foreground uppercase tracking-wider">{t('docs.list')}</h2>
          <button
            type="button"
            onClick={openUpload}
            className="tw-btn-primary flex items-center gap-1 px-2 py-1 text-[10px] font-semibold rounded-md"
          >
            <Plus className="w-3 h-3" /> {t('docs.upload')}
          </button>
        </div>
        {error && !open && <p className="px-4 pt-3 text-xs text-destructive">{error}</p>}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : docs.length === 0 ? (
          <div className="px-6 py-10 flex flex-col items-center gap-2 text-muted-foreground">
            <FileText className="w-8 h-8 opacity-20" />
            <p className="text-xs">{t('docs.empty')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-left text-[10px] text-muted-foreground uppercase tracking-wider">
                  <th className="px-4 py-2.5 font-medium">{t('docs.file')}</th>
                  <th className="px-4 py-2.5 font-medium">{t('docs.type')}</th>
                  <th className="px-4 py-2.5 font-medium">{t('docs.size')}</th>
                  <th className="px-4 py-2.5 font-medium">{t('docs.uploaded')}</th>
                  <th className="px-4 py-2.5 font-medium" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {docs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{doc.title}</p>
                      <p className="text-[10px] text-muted-foreground truncate max-w-[240px]">{doc.fileName}</p>
                      {doc.notes && <p className="text-[10px] text-muted-foreground mt-0.5">{doc.notes}</p>}
                    </td>
                    <td className="px-4 py-3 text-foreground">{t(DOCUMENT_KIND_KEY[doc.kind])}</td>
                    <td className="px-4 py-3 font-mono text-foreground">{formatFileSize(doc.sizeBytes)}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <p>{new Date(doc.createdAt).toLocaleString(dateLocale(lang))}</p>
                      <p className="text-[10px]">{doc.uploadedBy}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={`/api/admin/clients/${clientId}/documents/${doc.id}/file`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-semibold rounded-md border border-border text-foreground hover:bg-muted"
                        >
                          <Eye className="w-3 h-3" /> {t('docs.view')}
                        </a>
                        <button
                          type="button"
                          onClick={() => remove(doc)}
                          disabled={removing === doc.id}
                          className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-semibold rounded-md border border-border text-destructive hover:bg-muted disabled:opacity-50"
                        >
                          {removing === doc.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                          {t('docs.remove')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md" showCloseButton>
          <DialogHeader>
            <DialogTitle>{t('docs.uploadTitle')}</DialogTitle>
            <DialogDescription>{t('docs.uploadDesc')}</DialogDescription>
          </DialogHeader>
          <form onSubmit={upload} className="space-y-3">
            <label className="block space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{t('docs.type')}</span>
              <select
                value={kind}
                onChange={(e) => setKind(e.target.value as DocumentKind)}
                className="w-full px-3 py-2 bg-muted border border-border rounded-md text-xs text-foreground"
              >
                {DOCUMENT_KINDS.map((k) => (
                  <option key={k} value={k}>{t(DOCUMENT_KIND_KEY[k])}</option>
                ))}
              </select>
            </label>
            <label className="block space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{t('docs.title')}</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('docs.titlePlaceholder')}
                className="w-full px-3 py-2 bg-muted border border-border rounded-md text-xs text-foreground"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{t('docs.file')}</span>
              <input
                type="file"
                accept="application/pdf,image/jpeg,image/png,image/webp,image/heic,image/heif"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="w-full text-xs text-foreground file:mr-2 file:px-3 file:py-1.5 file:rounded-md file:border-0 file:bg-muted file:text-xs file:font-semibold file:text-foreground"
              />
              <span className="text-[10px] text-muted-foreground">{t('docs.fileHint')}</span>
            </label>
            <label className="block space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{t('docs.notes')}</span>
              <input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t('docs.notesPlaceholder')}
                className="w-full px-3 py-2 bg-muted border border-border rounded-md text-xs text-foreground"
              />
            </label>
            {error && <p className="text-xs text-destructive">{error}</p>}
            <DialogFooter>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-3 py-1.5 text-xs font-semibold rounded-md border border-border text-foreground hover:bg-muted"
              >
                {t('licenses.cancel')}
              </button>
              <button
                type="submit"
                disabled={uploading || !file}
                className="tw-btn-primary px-3 py-1.5 text-xs font-semibold rounded-md disabled:opacity-50"
              >
                {uploading ? t('docs.uploading') : t('docs.upload')}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
