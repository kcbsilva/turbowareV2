import type { Metadata, ReactNode } from 'react'
import { Outfit, Source_Sans_3 } from 'next/font/google'

const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-login',
  display: 'swap',
})

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-login-heading',
  display: 'swap',
})

export const metadata: Metadata = {
  title: { absolute: 'Turboware - Login' },
}

export default function AdminLoginLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${sourceSans.variable} ${outfit.variable} ${sourceSans.className} h-full overflow-y-auto`}>
      {children}
    </div>
  )
}
