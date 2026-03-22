import { WorktopDesktop } from '@/components/WorktopDesktop'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <WorktopDesktop>
      <div className="h-full overflow-auto window-scroll">
        {children}
      </div>
    </WorktopDesktop>
  )
}
