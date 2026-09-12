import { cookies } from 'next/headers'
import { AdminAppShell } from '@/components/admin/AdminAppShell'
import { COOKIE_NAME, verifyAdminToken } from '@/lib/auth'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  const isAuthenticated = token ? await verifyAdminToken(token) : false

  if (!isAuthenticated) {
    return <>{children}</>
  }

  return <AdminAppShell>{children}</AdminAppShell>
}
