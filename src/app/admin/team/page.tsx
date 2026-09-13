'use client'

import { useCallback, useEffect, useState } from 'react'
import { Loader2, UserPlus, Users, Shield } from 'lucide-react'
import { badge } from '@/lib/badges'

type Role = 'owner' | 'admin' | 'support' | 'helper'

interface TeamUser {
  id: string
  name: string
  email: string
  role: string
  active: boolean
  mfaEnabled: boolean
  mustChangePassword: boolean
  createdAt: string
}

interface CurrentUser {
  id: string | null
  role: string
  canManage: boolean
}

const ROLE_BADGE: Record<string, string> = {
  owner: badge.teal,
  admin: badge.teal,
  support: badge.sky,
  helper: badge.sky,
}

const ROLE_LABEL: Record<string, string> = {
  owner: 'Owner',
  admin: 'Admin',
  support: 'Support',
  helper: 'Helper',
}

export default function TeamPage() {
  const [users, setUsers] = useState<TeamUser[]>([])
  const [current, setCurrent] = useState<CurrentUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [createdPassword, setCreatedPassword] = useState<{ email: string; password: string; emailed: boolean } | null>(null)
  const [form, setForm] = useState({ name: '', email: '', role: 'support' as Role })
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/team', { cache: 'no-store' })
    if (res.ok) {
      const data = await res.json()
      setUsers(data.users)
      setCurrent(data.currentUser)
    }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function createUser(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    setError('')
    setCreatedPassword(null)
    const res = await fetch('/api/admin/team', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json().catch(() => ({}))
    setCreating(false)
    if (!res.ok) {
      setError(data.error || 'Could not create operator')
      return
    }
    setForm({ name: '', email: '', role: 'support' })
    setCreatedPassword({
      email: data.email,
      password: data.temporaryPassword,
      emailed: Boolean(data.emailed),
    })
    await load()
  }

  async function patchUser(id: string, body: Record<string, unknown>) {
    setBusyId(id)
    const res = await fetch(`/api/admin/team/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    setBusyId(null)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error || 'Update failed')
      return
    }
    await load()
  }

  const inputClass =
    'w-full px-3 py-2 bg-muted border border-border rounded-md text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring'

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-muted">
          <Users className="w-4 h-4 text-foreground" />
        </div>
        <div>
          <h1 className="text-base font-bold text-foreground">Team</h1>
          <p className="text-[11px] text-muted-foreground">
            Helper admins who operate the portal. Owners can create, change roles, and deactivate accounts.
          </p>
        </div>
      </div>

      {current?.canManage && (
        <form onSubmit={createUser} className="bg-card border border-border rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <UserPlus className="w-3.5 h-3.5 text-muted-foreground" />
            <h2 className="text-[10px] font-semibold uppercase tracking-wider text-foreground">Add operator</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input className={inputClass} placeholder="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
            <input className={inputClass} type="email" placeholder="email@turboware.com" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required />
            <select className={inputClass} value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as Role }))}>
              <option value="support">Support (helper)</option>
              <option value="helper">Helper</option>
              <option value="admin">Admin</option>
              <option value="owner">Owner</option>
            </select>
            <button
              type="submit"
              disabled={creating}
              className="tw-btn-primary px-3 py-2 text-xs font-semibold rounded-md disabled:opacity-50"
            >
              {creating ? 'Creating…' : 'Create + temp password'}
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground">
            Support/helper can handle tickets, tenants, and billing. Only owner/admin can delete clients, revoke licenses, or manage this team.
          </p>
        </form>
      )}

      {createdPassword && (
        <div className="rounded-lg border border-border bg-muted px-4 py-3 text-xs">
          <p className="font-medium text-foreground">
            Temporary password for {createdPassword.email}
          </p>
          <p className="font-mono text-sm mt-1 text-foreground">{createdPassword.password}</p>
          <p className="text-[10px] text-muted-foreground mt-1">
            {createdPassword.emailed
              ? 'Also emailed. They must change it on first login.'
              : 'Email was not sent — copy this password and share it securely. They must change it on first login.'}
          </p>
        </div>
      )}

      {error && (
        <p className="text-xs text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2">{error}</p>
      )}

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-left text-[10px] text-muted-foreground uppercase tracking-wider">
                <th className="px-4 py-2.5 font-medium">Name</th>
                <th className="px-4 py-2.5 font-medium">Email</th>
                <th className="px-4 py-2.5 font-medium">Role</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium text-foreground">
                    {user.name}
                    {user.mustChangePassword && (
                      <span className="ml-2 text-[10px] text-[#C45C3A]">must change password</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-foreground">{user.email}</td>
                  <td className="px-4 py-3">
                    {current?.canManage ? (
                      <select
                        className={inputClass}
                        value={user.role}
                        disabled={busyId === user.id}
                        onChange={(e) => patchUser(user.id, { role: e.target.value })}
                      >
                        <option value="owner">Owner</option>
                        <option value="admin">Admin</option>
                        <option value="support">Support</option>
                        <option value="helper">Helper</option>
                      </select>
                    ) : (
                      <span className={`${ROLE_BADGE[user.role] ?? badge.mute} gap-1`}>
                        <Shield className="w-3 h-3" />
                        {ROLE_LABEL[user.role] ?? user.role}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={user.active ? badge.teal : badge.mute}>
                      {user.active ? 'Active' : 'Deactivated'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {current?.canManage && (
                      <button
                        type="button"
                        disabled={busyId === user.id || current.id === user.id}
                        onClick={() => patchUser(user.id, { active: !user.active })}
                        className="text-[10px] text-primary hover:underline disabled:opacity-40"
                      >
                        {user.active ? 'Deactivate' : 'Reactivate'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                    No operators yet. Create one above or run <code>scripts/create-admin.js</code>.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
