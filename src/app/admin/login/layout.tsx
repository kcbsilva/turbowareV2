import type { ReactNode } from 'react'
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-site',
  display: 'swap',
})

export default function AdminLoginLayout({ children }: { children: ReactNode }) {
  return <div className={`${inter.variable} contents`}>{children}</div>
}
