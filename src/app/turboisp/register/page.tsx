import { redirect } from 'next/navigation'
import { PUBLIC_TENANT_SIGNUP_ENABLED } from '@/lib/public-signup'
import { turboispAppBase } from '@/lib/signup-slug'
import { PausedSignup } from './PausedSignup'

/** Legacy Turboware route — signup lives on the TurboISP React app when enabled. */
export default function RegisterPage() {
  if (PUBLIC_TENANT_SIGNUP_ENABLED) {
    redirect(`${turboispAppBase()}/signup`)
  }

  return <PausedSignup />
}
