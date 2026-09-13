import { cookies } from 'next/headers'
import { AdminAppShell } from '@/components/admin/AdminAppShell'
import { AdminLangProvider } from '@/components/admin/AdminLangProvider'
import { COOKIE_NAME, verifyAdminToken } from '@/lib/auth'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  const isAuthenticated = token ? await verifyAdminToken(token) : false

  return (
    <AdminLangProvider>
      {isAuthenticated ? <AdminAppShell>{children}</AdminAppShell> : children}
    </AdminLangProvider>
  )
}
