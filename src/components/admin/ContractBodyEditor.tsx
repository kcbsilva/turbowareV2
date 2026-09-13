'use client'

import { useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { Bold, Italic, List, ListOrdered } from 'lucide-react'
import type { MsgKey } from '@/lib/admin-i18n'
import { CONTRACT_VARIABLES, tokenFor } from '@/lib/contract-variables'
import { useAdminLang } from '@/components/admin/AdminLangProvider'

interface Props {
  value: string
  onChange: (html: string) => void
  placeholder?: string
}

export function ContractBodyEditor({ value, onChange, placeholder }: Props) {
  const { t } = useAdminLang()
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Placeholder.configure({ placeholder: placeholder ?? t('templates.bodyPlaceholder') }),
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class: 'contract-editor-surface min-h-[220px] px-3 py-2 text-sm text-foreground focus:outline-none',
      },
    },
    onUpdate: ({ editor: instance }) => {
      onChange(instance.getHTML())
    },
  })

  useEffect(() => {
    if (!editor) return
    const current = editor.getHTML()
    const next = value || ''
    if (normalizeHtml(current) !== normalizeHtml(next)) {
      editor.commands.setContent(next, { emitUpdate: false })
    }
  }, [editor, value])

  if (!editor) {
    return <div className="min-h-[220px] rounded-md border border-border bg-muted/40" />
  }

  return (
    <div className="overflow-hidden rounded-md border border-border bg-background">
      <div className="flex flex-wrap items-center gap-1 border-b border-border bg-muted/40 px-2 py-1.5">
        <ToolbarButton
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Bold"
        >
          <Bold className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italic"
        >
          <Italic className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="List"
        >
          <List className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Numbered list"
        >
          <ListOrdered className="h-3.5 w-3.5" />
        </ToolbarButton>
        <span className="mx-1 h-4 w-px bg-border" />
        <span className="px-1 text-[10px] uppercase tracking-wider text-muted-foreground">
          {t('templates.variables')}
        </span>
        {CONTRACT_VARIABLES.map((variable) => (
          <button
            key={variable.key}
            type="button"
            title={t(variable.labelKey as MsgKey)}
            onClick={() => editor.chain().focus().insertContent(tokenFor(variable.key)).run()}
            className="rounded-md border border-border bg-card px-1.5 py-0.5 font-mono text-[10px] text-foreground hover:bg-muted"
          >
            {variable.key}
          </button>
        ))}
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}

function ToolbarButton({
  active,
  onClick,
  title,
  children,
}: {
  active?: boolean
  onClick: () => void
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`rounded-md p-1.5 ${active ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
    >
      {children}
    </button>
  )
}

function normalizeHtml(html: string) {
  const empty = html.replace(/\s/g, '')
  if (empty === '<p></p>' || empty === '') return ''
  return html
}
