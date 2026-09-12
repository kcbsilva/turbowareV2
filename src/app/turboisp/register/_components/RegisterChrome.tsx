'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import logo from '../../assets/TurboISP-logo.png'

type Props = {
  actionHref?: string
  actionLabel?: string
}

export function RegisterChrome({
  actionHref = '/client/login',
  actionLabel = 'Entrar',
}: Props) {
  return (
    <header className="relative z-20 turbo-nav">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link href="/turboisp/site" className="inline-flex items-center gap-2 text-xs text-white/45 hover:text-white transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          TurboISP
        </Link>
        <Link
          href="/turboisp/site"
          className="reg-logo-plate shrink-0 rounded-lg bg-white px-2.5 py-1 shadow-[0_0_24px_rgba(26,171,240,0.18)]"
        >
          <Image src={logo} alt="TurboISP" height={44} className="reg-logo h-10 w-auto" priority />
        </Link>
        <Link href={actionHref} className="text-xs text-white/45 hover:text-white transition-colors">
          {actionLabel}
        </Link>
      </div>
    </header>
  )
}
