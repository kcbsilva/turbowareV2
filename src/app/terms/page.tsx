import type { Metadata } from 'next'
import { LegalDoc } from '@/app/_legal/_components/LegalDoc'
import { termsEn } from '@/app/_legal/content'

export const metadata: Metadata = { title: 'Terms of Use' }

export default function Page() {
  return (
    <LegalDoc
      title="Terms of Use"
      updated="Last updated: October 24, 2026"
      sections={termsEn}
      altHref="/termos"
      altLabel="Português"
      links={[{ href: '/terms', label: 'Terms of Use' }, { href: '/privacy', label: 'Privacy Policy' }]}
    />
  )
}
