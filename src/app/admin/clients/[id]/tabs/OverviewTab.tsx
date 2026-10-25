'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X, Edit, Trash2, Check, KeyRound, Mail, Loader2 } from 'lucide-react'
import { useAdminLang } from '@/components/admin/AdminLangProvider'
import { dateLocale, type MsgKey } from '@/lib/admin-i18n'
import {
  CLIENT_CONTRACT_FIELDS,
  parseTerms,
} from '@/lib/contract-variables'

interface Client {
  id: string
  name: string
  email: string | null
  emailVerified: boolean
  phone: string | null
  company: string | null
  cnpj: string | null
  internalNotes: string | null
  contractTerms?: Record<string, string> | null
  hasPassword?: boolean
  mustChangePassword?: boolean
  createdAt: string
  updatedAt: string
}

interface Props {
  client: Client
  onUpdated?: (client: Client) => void
}

export function OverviewTab({ client, onUpdated }: Props) {
  const router = useRouter()
  const { t, lang } = useAdminLang()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [error, setError] = useState('')
  const [deleteError, setDeleteError] = useState('')

  const [form, setForm] = useState({
    name: client.name,
    email: client.email || '',
    phone: client.phone || '',
    company: client.company || '',
    cnpj: client.cnpj || '',
    internalNotes: client.internalNotes || '',
  })

  const [passwordResetting, setPasswordResetting] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState<{ text: string; ok: boolean } | null>(null)
  const [resendingVerification, setResendingVerification] = useState(false)
  const [verificationMsg, setVerificationMsg] = useState<{ text: string; ok: boolean } | null>(null)
  const [canDelete, setCanDelete] = useState(false)

  useEffect(() => {
    setForm({
      name: client.name,
      email: client.email || '',
      phone: client.phone || '',
      company: client.company || '',
      cnpj: client.cnpj || '',
      internalNotes: client.internalNotes || '',
    })
  }, [client])

  useEffect(() => {
    fetch('/api/admin/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setCanDelete(Boolean(d?.canManage)))
      .catch(() => undefined)
  }, [])

  function handle(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  // Format CNPJ display as XX.XXX.XXX/XXXX-XX
  function displayCnpj(raw: string | null) {
    if (!raw) return null
    const d = raw.replace(/\D/g, '')
    return d
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
  }

  function formatCnpjInput(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 14)
    return digits
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
  }

  async function save() {
    if (!form.name.trim()) { setError(t('overview.nameRequired')); return }
    setSaving(true); setError('')
    const res = await fetch(`/api/admin/clients/${client.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    if (res.ok) {
      const updated = await res.json().catch(() => null)
      if (updated) onUpdated?.(updated)
      setEditing(false)
    } else {
      const d = await res.json().catch(() => ({}))
      setError(d.error || t('overview.saveFailed'))
    }
  }

  async function resetPassword() {
    setPasswordResetting(true)
    setPasswordMsg(null)
    const res = await fetch(`/api/admin/clients/${client.id}/reset-password`, {
      method: 'POST',
    })
    setPasswordResetting(false)
    if (res.ok) {
      setPasswordMsg({ text: t('overview.tempSent'), ok: true })
      router.refresh()
    } else {
      const data = await res.json().catch(() => ({}))
      setPasswordMsg({ text: data.error || t('overview.tempFailed'), ok: false })
    }
  }

  async function deleteClient() {
    setDeleting(true)
    setDeleteError('')
    try {
      const res = await fetch(`/api/admin/clients/${client.id}`, { method: 'DELETE' })
      if (res.ok) {
        router.replace('/admin/clients')
        router.refresh()
        return
      }
      const data = (await res.json().catch(() => ({}))) as { error?: string; detail?: string }
      const msg = [data.error, data.detail].filter(Boolean).join(' — ') || t('overview.deleteFailed')
      setDeleteError(msg)
      setConfirmDelete(true)
    } catch {
      setDeleteError(t('overview.deleteRequestFailed'))
      setConfirmDelete(true)
    } finally {
      setDeleting(false)
    }
  }

  async function resendVerificationEmail() {
    setResendingVerification(true)
    setVerificationMsg(null)

    const res = await fetch(`/api/admin/clients/${client.id}/resend-verification`, {
      method: 'POST',
    })

    setResendingVerification(false)

    if (res.ok) {
      setVerificationMsg({ text: t('overview.verifySent'), ok: true })
    } else {
      const data = await res.json().catch(() => ({}))
      setVerificationMsg({ text: data.error || t('overview.verifyFailed'), ok: false })
    }
  }

  const inputClass = 'w-full px-3 py-1.5 bg-muted border border-border rounded-md text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring'

  const fields = [
    { key: 'name',    label: t('common.fullName'), type: 'text',  required: true  },
    { key: 'email',   label: t('login.email'),     type: 'email', required: false },
    { key: 'phone',   label: t('common.phone'),     type: 'text',  required: false },
    { key: 'company', label: t('vars.client.company'), type: 'text', required: false },
    { key: 'cnpj',    label: t('vars.client.cnpj'), type: 'text',  required: false },
  ] as const

  return (
    <div className="space-y-4">
      {/* Identity card */}
      <div className="bg-card border border-border rounded-lg">
        <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
          <h2 className="text-[10px] font-semibold text-foreground uppercase tracking-wider">{t('overview.identity')}</h2>
          <div className="flex items-center gap-2">
            {editing ? (
              <>
                <button onClick={save} disabled={saving} className="flex items-center gap-1 text-[10px] text-foreground hover:opacity-80 transition">
                  <Check size={11} /> {saving ? t('templates.saving') : t('templates.save')}
                </button>
                <button onClick={() => { setEditing(false); setError('') }} className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground">
                  <X size={11} /> {t('licenses.cancel')}
                </button>
              </>
            ) : (
              <button onClick={() => setEditing(true)} className="flex items-center gap-1 text-[10px] text-primary hover:opacity-80">
                <Edit size={11} /> {t('common.edit')}
              </button>
            )}
          </div>
        </div>

        <div className="px-4 py-3">
          {editing ? (
            <div className="grid grid-cols-2 gap-3">
              {fields.map(({ key, label, type, required }) => (
                <div key={key}>
                  <label className="block text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                    {label}{required && <span className="text-destructive ml-0.5">*</span>}
                  </label>
                  <input
                    name={key}
                    type={type}
                    value={key === 'cnpj' ? form.cnpj : form[key]}
                    onChange={(e) => {
                      if (key === 'cnpj') {
                        setForm((f) => ({ ...f, cnpj: formatCnpjInput(e.target.value) }))
                      } else {
                        handle(e)
                      }
                    }}
                    className={inputClass}
                    placeholder={key === 'cnpj' ? '00.000.000/0000-00' : undefined}
                  />
                </div>
              ))}
              {error && <p className="col-span-2 text-xs text-destructive">{error}</p>}
            </div>
          ) : (
            <dl className="grid grid-cols-2 gap-3">
              {[
                { key: 'name', label: t('common.fullName'), value: client.name },
                { key: 'company', label: t('vars.client.company'), value: client.company },
                { key: 'email', label: t('login.email'), value: client.email },
                { key: 'phone', label: t('common.phone'), value: client.phone },
                { key: 'cnpj', label: t('vars.client.cnpj'), value: displayCnpj(client.cnpj) },
              ].map((row) => (
                <div key={row.key}>
                  <dt className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">{row.label}</dt>
                  <dd className="text-xs text-foreground font-medium font-mono">{row.value || <span className="text-muted-foreground/40 font-normal font-sans">—</span>}</dd>
                </div>
              ))}
              <div>
                <dt className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">{t('overview.clientSince')}</dt>
                <dd className="text-xs text-foreground">{new Date(client.createdAt).toLocaleDateString(dateLocale(lang))}</dd>
              </div>
            </dl>
          )}
        </div>
      </div>

      {/* Portal Access */}
      <div className="bg-card border border-border rounded-lg">
        <div className="px-4 py-2.5 border-b border-border flex items-center gap-2">
          <KeyRound size={11} className="text-muted-foreground" />
          <h2 className="text-[10px] font-semibold text-foreground uppercase tracking-wider">{t('overview.portal')}</h2>
          {client.hasPassword ? (
            <span className="ml-auto text-[10px] text-foreground font-medium">{t('overview.passwordSet')}</span>
          ) : (
            <span className="ml-auto text-[10px] text-muted-foreground/50">{t('overview.noPassword')}</span>
          )}
        </div>
        <div className="px-4 py-3 flex items-end gap-3">
          <div className="flex-1">
            <div className="mb-3 flex items-center justify-between gap-3 rounded-md border border-border bg-muted/40 px-3 py-2">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
                  {t('overview.emailVerification')}
                </p>
                <p className={`text-xs font-medium ${client.emailVerified ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {client.emailVerified ? t('overview.verified') : t('overview.pendingVerification')}
                </p>
              </div>
              <button
                type="button"
                onClick={resendVerificationEmail}
                disabled={resendingVerification || client.emailVerified || !client.email}
                className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-[10px] font-medium text-foreground transition hover:bg-background disabled:opacity-40"
              >
                {resendingVerification ? <Loader2 size={11} className="animate-spin" /> : <Mail size={11} />}
                {resendingVerification ? t('common.sending') : t('overview.resend')}
              </button>
            </div>

            <div className="rounded-md border border-border bg-muted/40 px-3 py-2">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
                {t('overview.passwordReset')}
              </p>
              <p className="text-xs text-foreground">
                {t('overview.passwordHint')}
              </p>
            </div>
            {passwordMsg && (
              <p className={`text-[10px] mt-1 ${passwordMsg.ok ? 'text-foreground' : 'text-destructive'}`}>
                {passwordMsg.text}
              </p>
            )}
            {verificationMsg && (
              <p className={`text-[10px] mt-1 ${verificationMsg.ok ? 'text-foreground' : 'text-destructive'}`}>
                {verificationMsg.text}
              </p>
            )}
          </div>
          <button
            onClick={resetPassword}
            disabled={passwordResetting || !client.email}
            className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-md hover:opacity-90 disabled:opacity-40 transition flex items-center gap-1.5"
          >
            {passwordResetting ? <Loader2 size={11} className="animate-spin" /> : <KeyRound size={11} />}
            {passwordResetting ? t('common.sending') : t('overview.resetPassword')}
          </button>
        </div>
      </div>

      <ContractTermsCard client={client} onUpdated={onUpdated} />

      {/* Internal notes */}
      <div className="bg-card border border-border rounded-lg">
        <div className="px-4 py-2.5 border-b border-border">
          <h2 className="text-[10px] font-semibold text-foreground uppercase tracking-wider">{t('overview.internalNotes')}</h2>
        </div>
        <div className="px-4 py-3">
          {editing ? (
            <textarea
              name="internalNotes"
              value={form.internalNotes}
              onChange={handle}
              rows={3}
              placeholder={t('overview.notesPlaceholder')}
              className={`${inputClass} resize-none`}
            />
          ) : (
            <p className="text-xs text-foreground whitespace-pre-wrap">
              {client.internalNotes || <span className="text-muted-foreground/40">{t('overview.noNotes')}</span>}
            </p>
          )}
        </div>
      </div>

      {/* Danger zone — owner/admin only */}
      {canDelete && (
      <div className="bg-card border border-destructive/20 rounded-lg">
        <div className="px-4 py-2.5 border-b border-destructive/20">
          <h2 className="text-[10px] font-semibold text-destructive uppercase tracking-wider">{t('overview.danger')}</h2>
        </div>
        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-foreground font-medium">{t('overview.deleteClient')}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {t('overview.deleteHint')}
            </p>
          </div>
          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground">{t('common.areYouSure')}</span>
              <button
                onClick={deleteClient}
                disabled={deleting}
                className="px-3 py-1.5 bg-destructive text-destructive-foreground text-xs font-medium rounded-md hover:opacity-90 disabled:opacity-50 transition"
              >
                {deleting ? t('common.deleting') : t('common.yesDelete')}
              </button>
              <button onClick={() => setConfirmDelete(false)} className="text-xs text-muted-foreground hover:text-foreground transition">
                {t('licenses.cancel')}
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setConfirmDelete(true); setDeleteError('') }}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-destructive/50 text-destructive hover:bg-destructive/10 text-xs font-medium rounded-md transition"
            >
              <Trash2 size={12} /> {t('overview.deleteButton')}
            </button>
          )}
        </div>
        {deleteError && (
          <p className="px-4 pb-3 text-xs text-destructive">{deleteError}</p>
        )}
      </div>
      )}
    </div>
  )
}

