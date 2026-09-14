'use client'

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react'
import TextAlign from '@tiptap/extension-text-align'
import type { MsgKey } from '@/lib/admin-i18n'
import { CONTRACT_VARIABLES, tokenFor } from '@/lib/contract-variables'
import { useAdminLang } from '@/components/admin/AdminLangProvider'

interface Props {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  showVariableChips?: boolean
}

export type ContractBodyEditorHandle = {
  insertVariable: (key: string) => void
}

export const ContractBodyEditor = forwardRef<ContractBodyEditorHandle, Props>(function ContractBodyEditor(
  { value, onChange, placeholder, showVariableChips = false },
  ref,
) {
  const { t } = useAdminLang()
  const [mode, setMode] = useState<'visual' | 'html'>('visual')
  const htmlRef = useRef<HTMLTextAreaElement>(null)
  const valueRef = useRef(value)
  const modeRef = useRef(mode)
  valueRef.current = value
  modeRef.current = mode

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      TextAlign.configure({ types: ['heading', 'paragraph'], defaultAlignment: 'left' }),
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
    if (!editor || mode !== 'visual') return
    const current = editor.getHTML()
    const next = value || ''
    if (normalizeHtml(current) !== normalizeHtml(next)) {
      editor.commands.setContent(next, { emitUpdate: false })
    }
  }, [editor, value, mode])

  function insertVariable(key: string) {
    const token = tokenFor(key)
    const useHtml = modeRef.current === 'html' || !editor
    if (useHtml) {
      const el = htmlRef.current
      const current = valueRef.current || ''
      if (!el || modeRef.current !== 'html') {
        onChange(`${current}${token}`)
        return
      }
      const start = el.selectionStart
      const end = el.selectionEnd
      const next = `${current.slice(0, start)}${token}${current.slice(end)}`
      onChange(next)
      requestAnimationFrame(() => {
        const pos = start + token.length
        el.focus()
        el.setSelectionRange(pos, pos)
      })
      return
    }
    editor.chain().focus().insertContent(token).run()
  }

  useImperativeHandle(ref, () => ({ insertVariable }), [editor, onChange])

  function switchMode(next: 'visual' | 'html') {
    if (next === mode) return
    if (next === 'visual') {
      editor?.commands.setContent(value || '', { emitUpdate: false })
    }
    setMode(next)
  }

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
          disabled={mode === 'html'}
        >
          <Bold className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italic"
          disabled={mode === 'html'}
        >
          <Italic className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          title="Underline"
          disabled={mode === 'html'}
        >
          <UnderlineIcon className="h-3.5 w-3.5" />
        </ToolbarButton>
        <span className="mx-1 h-4 w-px bg-border" />
        <ToolbarButton
          active={editor.isActive({ textAlign: 'left' })}
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          title="Align left"
          disabled={mode === 'html'}
        >
          <AlignLeft className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive({ textAlign: 'center' })}
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          title="Align center"
          disabled={mode === 'html'}
        >
          <AlignCenter className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive({ textAlign: 'right' })}
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          title="Align right"
          disabled={mode === 'html'}
        >
          <AlignRight className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive({ textAlign: 'justify' })}
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          title="Justify"
          disabled={mode === 'html'}
        >
          <AlignJustify className="h-3.5 w-3.5" />
        </ToolbarButton>
        <span className="mx-1 h-4 w-px bg-border" />
        <ToolbarButton
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="List"
          disabled={mode === 'html'}
        >
          <List className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Numbered list"
          disabled={mode === 'html'}
        >
          <ListOrdered className="h-3.5 w-3.5" />
        </ToolbarButton>
        {showVariableChips && (
          <>
            <span className="mx-1 h-4 w-px bg-border" />
            <span className="px-1 text-[10px] uppercase tracking-wider text-muted-foreground">
              {t('templates.variables')}
            </span>
            {CONTRACT_VARIABLES.map((variable) => (
              <button
                key={variable.key}
                type="button"
                title={t(variable.labelKey as MsgKey)}
                onClick={() => insertVariable(variable.key)}
                className="rounded-md border border-border bg-card px-1.5 py-0.5 font-mono text-[10px] text-foreground hover:bg-muted"
              >
                {variable.key}
              </button>
            ))}
          </>
        )}
        <div className="ml-auto flex items-center rounded-md border border-border bg-card p-0.5">
          <button
            type="button"
            onClick={() => switchMode('visual')}
            className={`rounded px-2 py-0.5 text-[10px] font-medium ${
              mode === 'visual' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t('templates.modeVisual')}
          </button>
          <button
            type="button"
            onClick={() => switchMode('html')}
            className={`rounded px-2 py-0.5 text-[10px] font-medium ${
              mode === 'html' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t('templates.modeHtml')}
          </button>
        </div>
      </div>
      {mode === 'html' && (
        <p className="border-b border-border bg-muted/20 px-3 py-1.5 text-[11px] text-muted-foreground">
          {t('templates.htmlHint')}
        </p>
      )}
      {mode === 'html' ? (
        <textarea
          ref={htmlRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          className="min-h-[280px] w-full resize-y bg-background px-3 py-2 font-mono text-xs leading-5 text-foreground focus:outline-none"
        />
      ) : (
        <EditorContent editor={editor} />
      )}
    </div>
  )
})

function ToolbarButton({
  active,
  onClick,
  title,
  children,
  disabled,
}: {
  active?: boolean
  onClick: () => void
  title: string
  children: React.ReactNode
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`rounded-md p-1.5 ${
        disabled
          ? 'cursor-not-allowed text-muted-foreground/40'
          : active
            ? 'bg-muted text-foreground'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      }`}
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
