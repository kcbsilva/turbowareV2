import type { ReactNode } from 'react'
import { Inter } from 'next/font/google'
import '../site/site.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-site',
  display: 'swap',
})

export default function RegisterLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${inter.variable} turboisp-site font-sans`}>
      {children}
    </div>
  )
}
