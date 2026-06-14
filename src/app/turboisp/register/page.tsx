import { redirect } from 'next/navigation'
import { turboispSignupUrl } from '@/lib/signup-slug'

/** Legacy Turboware route — signup lives on the TurboISP React app. */
export default function RegisterPage() {
  redirect(turboispSignupUrl())
}
