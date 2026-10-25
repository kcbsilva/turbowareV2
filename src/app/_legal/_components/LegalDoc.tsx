import Link from 'next/link'

/**
 * Placeholders Kevin must fill before launch. Rendered highlighted so they are
 * impossible to miss on the live page. Search the repo for "LEGAL_PLACEHOLDERS".
 */
export const LEGAL_PLACEHOLDERS = {
  razaoSocial: '[RAZÃO SOCIAL]',
  cnpj: '[CNPJ]',
  endereco: '[ENDEREÇO COMPLETO]',
  dpoNome: '[NOME DO ENCARREGADO/DPO]',
  dpoEmail: '[E-MAIL DO ENCARREGADO/DPO]',
  contatoEmail: '[E-MAIL DE CONTATO]',
  foro: '[CIDADE/UF DO FORO]',
} as const

export type LegalSection = { title: string; body: string[] }

function renderText(text: string) {
  const parts = text.split(/(\[[^\]]+\])/g)
  return parts.map((p, i) =>
    /^\[[^\]]+\]$/.test(p) ? (
      <mark key={i} className="bg-amber-200 text-slate-900 px-1 rounded">{p}</mark>
    ) : (
      <span key={i}>{p}</span>
    ),
  )
}

export function LegalDoc({
  title,
  updated,
  sections,
  altHref,
  altLabel,
  links,
}: {
  title: string
  updated: string
  sections: LegalSection[]
  altHref: string
  altLabel: string
  links: { href: string; label: string }[]
}) {
  return (
    <div className="min-h-screen bg-white text-slate-800">
      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-8 text-sm">
          <Link href="/turboisp/site" className="text-sky-700 hover:underline">TurboISP</Link>
          <Link href={altHref} className="text-sky-700 hover:underline">{altLabel}</Link>
        </div>
        <h1 className="text-3xl font-bold mb-2">{title}</h1>
        <p className="text-sm text-slate-500 mb-10">{updated}</p>
        {sections.map((s) => (
          <section key={s.title} className="mb-8">
            <h2 className="text-xl font-semibold mb-3">{s.title}</h2>
            {s.body.map((para, i) => (
              <p key={i} className="mb-3 leading-relaxed">{renderText(para)}</p>
            ))}
          </section>
        ))}
        <nav className="mt-12 pt-6 border-t border-slate-200 flex gap-6 text-sm">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-sky-700 hover:underline">{l.label}</Link>
          ))}
        </nav>
      </main>
    </div>
  )
}
