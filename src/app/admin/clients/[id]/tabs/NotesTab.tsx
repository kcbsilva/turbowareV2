'use client'

import { useState } from 'react'
import { ClipboardList, Plus, Trash2, Send } from 'lucide-react'

interface Note {
  id: string
  body: string
  author: string
  createdAt: string
}

interface Props {
  clientId: string
  initialNotes: Note[]
}

export function NotesTab({ clientId, initialNotes }: Props) {
  const [notes, setNotes] = useState<Note[]>(initialNotes)
  const [body, setBody] = useState('')
  const [posting, setPosting] = useState(false)
  const [error, setError] = useState('')

  async function addNote(e: React.FormEvent) {
    e.preventDefault()
    if (!body.trim()) return
    setPosting(true); setError('')
    const res = await fetch(`/api/admin/clients/${clientId}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body }),
    })
    setPosting(false)
    if (res.ok) {
      const note = await res.json()
      setNotes((prev) => [note, ...prev])
      setBody('')
    } else {
      setError('Failed to post note.')
    }
  }

  async function deleteNote(id: string) {
    const res = await fetch(`/api/admin/clients/${clientId}/notes?noteId=${id}`, { method: 'DELETE' })
    if (res.ok) setNotes((prev) => prev.filter((n) => n.id !== id))
  }

  return (
    <div className="space-y-4">
      {/* Add note form */}
      <form onSubmit={addNote} className="bg-card border border-border rounded-lg p-4">
        <label className="block text-[10px] text-muted-foreground uppercase tracking-wider mb-2">New Note</label>
        <div className="flex gap-2">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={2}
            placeholder="Add an internal note about this client…"
            className="flex-1 px-3 py-2 bg-muted border border-border rounded-md text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
          <button
            type="submit"
            disabled={posting || !body.trim()}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-md self-end transition disabled:opacity-40"
            style={{ backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }}
          >
            <Send size={12} />
            {posting ? 'Posting…' : 'Post'}
          </button>
        </div>
        {error && <p className="text-xs text-destructive mt-2">{error}</p>}
      </form>

      {/* Notes list */}
      {notes.length === 0 ? (
        <div className="bg-card border border-border rounded-lg px-6 py-10 flex flex-col items-center gap-2 text-muted-foreground">
          <ClipboardList className="w-8 h-8 opacity-20" />
          <p className="text-xs">No notes yet. Add one above.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notes.map((note) => (
            <div key={note.id} className="bg-card border border-border rounded-lg px-4 py-3 flex gap-3">
              {/* Avatar */}
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-[10px] font-bold text-primary">{note.author[0]?.toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[10px] font-semibold text-foreground">{note.author}</span>
                  <span className="text-[10px] text-muted-foreground">{new Date(note.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-xs text-foreground whitespace-pre-wrap leading-relaxed">{note.body}</p>
              </div>
              <button
                onClick={() => deleteNote(note.id)}
                className="text-muted-foreground/40 hover:text-destructive transition shrink-0 mt-0.5"
                aria-label="Delete note"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
