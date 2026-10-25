import type { Metadata } from 'next'
import { LegalDoc } from '@/app/_legal/_components/LegalDoc'
import { termsPt } from '@/app/_legal/content'

export const metadata: Metadata = { title: 'Termos de Uso' }

export default function Page() {
  return (
    <LegalDoc
      title="Termos de Uso"
      updated="Última atualização: 24 de outubro de 2026"
      sections={termsPt}
      altHref="/terms"
      altLabel="English"
      links={[{ href: '/termos', label: 'Termos de Uso' }, { href: '/privacidade', label: 'Política de Privacidade' }]}
    />
  )
}
