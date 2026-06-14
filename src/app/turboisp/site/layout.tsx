import { Inter } from 'next/font/google'
import './site.css'
import { SiteScrollUnlock } from './_components/SiteScrollUnlock'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-site',
  display: 'swap',
})

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${inter.variable} turboisp-site font-sans`}>
      <SiteScrollUnlock />
      {children}
    </div>
  )
}
