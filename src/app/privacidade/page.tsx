import type { Metadata } from 'next'
import { LegalDoc } from '@/app/_legal/_components/LegalDoc'
import { privacyPt } from '@/app/_legal/content'

export const metadata: Metadata = { title: 'Política de Privacidade' }

export default function Page() {
  return (
    <LegalDoc
      title="Política de Privacidade"
      updated="Última atualização: 24 de outubro de 2026"
      sections={privacyPt}
      altHref="/privacy"
      altLabel="English"
      links={[{ href: '/termos', label: 'Termos de Uso' }, { href: '/privacidade', label: 'Política de Privacidade' }]}
    />
  )
}
