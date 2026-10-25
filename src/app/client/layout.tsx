import { ClientLangProvider } from '@/components/client/ClientLangProvider'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return <ClientLangProvider>{children}</ClientLangProvider>
}
