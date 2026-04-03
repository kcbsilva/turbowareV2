import { cookies } from 'next/headers'
import { WorktopDesktop } from '@/components/WorktopDesktop'
import { COOKIE_NAME } from '@/lib/auth'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies()
  const isAuthenticated = cookieStore.has(COOKIE_NAME)

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
