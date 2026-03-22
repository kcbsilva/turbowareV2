'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, Edit, Trash2, Check, KeyRound, Eye, EyeOff } from 'lucide-react'

interface Client {
  id: string
  name: string
  email: string | null
  phone: string | null
  company: string | null
  cnpj: string | null
  internalNotes: string | null
  hasPassword?: boolean
  createdAt: string
  updatedAt: string
}

interface Props {
  client: Client
}

export function OverviewTab({ client }: Props) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: client.name,
    email: client.email || '',
    phone: client.phone || '',
    company: client.company || '',
    cnpj: client.cnpj || '',
    internalNotes: client.internalNotes || '',
  })

  // Password reset state
  const [newPassword, setNewPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState('')

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
    if (!form.name.trim()) { setError('Name is required'); return }
    setSaving(true); setError('')
    const res = await fetch(`/api/admin/clients/${client.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    if (res.ok) { setEditing(false); router.refresh() }
    else { const d = await res.json(); setError(d.error || 'Save failed.') }
  }

  async function savePassword() {
    if (!newPassword.trim()) return
    setPasswordSaving(true)
    setPasswordMsg('')
    const res = await fetch(`/api/admin/clients/${client.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newPassword }),
    })
    setPasswordSaving(false)
    if (res.ok) {
      setNewPassword('')
      setPasswordMsg('Password updated.')
      router.refresh()
    } else {
      setPasswordMsg('Failed to update password.')
    }
  }

  async function deleteClient() {
    setDeleting(true)
    const res = await fetch(`/api/admin/clients/${client.id}`, { method: 'DELETE' })
    if (res.ok) router.push('/admin/clients')
    else { setDeleting(false); setError('Delete failed.') }
  }

  const inputClass = 'w-full px-3 py-1.5 bg-muted border border-border rounded-md text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring'

  const fields = [
    { key: 'name',    label: 'Full Name', type: 'text',  required: true  },
    { key: 'email',   label: 'Email',     type: 'email', required: false },
    { key: 'phone',   label: 'Phone',     type: 'text',  required: false },
    { key: 'company', label: 'Company',   type: 'text',  required: false },
    { key: 'cnpj',    label: 'CNPJ',      type: 'text',  required: false },
  ] as const

  return (
    <div className="space-y-4">
      {/* Identity card */}
      <div className="bg-card border border-border rounded-lg">
        <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
          <h2 className="text-[10px] font-semibold text-foreground uppercase tracking-wider">Identity</h2>
          <div className="flex items-center gap-2">
            {editing ? (
              <>
                <button onClick={save} disabled={saving} className="flex items-center gap-1 text-[10px] text-emerald-400 hover:opacity-80 transition">
                  <Check size={11} /> {saving ? 'Saving…' : 'Save'}
                </button>
                <button onClick={() => { setEditing(false); setError('') }} className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground">
                  <X size={11} /> Cancel
                </button>
              </>
            ) : (
              <button onClick={() => setEditing(true)} className="flex items-center gap-1 text-[10px] text-primary hover:opacity-80">
                <Edit size={11} /> Edit
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
                ['Full Name', client.name],
                ['Company',   client.company],
                ['Email',     client.email],
                ['Phone',     client.phone],
                ['CNPJ',      displayCnpj(client.cnpj)],
              ].map(([label, value]) => (
                <div key={label as string}>
                  <dt className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">{label}</dt>
                  <dd className="text-xs text-foreground font-medium font-mono">{value || <span className="text-muted-foreground/40 font-normal font-sans">—</span>}</dd>
                </div>
              ))}
              <div>
                <dt className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Client Since</dt>
                <dd className="text-xs text-foreground">{new Date(client.createdAt).toLocaleDateString()}</dd>
              </div>
            </dl>
          )}
        </div>
      </div>

      {/* Portal Access */}
      <div className="bg-card border border-border rounded-lg">
        <div className="px-4 py-2.5 border-b border-border flex items-center gap-2">
          <KeyRound size={11} className="text-muted-foreground" />
          <h2 className="text-[10px] font-semibold text-foreground uppercase tracking-wider">Portal Access</h2>
          {client.hasPassword ? (
            <span className="ml-auto text-[10px] text-emerald-400 font-medium">Password set</span>
          ) : (
            <span className="ml-auto text-[10px] text-muted-foreground/50">No password</span>
          )}
        </div>
        <div className="px-4 py-3 flex items-end gap-3">
          <div className="flex-1">
            <label className="block text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
              {client.hasPassword ? 'Reset Password' : 'Set Password'}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password…"
                className={`${inputClass} pr-7`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={11} /> : <Eye size={11} />}
              </button>
            </div>
            {passwordMsg && (
              <p className={`text-[10px] mt-1 ${passwordMsg.includes('Failed') ? 'text-destructive' : 'text-emerald-400'}`}>
                {passwordMsg}
              </p>
            )}
          </div>
          <button
            onClick={savePassword}
            disabled={passwordSaving || !newPassword.trim()}
            className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-md hover:opacity-90 disabled:opacity-40 transition flex items-center gap-1.5"
          >
            <Check size={11} /> {passwordSaving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {/* Internal notes */}
      <div className="bg-card border border-border rounded-lg">
        <div className="px-4 py-2.5 border-b border-border">
          <h2 className="text-[10px] font-semibold text-foreground uppercase tracking-wider">Internal Notes</h2>
        </div>
        <div className="px-4 py-3">
          {editing ? (
            <textarea
              name="internalNotes"
              value={form.internalNotes}
              onChange={handle}
              rows={3}
              placeholder="Private notes about this client…"
              className={`${inputClass} resize-none`}
            />
          ) : (
            <p className="text-xs text-foreground whitespace-pre-wrap">
              {client.internalNotes || <span className="text-muted-foreground/40">No internal notes.</span>}
            </p>
          )}
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-card border border-destructive/20 rounded-lg">
        <div className="px-4 py-2.5 border-b border-destructive/20">
          <h2 className="text-[10px] font-semibold text-destructive uppercase tracking-wider">Danger Zone</h2>
        </div>
        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-foreground font-medium">Delete this client</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Their licenses will be unassigned but not deleted.</p>
          </div>
          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground">Are you sure?</span>
              <button
                onClick={deleteClient}
                disabled={deleting}
                className="px-3 py-1.5 bg-destructive text-destructive-foreground text-xs font-medium rounded-md hover:opacity-90 disabled:opacity-50 transition"
              >
                {deleting ? 'Deleting…' : 'Yes, delete'}
              </button>
              <button onClick={() => setConfirmDelete(false)} className="text-xs text-muted-foreground hover:text-foreground transition">
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-destructive/50 text-destructive hover:bg-destructive/10 text-xs font-medium rounded-md transition"
            >
              <Trash2 size={12} /> Delete Client
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
