import type { ReactNode } from 'react'
import type { Metadata } from 'next'
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

export default function ClientLoginLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${sourceSans.variable} ${outfit.variable} ${sourceSans.className} dark h-full overflow-y-auto bg-black`}>
      {children}
    </div>
  )
}
