import { AdminChrome } from '@/components/admin/AdminChrome'
import { AdminLangProvider } from '@/components/admin/AdminLangProvider'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminLangProvider>
      <AdminChrome>{children}</AdminChrome>
    </AdminLangProvider>
  )
}
