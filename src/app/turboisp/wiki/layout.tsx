import type { Metadata } from 'next'
import { Inter, IBM_Plex_Mono } from 'next/font/google'
import { WikiChrome } from './_components/WikiChrome'
import './wiki.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-site',
  display: 'swap',
})

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-wiki-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Wiki',
  description:
    'Operator runbooks for TurboISP — POP, plans, subscribers, billing, provisioning, field, and the network map.',
}

export default function WikiLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${inter.variable} ${plexMono.variable} wiki-root`}>
      <script
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.classList.add('wiki-light');document.documentElement.classList.remove('dark');`,
        }}
      />
      <WikiChrome>{children}</WikiChrome>
    </div>
  )
}
