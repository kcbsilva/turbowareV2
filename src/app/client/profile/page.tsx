'use client'

import { useState, useEffect } from 'react'
import { User, Lock, Save, Loader2, CheckCircle } from 'lucide-react'

interface Profile {
  id: string; name: string; email: string | null
  phone: string | null; company: string | null; cnpj: string | null
}

const input = 'w-full px-3 py-2.5 rounded-lg text-sm bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#fca311]/50 focus:border-[#fca311]/50 transition'
const card  = 'bg-white/3 border border-white/8 rounded-xl p-6'

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [form, setForm]       = useState({ name: '', email: '', phone: '', company: '' })
  const [pwForm, setPwForm]   = useState({ newPassword: '', confirmPassword: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [pwSaving, setPwSaving] = useState(false)
  const [toast, setToast]     = useState<{ msg: string; ok: boolean } | null>(null)

  function flash(msg: string, ok = true) {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3500)
  }

  useEffect(() => {
    fetch('/api/client/me')
      .then(r => r.json())
      .then((d: Profile) => {
        setProfile(d)
        setForm({ name: d.name ?? '', email: d.email ?? '', phone: d.phone ?? '', company: d.company ?? '' })
      })
      .finally(() => setLoading(false))
  }, [])

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const res = await fetch('/api/client/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    if (res.ok) { flash('Profile updated'); setProfile(await res.json()) }
    else flash((await res.json().catch(() => ({}))).error || 'Failed', false)
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault()
    if (pwForm.newPassword.length < 8) { flash('Password must be at least 8 characters', false); return }
    if (pwForm.newPassword !== pwForm.confirmPassword) { flash('Passwords do not match', false); return }
    setPwSaving(true)
    const res = await fetch('/api/client/password', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newPassword: pwForm.newPassword }),
    })
    setPwSaving(false)
    if (res.ok) { flash('Password updated'); setPwForm({ newPassword: '', confirmPassword: '' }) }
    else flash((await res.json().catch(() => ({}))).error || 'Failed', false)
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[calc(100vh-56px)]">
      <Loader2 className="w-6 h-6 animate-spin text-white/30" />
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
      <h1 className="text-lg font-bold text-white">Profile</h1>

      {/* Toast */}
      {toast && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium border ${toast.ok ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-red-500/10 border-red-500/20 text-red-300'}`}>
          {toast.ok && <CheckCircle className="w-4 h-4 shrink-0" />}
          {toast.msg}
        </div>
      )}

      {/* Personal info */}
      <form onSubmit={saveProfile} className={card}>
        <div className="flex items-center gap-2 mb-5">
          <User className="w-4 h-4 text-[#fca311]" />
          <h2 className="text-sm font-semibold text-white">Personal Information</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-white/40 mb-1.5">Full Name</label>
            <input className={input} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your name" required />
          </div>
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-white/40 mb-1.5">Email</label>
            <input className={input} type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@example.com" />
          </div>
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-white/40 mb-1.5">Phone</label>
            <input className={input} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+55 11 99999-9999" />
          </div>
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-white/40 mb-1.5">Company</label>
            <input className={input} value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} placeholder="Company name" />
          </div>
          {profile?.cnpj && (
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-white/40 mb-1.5">CNPJ</label>
              <div className="px-3 py-2.5 rounded-lg text-sm font-mono text-white/40 bg-white/3 border border-white/8 cursor-not-allowed">{profile.cnpj}</div>
            </div>
          )}
        </div>

        <button type="submit" disabled={saving}
          className="mt-5 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition hover:opacity-90 disabled:opacity-40"
          style={{ backgroundColor: '#fca311', color: '#081124' }}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </form>

      {/* Change password */}
      <form onSubmit={savePassword} className={card}>
        <div className="flex items-center gap-2 mb-5">
          <Lock className="w-4 h-4 text-[#fca311]" />
          <h2 className="text-sm font-semibold text-white">Change Password</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-white/40 mb-1.5">New Password</label>
            <input className={input} type="password" value={pwForm.newPassword} onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))} placeholder="Minimum 8 characters" />
          </div>
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-white/40 mb-1.5">Confirm Password</label>
            <input className={input} type="password" value={pwForm.confirmPassword} onChange={e => setPwForm(f => ({ ...f, confirmPassword: e.target.value }))} placeholder="Repeat your new password" />
          </div>
        </div>

        <button type="submit" disabled={pwSaving}
          className="mt-5 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition hover:opacity-90 disabled:opacity-40"
          style={{ backgroundColor: '#fca311', color: '#081124' }}>
          {pwSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
          {pwSaving ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </div>
  )
}
