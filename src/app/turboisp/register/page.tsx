import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import {
  PUBLIC_TENANT_SIGNUP_ENABLED,
  TURBOISP_SALES_EMAIL,
  TURBOISP_SALES_MAILTO,
} from '@/lib/public-signup'
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
        <Link
          href="/admin/login"
          className="inline-flex h-9 items-center rounded-full border border-slate-800 bg-sky-400 px-4 text-sm font-semibold text-black hover:bg-sky-500 transition-colors"
        >
          Sign in
        </Link>
      </nav>

      <main className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="max-w-lg text-center">
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 mb-4">
            Self-serve signup is paused
          </h1>
          <p className="text-slate-600 leading-relaxed mb-8">
            We are not creating new TurboISP tenants from this site right now.
            Email{' '}
            <a href={TURBOISP_SALES_MAILTO} className="text-sky-700 font-semibold hover:underline">
              {TURBOISP_SALES_EMAIL}
            </a>{' '}
            and we will set you up.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={TURBOISP_SALES_MAILTO}
              className="px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 rounded-lg font-semibold text-white hover:shadow-lg hover:shadow-sky-200 transition"
            >
              Contact sales
            </a>
            <Link
              href="/turboisp/site"
              className="px-6 py-3 border border-sky-600 rounded-lg font-semibold text-sky-700 hover:bg-sky-50 transition"
            >
              Back to TurboISP
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
