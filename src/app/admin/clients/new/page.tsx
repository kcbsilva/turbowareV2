'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewClientPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', notes: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handle(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/admin/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setLoading(false)
    if (res.ok) {
      const data = await res.json()
      router.push(`/admin/clients/${data.id}`)
    } else {
      const data = await res.json()
      setError(data.error || 'Failed to create client.')
    }
  }

  const inputClass =
    'w-full px-3 py-2 bg-muted border border-border rounded-md text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition'

  return (
    <div className="max-w-md">
      <div className="mb-6">
        <Link href="/admin/clients" className="text-xs text-muted-foreground hover:text-foreground mb-2 inline-block">
          ← Back to clients
        </Link>
        <h1 className="text-lg font-bold text-foreground">New Client</h1>
        <p className="text-muted-foreground text-xs mt-0.5">Add a client to assign licenses to.</p>
      </div>

      <form onSubmit={submit} className="bg-card border border-border rounded-lg p-5 space-y-4">
        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">
            Name <span className="text-destructive">*</span>
          </label>
          <input name="name" value={form.name} onChange={handle} required placeholder="Full name or alias" className={inputClass} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">Email</label>
            <input name="email" type="email" value={form.email} onChange={handle} placeholder="email@example.com" className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">Phone</label>
            <input name="phone" value={form.phone} onChange={handle} placeholder="+1 555 000 0000" className={inputClass} />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">Company</label>
          <input name="company" value={form.company} onChange={handle} placeholder="Company or organization" className={inputClass} />
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">Notes</label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handle}
            rows={3}
            placeholder="Internal notes…"
            className={`${inputClass} resize-none`}
          />
        </div>

        {error && (
          <p className="text-xs text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 text-xs font-semibold rounded-md transition disabled:opacity-50"
          style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}
        >
          {loading ? 'Creating…' : 'Create Client'}
        </button>
      </form>
    </div>
  )
}
