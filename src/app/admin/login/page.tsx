import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { COOKIE_NAME, verifyAdminToken } from '@/lib/auth'
import LoginForm from './LoginForm'

export default async function LoginPage() {
  const cookieStore = cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (token) {
    const isAuthenticated = await verifyAdminToken(token)
    if (isAuthenticated) redirect('/admin')
  }
  return <LoginForm />
}