const TERM_GROUPS = ['party', 'fees', 'sla', 'law'] as const

function ContractTermsCard({
  client,
  onUpdated,
}: {
  client: Client
  onUpdated?: (client: Client) => void
}) {
  const { t } = useAdminLang()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState(() => parseTerms(client.contractTerms))

  useEffect(() => {
    if (editing) return
    setForm(parseTerms(client.contractTerms))
  }, [client.contractTerms, editing])

  const inputClass = 'w-full px-3 py-1.5 bg-muted border border-border rounded-md text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring'

  async function save() {
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/clients/${client.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractTerms: form }),
      })
      if (res.ok) {
        const updated = await res.json().catch(() => null)
        if (updated) onUpdated?.(updated)
        setEditing(false)
      } else {
        const data = await res.json().catch(() => ({}))
        setError(data.error || t('profile.contractTermsSaveError'))
      }
    } catch {
      setError(t('profile.contractTermsSaveError'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-card border border-border rounded-lg">
      <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="text-[10px] font-semibold text-foreground uppercase tracking-wider">
            {t('profile.contractTerms')}
          </h2>
          <p className="mt-0.5 text-[11px] text-muted-foreground">{t('profile.contractTermsHint')}</p>
        </div>
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <button onClick={save} disabled={saving} className="flex items-center gap-1 text-[10px] text-foreground hover:opacity-80 transition">
                <Check size={11} /> {saving ? t('templates.saving') : t('templates.save')}
              </button>
              <button
                onClick={() => {
                  setEditing(false)
                  setError('')
                  setForm(parseTerms(client.contractTerms))
                }}
                className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground"
              >
                <X size={11} /> {t('licenses.cancel')}
              </button>
            </>
          ) : (
            <button onClick={() => setEditing(true)} className="flex items-center gap-1 text-[10px] text-primary hover:opacity-80">
              <Edit size={11} /> {t('common.edit')}
            </button>
          )}
        </div>
      </div>
      <div className="space-y-4 px-4 py-3">
        {TERM_GROUPS.map((group) => {
          const fields = CLIENT_CONTRACT_FIELDS.filter((field) => field.group === group)
          return (
            <div key={group}>
              <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {t(`terms.group.${group}` as MsgKey)}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {fields.map((field) => {
                  const value = form[field.key] ?? ''
                  const display = value
                    || (field.key === 'customer_legal_name' ? (client.company || client.name) : '')
                  const colSpan = 'multiline' in field && field.multiline ? 'col-span-2' : ''
                  return (
                    <div key={field.key} className={colSpan}>
                      <label className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground">
                        {t(field.labelKey as MsgKey)}
                        <span className="ml-1 font-mono normal-case tracking-normal text-muted-foreground/70">
                          {`{${field.key}}`}
                        </span>
                      </label>
                      {editing ? (
                        'multiline' in field && field.multiline ? (
                          <textarea
                            rows={3}
                            value={value}
                            onChange={(e) => setForm((current) => ({ ...current, [field.key]: e.target.value }))}
                            className={`${inputClass} resize-y`}
                          />
                        ) : (
                          <input
                            value={value}
                            onChange={(e) => setForm((current) => ({ ...current, [field.key]: e.target.value }))}
                            placeholder={field.key === 'customer_legal_name' ? (client.company || client.name || '') : undefined}
                            className={inputClass}
                          />
                        )
                      ) : (
                        <p className="text-xs font-medium text-foreground whitespace-pre-wrap">
                          {display || <span className="font-normal text-muted-foreground/40">—</span>}
                          {!value && field.key === 'customer_legal_name' && display ? (
                            <span className="ml-1 font-normal text-muted-foreground/50">{t('profile.contractTermsDefault')}</span>
                          ) : null}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    </div>
  )
}
