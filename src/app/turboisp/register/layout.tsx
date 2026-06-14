import { Inter } from 'next/font/google'
import '../site/site.css'
import './register.css'
import { SiteScrollUnlock } from '../site/_components/SiteScrollUnlock'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-site',
  display: 'swap',
})

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${inter.variable} turboisp-site register-page font-sans`}>
      <SiteScrollUnlock />
      {children}
    </div>
  )
}
