import type { Metadata } from 'next'
import { Inter, IBM_Plex_Mono } from 'next/font/google'
import { requestSiteLang } from '@/lib/request-site-lang'
import { WikiChrome } from './_components/WikiChrome'
import { wikiCopy } from './_content/strings'
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

export async function generateMetadata(): Promise<Metadata> {
  const lang = await requestSiteLang()
  return {
    title: 'Wiki',
    description: wikiCopy.indexDescription[lang],
  }
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
