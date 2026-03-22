'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { License, LicenseStatus } from '@prisma/client'

type LicenseWithClient = License & { client: { id: string; name: string } | null }

type Props = {
  license: LicenseWithClient
  effectiveStatus: LicenseStatus
  clients: { id: string; name: string; company: string | null }[]
}

export function LicenseActions({ license, effectiveStatus, clients }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [selectedClientId, setSelectedClientId] = useState(license.clientId || '')

  async function updateStatus(status: LicenseStatus) {
    setLoading(status)
    setError('')
    const res = await fetch(`/api/admin/licenses/${license.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setLoading(null)
    if (res.ok) router.refresh()
    else setError('Failed to update status.')
  }

  async function assignClient() {
    setLoading('client')
    setError('')
    const res = await fetch(`/api/admin/licenses/${license.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId: selectedClientId || null }),
    })
    setLoading(null)
    if (res.ok) router.refresh()
    else setError('Failed to assign client.')
  }

  async function deleteLicense() {
    if (!confirm('Delete this license permanently? This cannot be undone.')) return
    setLoading('DELETE')
    const res = await fetch(`/api/admin/licenses/${license.id}`, { method: 'DELETE' })
    if (res.ok) router.push('/admin/licenses')
    else { setLoading(null); setError('Failed to delete license.') }
  }

  const hasClientChanged = selectedClientId !== (license.clientId || '')

  return (
    <div className="space-y-3">
      {/* Client assignment */}
      <div className="bg-card border border-border rounded-lg">
        <div className="px-4 py-2.5 border-b border-border">
          <h2 className="text-[10px] font-semibold text-foreground uppercase tracking-wider">Assigned Client</h2>
        </div>
        <div className="px-4 py-3 flex items-center gap-3">
          <select
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            className="flex-1 px-3 py-1.5 bg-muted border border-border rounded-md text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">— Unassigned —</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}{c.company ? ` (${c.company})` : ''}
              </option>
            ))}
          </select>
          <button
            onClick={assignClient}
            disabled={!hasClientChanged || !!loading}
            className="px-3 py-1.5 text-xs font-medium rounded-md transition disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}
          >
            {loading === 'client' ? 'Saving…' : 'Save'}
          </button>
          {license.client && (
            <a href={`/admin/clients/${license.client.id}`} className="text-xs text-primary hover:opacity-80">
              View client →
            </a>
          )}
        </div>
      </div>

      {/* Status actions */}
      <div className="bg-card border border-border rounded-lg">
        <div className="px-4 py-2.5 border-b border-border">
          <h2 className="text-[10px] font-semibold text-foreground uppercase tracking-wider">Actions</h2>
        </div>
        <div className="px-4 py-3 flex flex-wrap gap-2">
          {effectiveStatus !== 'ACTIVE' && effectiveStatus !== 'EXPIRED' && (
            <button
              onClick={() => updateStatus('ACTIVE')}
              disabled={!!loading}
              className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-medium rounded-md transition"
            >
              {loading === 'ACTIVE' ? 'Activating…' : 'Set Active'}
            </button>
          )}
          {effectiveStatus === 'ACTIVE' && (
            <button
              onClick={() => updateStatus('SUSPENDED')}
              disabled={!!loading}
              className="px-3 py-1.5 bg-yellow-800 hover:bg-yellow-700 disabled:opacity-50 text-white text-xs font-medium rounded-md transition"
            >
              {loading === 'SUSPENDED' ? 'Suspending…' : 'Suspend'}
            </button>
          )}
          {effectiveStatus !== 'REVOKED' && (
            <button
              onClick={() => updateStatus('REVOKED')}
              disabled={!!loading}
              className="px-3 py-1.5 bg-red-900 hover:bg-red-800 disabled:opacity-50 text-white text-xs font-medium rounded-md transition"
            >
              {loading === 'REVOKED' ? 'Revoking…' : 'Revoke'}
            </button>
          )}
          <button
            onClick={deleteLicense}
            disabled={!!loading}
            className="px-3 py-1.5 border border-destructive/50 text-destructive hover:bg-destructive/10 disabled:opacity-50 text-xs font-medium rounded-md transition ml-auto"
          >
            {loading === 'DELETE' ? 'Deleting…' : 'Delete License'}
          </button>
        </div>
        {error && (
          <div className="px-4 pb-3">
            <p className="text-xs text-destructive">{error}</p>
          </div>
        )}
      </div>
    </div>
  )
}
