import { cookies } from 'next/headers'
import { WorktopDesktop } from '@/components/WorktopDesktop'
import { COOKIE_NAME, verifyAdminToken } from '@/lib/auth'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  const isAuthenticated = token ? await verifyAdminToken(token) : false

  // Don't render the taskbar/desktop shell on the login page
  if (!isAuthenticated) {
    return <>{children}</>
  }

  return (
    <WorktopDesktop>
      <div className="h-full overflow-auto window-scroll">
        {children}
      </div>
    </WorktopDesktop>
  )
}
