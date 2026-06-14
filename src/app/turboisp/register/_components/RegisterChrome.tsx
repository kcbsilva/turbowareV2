'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import logo from '../../assets/TurboISP-logo.png'

export function RegisterChrome() {
  return (
    <header className="relative z-20 turbo-nav">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <Link href="/turboisp/site" className="inline-flex items-center gap-2 text-xs text-white/45 hover:text-white transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          TurboISP
        </Link>
        <Link href="/turboisp/site" className="shrink-0">
          <Image src={logo} alt="TurboISP" height={40} className="h-9 w-auto" priority />
        </Link>
        <Link href="/client/login" className="text-xs text-white/45 hover:text-white transition-colors">
          Entrar
        </Link>
      </div>
    </header>
  )
}
