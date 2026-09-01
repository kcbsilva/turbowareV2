import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { PUBLIC_TENANT_SIGNUP_ENABLED } from '@/lib/public-signup'
import { turboispAppBase } from '@/lib/signup-slug'
import logo from '../assets/TurboISP-logo.png'

/** Legacy Turboware route — signup lives on the TurboISP React app when enabled. */
export default function RegisterPage() {
  if (PUBLIC_TENANT_SIGNUP_ENABLED) {
    redirect(`${turboispAppBase()}/signup`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-sky-50 to-white text-slate-900 flex flex-col">
      <nav className="flex items-center justify-between px-6 py-4 lg:px-12 border-b border-slate-100 bg-white/85">
        <Link href="/turboisp/site" className="flex items-center">
          <Image src={logo} alt="TurboISP" priority className="h-16 w-auto -my-4" />
        </Link>
      </nav>

      <main className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="max-w-lg text-center">
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 mb-4">
            Self-serve signup is paused
          </h1>
          <p className="text-slate-600 leading-relaxed mb-8">
            We are not creating new TurboISP tenants from this site right now.
          </p>
          <Link
            href="/turboisp/site"
            className="inline-block px-6 py-3 border border-sky-600 rounded-lg font-semibold text-sky-700 hover:bg-sky-50 transition"
          >
            Back to TurboISP
          </Link>
        </div>
      </main>
    </div>
  )
}
