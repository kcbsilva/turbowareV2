'use client'

import { usePathname } from 'next/navigation'
import { AdminAppShell } from '@/components/admin/AdminAppShell'

function isAuthPage(pathname: string) {
  return pathname === '/admin/login' || pathname.startsWith('/admin/reset-password')
}

export function AdminChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  if (isAuthPage(pathname)) return children
  return <AdminAppShell>{children}</AdminAppShell>
}
