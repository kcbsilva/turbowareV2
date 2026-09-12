'use client'

import { SiteBackdrop } from '@/app/turboisp/site/_components/SiteBackdrop'
import { RegisterChrome } from '@/app/turboisp/register/_components/RegisterChrome'
import '@/app/turboisp/login-surface.css'
import '@/app/turboisp/register/register.css'

type Props = {
  children: React.ReactNode
  actionHref?: string
  actionLabel?: string
}

export function TurboAuthShell({ children, actionHref, actionLabel }: Props) {
  return (
    <div className="turboisp-site turbo-login register-page relative min-h-[100svh] flex flex-col font-sans">
      <div className="absolute inset-0 z-0">
        <SiteBackdrop />
      </div>
      <RegisterChrome actionHref={actionHref} actionLabel={actionLabel} />
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-10 sm:py-16">
        {children}
      </main>
    </div>
  )
}
