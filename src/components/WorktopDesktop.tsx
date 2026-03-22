'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { WorktopWindow } from './WorktopWindow'
import { Taskbar } from './Taskbar'

const routeTitles: Record<string, string> = {
  '/admin':          'Clients',
  '/admin/clients':  'Clients',
}

function getTitle(pathname: string) {
  if (routeTitles[pathname]) return routeTitles[pathname]
  if (pathname.startsWith('/admin/licenses/')) return 'License Detail'
  if (pathname.startsWith('/admin/clients/')) return 'Client Detail'
  return 'Turboware Admin'
}

export function WorktopDesktop({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [minimized, setMinimized] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => { setMinimized(false) }, [pathname])

  const title = getTitle(pathname)

  if (!mounted) {
    return (
      <div className="worktop-bg relative w-full h-screen overflow-hidden pb-12">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="rounded-xl shadow-2xl overflow-hidden" style={{ width: 1100, height: 680, backgroundColor: 'hsl(var(--card))' }}>
            {children}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="worktop-bg relative w-full overflow-hidden" style={{ height: '100svh' }}>
      <WorktopWindow
        id="main"
        title={`Turboware Admin — ${title}`}
        minimized={minimized}
        onMinimize={() => setMinimized(true)}
        defaultWidth={1100}
        defaultHeight={680}
      >
        {children}
      </WorktopWindow>

      <Taskbar
        windowTitle={title}
        minimized={minimized}
        onToggleMinimize={() => setMinimized((v) => !v)}
      />
    </div>
  )
}
