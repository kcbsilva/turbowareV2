'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { RefreshCw } from 'lucide-react'

import { ClientHeader } from './ClientHeader'
import { ClientSidebar, type ClientTab } from './ClientSidebar'
import { OverviewTab } from './tabs/OverviewTab'
import { LicensesTab } from './tabs/LicensesTab'
import { BillingTab } from './tabs/BillingTab'
import { NotesTab } from './tabs/NotesTab'
import { HistoryTab } from './tabs/HistoryTab'

interface Client {
  id: string
  name: string
  email: string | null
  emailVerified: boolean
  mustChangePassword: boolean
  phone: string | null
  company: string | null
  cnpj: string | null
  internalNotes: string | null
  hasPassword?: boolean
  createdAt: string
  updatedAt: string
  licenses: {
    id: string
    key: string
    product: string
    status: 'ACTIVE' | 'SUSPENDED' | 'REVOKED' | 'EXPIRED'
    expiresAt: string | null
    maxSeats: number
    createdAt: string
    updatedAt: string
    _count: { activations: number }
  }[]
  clientNotes: {
    id: string
    body: string
    author: string
    createdAt: string
  }[]
}

export default function ClientProfilePage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<ClientTab>('overview')

  const load = useCallback(async () => {
    setLoading(true); setError('')
    const res = await fetch(`/api/admin/clients/${params.id}`, { cache: 'no-store' })
    if (res.ok) {
      setClient(await res.json())
    } else {
      setError('Could not load client.')
    }
    setLoading(false)
  }, [params.id])

  useEffect(() => { load() }, [load])

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <RefreshCw className="w-5 h-5 text-muted-foreground animate-spin" />
      </div>
    )
  }

  if (error || !client) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3 text-muted-foreground text-xs">
        <p>{error || 'Client not found.'}</p>
        <div className="flex gap-3">
          <button onClick={load} className="text-primary hover:underline">Retry</button>
          <Link href="/admin/clients" className="text-primary hover:underline">← All Clients</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-full flex overflow-hidden">
      {/* Header bar */}
      <ClientHeader
        clientId={client.id}
        name={client.name}
        company={client.company}
        createdAt={client.createdAt}
      />

      {/* Sidebar */}
      <ClientSidebar active={activeTab} onSelect={setActiveTab} />

      {/* Tab content */}
      <main className="flex-1 overflow-y-auto window-scroll pt-10 p-6">
        {activeTab === 'overview' && (
          <OverviewTab client={client} />
        )}
        {activeTab === 'licenses' && (
          <LicensesTab clientId={client.id} licenses={client.licenses} />
        )}
        {activeTab === 'billing' && (
          <BillingTab clientId={client.id} />
        )}
        {activeTab === 'notes' && (
          <NotesTab clientId={client.id} initialNotes={client.clientNotes} />
        )}
        {activeTab === 'history' && (
          <HistoryTab client={client} licenses={client.licenses} notes={client.clientNotes} />
        )}
      </main>
    </div>
  )
}
